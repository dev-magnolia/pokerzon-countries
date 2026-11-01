// Refreshes the stale REST Countries v2 fields of data/country.json from current sources:
//   population  → World Bank SP.POP.TOTL (via github.com/datasets/population), the latest year per country
//   timezones   → the IANA tz database (zone.tab of the system tzdata): the standard UTC offsets of the zones
//                 assigned to the country; external territories have their own ISO codes, so they drop out
//   overrides   → data/overrides.json (hand corrections with a reason)
// Usage: node scripts/update-reference-data.mjs [population.csv] [zone.tab]
//   population.csv: default downloads https://raw.githubusercontent.com/datasets/population/main/data/population.csv
//   zone.tab:       default /usr/share/zoneinfo/zone.tab
import { readFileSync, writeFileSync } from "node:fs";

const POP_URL = "https://raw.githubusercontent.com/datasets/population/main/data/population.csv";
const [popArg, zoneArg = "/usr/share/zoneinfo/zone.tab"] = process.argv.slice(2);
/** Zones left out: unofficial or uninhabited (research stations). */
const MINOR_ZONES = new Set([
  "Australia/Eucla", // unofficial
  "Australia/Lord_Howe", // ~400 people
  "Antarctica/Macquarie", // research station
  "Asia/Urumqi", // unofficial; China keeps one official time (UTC+8)
]);
/** World Bank codes that differ from the ISO alpha-3 in country.json. */
const WB_CODES = { KOS: "XKX" };

const dataUrl = (f) => new URL(`../data/${f}`, import.meta.url);
const countries = JSON.parse(readFileSync(dataUrl("country.json"), "utf8"));
const overrides = JSON.parse(readFileSync(dataUrl("overrides.json"), "utf8"));

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

async function population() {
  const text = popArg ? readFileSync(popArg, "utf8") : await (await fetch(POP_URL)).text();
  const latest = new Map(); // alpha3 → { year, value }
  for (const line of text.split("\n").slice(1)) {
    if (!line.trim()) continue;
    const [, code, year, value] = parseCsvLine(line);
    const y = Number(year);
    const v = Math.round(Number(value));
    if (!code || !Number.isFinite(y) || !Number.isFinite(v)) continue;
    const prev = latest.get(code);
    if (!prev || y > prev.year) latest.set(code, { year: y, value: v });
  }
  return latest;
}

/** Standard (non-DST) offset of an IANA zone, "UTC+09:30" / "UTC-03:00" / "UTC". */
function standardOffset(zone) {
  const minutes = (date) => {
    const part = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName").value; // "GMT+09:30" or "GMT"
    const m = part.match(/GMT([+-])(\d{2}):(\d{2})/);
    return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
  };
  const std = Math.min(minutes(new Date(Date.UTC(2026, 0, 15))), minutes(new Date(Date.UTC(2026, 6, 15))));
  if (std === 0) return "UTC";
  const sign = std < 0 ? "-" : "+";
  const abs = Math.abs(std);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

function zonesByCountry() {
  const map = new Map(); // alpha2 → zone ids
  for (const line of readFileSync(zoneArg, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    const [code, , zone] = line.split("\t");
    if (!code || !zone || MINOR_ZONES.has(zone)) continue;
    if (!map.has(code)) map.set(code, []);
    map.get(code).push(zone);
  }
  return map;
}

const offsetMinutes = (o) => {
  const m = o.match(/UTC([+-])(\d{2}):(\d{2})/);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
};

const pop = await population();
const zones = zonesByCountry();
const report = { population: 0, populationMissing: [], timezones: 0, timezonesMissing: [], overrides: [] };

/** The new values per country (alpha2 → field → value; null = remove the field). */
const updates = new Map();
for (const c of countries) {
  const u = {};
  const p = pop.get(WB_CODES[c.alpha3Code] ?? c.alpha3Code);
  if (p) {
    Object.assign(u, { population: p.value, populationYear: p.year, populationSource: "World Bank" });
    report.population++;
  } else report.populationMissing.push(c.alpha2Code);

  const ids = zones.get(c.alpha2Code);
  if (ids?.length) {
    u.timezones = [...new Set(ids.map(standardOffset))].sort((a, b) => offsetMinutes(a) - offsetMinutes(b));
    u.timezoneIds = ids;
    report.timezones++;
  } else report.timezonesMissing.push(c.alpha2Code);

  const o = overrides[c.alpha2Code];
  if (o) {
    for (const [k, v] of Object.entries(o)) if (!k.startsWith("_")) u[k] = v;
    report.overrides.push(c.alpha2Code);
  }
  updates.set(c.alpha2Code, u);
}

// Patch the file line by line (keeps its layout: inline arrays, "33.0" numbers) instead of re-serializing.
const fmt = (v) => JSON.stringify(v).replace(/","/g, '", "');
const lines = readFileSync(dataUrl("country.json"), "utf8").split("\n");
const out = [];
let current = null; // the updates of the country being read
const done = new Set(); // fields written for the current country
const after = { population: ["populationYear", "populationSource"], timezones: ["timezoneIds"] };
for (const line of lines) {
  const code = line.match(/^    "alpha2Code": "([A-Z]{2})",$/);
  if (code) {
    current = updates.get(code[1]) ?? null;
    done.clear();
  }
  const field = line.match(/^    "(\w+)": (.*?)(,?)$/);
  if (current && field && field[1] in current) {
    const [, name, , comma] = field;
    // old copies of the added fields (a re-run) are dropped; they are re-added after their anchor
    if (["populationYear", "populationSource", "timezoneIds"].includes(name)) continue;
    const value = current[name];
    if (value !== null) out.push(`    "${name}": ${fmt(value)}${comma}`);
    done.add(name);
    for (const extra of after[name] ?? []) {
      if (extra in current && current[extra] !== null) out.push(`    "${extra}": ${fmt(current[extra])},`);
      done.add(extra);
    }
    if (value === null && !comma && out.length) out[out.length - 1] = out[out.length - 1].replace(/,$/, "");
    continue;
  }
  if (current && field && ["populationYear", "populationSource", "timezoneIds"].includes(field[1])) continue;
  out.push(line);
}
writeFileSync(dataUrl("country.json"), out.join("\n"));
JSON.parse(readFileSync(dataUrl("country.json"), "utf8")); // still valid JSON
console.log(JSON.stringify(report, null, 1));
