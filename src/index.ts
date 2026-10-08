/**
 * @pokerzon/countries — ország-törzsadat és segédfüggvények minden POKERZON projekthez.
 * Adat: data/country.json (250 ország) és data/usa.json (51 amerikai állam).
 * Döntések: zászló emojiként (D-077), ország-kód ISO alpha-2 (T-04) — pokerzon-docs wiki.
 */
import { countries, usaStates } from "./generated/data.js";
import type { Country, CountryLike, UsaState } from "./types.js";

export type { Country, CountryLike, Currency, Language, RegionalBloc, UsaState } from "./types.js";
export { countries, usaStates };

const ALL: CountryLike[] = [...countries, ...usaStates];

/** Szövegből slug: kisbetű, ékezet nélkül, kötőjellel ("Viet Nam" → "viet-nam"). */
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

/** Az országok és (alapból) az amerikai államok. */
export function getCountries(options: { includeUsaStates?: boolean } = {}): CountryLike[] {
  return options.includeUsaStates === false ? countries : ALL;
}

/**
 * Ország keresése alpha-2, alpha-3, név, displayName, név-slug vagy bármely altSpellings szerint,
 * kis- és nagybetűtől függetlenül. "KR", "kor", "South Korea", "korea-republic-of" → Korea (Republic of).
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

/** Gyorsítótárazott getCountry — nagy táblákhoz (pl. játékosok országa). */
export function getCountryMemo(): (code: string | null | undefined) => CountryLike | null {
  const memo = new Map<string, CountryLike | null>();
  return (code) => {
    if (!code) return null;
    if (!memo.has(code)) memo.set(code, getCountry(code));
    return memo.get(code) ?? null;
  };
}

/** Rövid megjelenítési név: "KR" → "South Korea". */
export function getCountryName(code: string | null | undefined): string | null {
  return getCountry(code)?.displayName ?? null;
}

const nameCache = new Map<string, string | null>();
/** Gyorsítótárazott getCountryName. */
export function getCountryNameCached(code: string | null | undefined): string | null {
  if (!code) return null;
  if (!nameCache.has(code)) nameCache.set(code, getCountryName(code));
  return nameCache.get(code) ?? null;
}

/** Két betűs kód → zászló emoji (két regional indicator karakter): "KR" → "🇰🇷". */
export function alpha2ToFlagEmoji(alpha2: string): string {
  if (!/^[A-Za-z]{2}$/.test(alpha2)) return "";
  return String.fromCodePoint(...alpha2.toUpperCase().split("").map((ch) => 0x1f1a5 + ch.charCodeAt(0)));
}

/**
 * Zászló emoji (D-077) bármilyen kódból vagy névből: "KR", "KOR", "South Korea" → "🇰🇷"; USA-állam → "🇺🇸".
 * Ismeretlen kódra üres string. Windowson a böngészők alapból a két betűt mutatják (opcionális webfont).
 */
export function getFlagEmoji(code: string | null | undefined): string {
  return getCountry(code)?.flag ?? "";
}

/** ISO 3166-1 alpha-3 → alpha-2 ("KOR" → "KR"); a legacy PEL-kódok leképezéséhez. */
export function alpha3ToAlpha2(alpha3: string): string | null {
  const a = alpha3?.toLowerCase();
  return countries.find((x) => x.alpha3Code.toLowerCase() === a)?.alpha2Code ?? null;
}

/** Az ország fő pénzneme (ISO 4217): "KR" → "KRW". */
export function getMainCurrency(code: string | null | undefined): string | null {
  return getCountry(code)?.currencies?.[0]?.code ?? null;
}

export function isUsaState(x: CountryLike): x is UsaState {
  return x.alpha3Code.startsWith("USA-");
}
export function isCountry(x: CountryLike): x is Country {
  return !isUsaState(x);
}
