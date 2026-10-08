/**
 * @pokerzon/countries — country reference data and helpers.
 * Data: data/country.json (250 countries) and data/usa.json (51 US states).
 */
import { countries, usaStates } from "./generated/data.js";
import type { Country, CountryLike, UsaState } from "./types.js";

export type { Country, CountryLike, Currency, Language, RegionalBloc, UsaState } from "./types.js";
export { countries, usaStates };

const ALL: CountryLike[] = [...countries, ...usaStates];

/** Text → slug: lowercase, no accents, hyphens ("Viet Nam" → "viet-nam"). */
export function stringToSlug(str: string): string {
  if (!str) return "";
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[._/,:;·]/g, "-")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** All countries and, by default, the US states. */
export function getCountries(options: { includeUsaStates?: boolean } = {}): CountryLike[] {
  return options.includeUsaStates === false ? countries : ALL;
}

/**
 * Finds a country by alpha-2, alpha-3, name, displayName, name slug or any altSpellings, case-insensitive.
 * "KR", "kor", "South Korea", "korea-republic-of" → Korea (Republic of).
 */
export function getCountry(code: string | null | undefined): CountryLike | null {
  if (!code) return null;
  const c = code.trim().toLowerCase();
  const slug = stringToSlug(code);
  return (
    ALL.find(
      (x) =>
        x.alpha2Code.toLowerCase() === c ||
        x.alpha3Code.toLowerCase() === c ||
        x.name.toLowerCase() === c ||
        x.displayName.toLowerCase() === c ||
        stringToSlug(x.name) === slug ||
        stringToSlug(x.displayName) === slug ||
        ("altSpellings" in x && !!x.altSpellings?.some((alt) => alt.toLowerCase() === c))
    ) ?? null
  );
}

/** Memoized getCountry, for large tables. */
export function getCountryMemo(): (code: string | null | undefined) => CountryLike | null {
  const memo = new Map<string, CountryLike | null>();
  return (code) => {
    if (!code) return null;
    if (!memo.has(code)) memo.set(code, getCountry(code));
    return memo.get(code) ?? null;
  };
}

/** Short display name: "KR" → "South Korea". */
export function getCountryName(code: string | null | undefined): string | null {
  return getCountry(code)?.displayName ?? null;
}

const nameCache = new Map<string, string | null>();
/** Cached getCountryName. */
export function getCountryNameCached(code: string | null | undefined): string | null {
  if (!code) return null;
  if (!nameCache.has(code)) nameCache.set(code, getCountryName(code));
  return nameCache.get(code) ?? null;
}

/** Two-letter code → flag emoji (two regional indicator symbols): "KR" → "🇰🇷". */
export function alpha2ToFlagEmoji(alpha2: string): string {
  if (!/^[A-Za-z]{2}$/.test(alpha2)) return "";
  return String.fromCodePoint(...alpha2.toUpperCase().split("").map((ch) => 0x1f1a5 + ch.charCodeAt(0)));
}

/**
 * Flag emoji from any code or name: "KR", "KOR", "South Korea" → "🇰🇷"; a US state → "🇺🇸".
 * Empty string if unknown. Browsers on Windows show the two letters instead (use a flag-emoji web font if needed).
 */
export function getFlagEmoji(code: string | null | undefined): string {
  return getCountry(code)?.flag ?? "";
}

/** ISO 3166-1 alpha-3 → alpha-2 ("KOR" → "KR"). */
export function alpha3ToAlpha2(alpha3: string): string | null {
  const a = alpha3?.toLowerCase();
  return countries.find((x) => x.alpha3Code.toLowerCase() === a)?.alpha2Code ?? null;
}

/** Main currency (ISO 4217): "KR" → "KRW". */
export function getMainCurrency(code: string | null | undefined): string | null {
  return getCountry(code)?.currencies?.[0]?.code ?? null;
}

export function isUsaState(x: CountryLike): x is UsaState {
  return x.alpha3Code.startsWith("USA-");
}
export function isCountry(x: CountryLike): x is Country {
  return !isUsaState(x);
}
