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

// ── Flags ────────────────────────────────────────────────────────────────────
// Three ways to show a flag; pick per place:
//  1. emoji (country.flag / getFlagEmoji) — no download, fastest; not rendered on Windows Chrome/Edge;
//  2. emoji + polyfillFlagEmojis() — loads a 77 kB flag font only where emoji flags are missing;
//  3. SVG (getFlagSvgUrl / getFlagSvgPath) — identical everywhere, one small file per flag (flag-icons).

import { polyfillCountryFlagEmojis } from "country-flag-emoji-polyfill";
import { VERSION } from "./generated/version.js";

export { VERSION };

/** Font family injected by the polyfill; put it first in font-family where flags should render. */
export const FLAG_EMOJI_FONT_FAMILY = "Twemoji Country Flags";

/** CDN base of this package's files (jsDelivr, from the public GitHub repo, pinned to this version). */
export const CDN_BASE_URL = `https://cdn.jsdelivr.net/gh/dev-magnolia/pokerzon-countries@v${VERSION}`;

/** Default URL of the flag font used by the polyfill (served from this package's own repo). */
export const FLAG_EMOJI_FONT_URL = `${CDN_BASE_URL}/assets/TwemojiCountryFlags.woff2`;

/**
 * Makes emoji flags render on browsers that support emoji but not flag emoji (Chromium on Windows):
 * injects a @font-face for "Twemoji Country Flags" (77 kB, loaded only there). Call once on the client.
 * Then use `font-family: "Twemoji Country Flags", <your fonts>` where flags appear.
 * Returns true if the font was injected. Safe to call during SSR (does nothing, returns false).
 */
export function polyfillFlagEmojis(options: { fontName?: string; fontUrl?: string } = {}): boolean {
  const g = globalThis as { window?: unknown; document?: unknown };
  if (typeof g.window === "undefined" || typeof g.document === "undefined") return false;
  return polyfillCountryFlagEmojis(options.fontName ?? FLAG_EMOJI_FONT_FAMILY, options.fontUrl ?? FLAG_EMOJI_FONT_URL);
}

export type FlagRatio = "4x3" | "1x1";

/** The flag's SVG path inside this package, e.g. "flags/4x3/kr.svg"; a US state → the US flag. Null if unknown. */
export function getFlagSvgPath(code: string | null | undefined, ratio: FlagRatio = "4x3"): string | null {
  const c = getCountry(code);
  if (!c) return null;
  const a2 = isUsaState(c) ? "us" : c.alpha2Code.toLowerCase();
  return `flags/${ratio}/${a2}.svg`;
}

/**
 * The flag's SVG URL. By default from the CDN (jsDelivr, pinned to this version); pass `baseUrl` to self-host
 * (copy node_modules/@pokerzon/countries/flags into your public folder, then e.g. baseUrl: "/assets").
 * "KR" → https://cdn.jsdelivr.net/gh/dev-magnolia/pokerzon-countries@v0.2.0/flags/4x3/kr.svg
 */
export function getFlagSvgUrl(
  code: string | null | undefined,
  options: { ratio?: FlagRatio; baseUrl?: string } = {}
): string | null {
  const path = getFlagSvgPath(code, options.ratio ?? "4x3");
  if (!path) return null;
  return `${(options.baseUrl ?? CDN_BASE_URL).replace(/\/$/, "")}/${path}`;
}

// ── Flagpack (flag.vercel.app) ───────────────────────────────────────────────
// 4th option: Flagpack designs (flagpack.xyz, MIT) in three fixed pixel sizes, served by the free
// flag.vercel.app API: /{s|m|l}/{ALPHA2}.svg — e.g. https://flag.vercel.app/m/SG.svg
// No SLA (a free community endpoint). To self-host, copy node_modules/flagpack-core/svg (same paths) and pass baseUrl.

export type FlagpackSize = "s" | "m" | "l";

/** Pixel size of each Flagpack size (width × height, 4:3). */
export const FLAGPACK_SIZES: Record<FlagpackSize, { width: number; height: number }> = {
  s: { width: 16, height: 12 },
  m: { width: 20, height: 15 },
  l: { width: 32, height: 24 },
};

export const FLAGPACK_BASE_URL = "https://flag.vercel.app";

/** Codes that Flagpack names differently, and the ones it does not have. */
const FLAGPACK_ALIAS: Record<string, string> = { GB: "GB-UKM", BQ: "BQ-BO" };
const FLAGPACK_MISSING = new Set(["XK"]);

/**
 * Flagpack flag URL: "SG" → https://flag.vercel.app/m/SG.svg. Accepts any code or name; a US state → US.
 * Null if unknown or not in Flagpack (Kosovo). Self-hosted: { baseUrl: "/flags/flagpack" }.
 */
export function getFlagpackUrl(
  code: string | null | undefined,
  options: { size?: FlagpackSize; baseUrl?: string } = {}
): string | null {
  const c = getCountry(code);
  if (!c) return null;
  const a2 = isUsaState(c) ? "US" : c.alpha2Code.toUpperCase();
  if (FLAGPACK_MISSING.has(a2)) return null;
  const name = FLAGPACK_ALIAS[a2] ?? a2;
  return `${(options.baseUrl ?? FLAGPACK_BASE_URL).replace(/\/$/, "")}/${options.size ?? "m"}/${name}.svg`;
}
