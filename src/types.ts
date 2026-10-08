/** Pénznem (ISO 4217). */
export interface Currency {
  code: string | null;
  name: string | null;
  symbol: string | null;
}

/** Nyelv (ISO 639). */
export interface Language {
  iso639_1?: string;
  iso639_2: string;
  name: string;
  nativeName: string;
}

export interface RegionalBloc {
  acronym: string;
  name: string;
  otherAcronyms: string[];
  otherNames: string[];
}

/** Egy ország a country.json-ban (ISO 3166-1). */
export interface Country {
  /** Hivatalos angol név, néha hosszú: "Korea (Republic of)". */
  name: string;
  /** Rövid megjelenítési név: "South Korea". */
  displayName: string;
  /** ISO 3166-1 alpha-2: "KR" — a kulcs. */
  alpha2Code: string;
  /** ISO 3166-1 alpha-3: "KOR". */
  alpha3Code: string;
  numericCode?: string;
  /** Olimpiai kód. */
  cioc?: string;
  nativeName: string;
  altSpellings?: string[];
  /** de · es · fr · ja · it · br · pt · nl · hr · fa */
  translations: Record<string, string | null>;
  capital?: string;
  demonym?: string;
  /** Africa · Americas · Europe · Asia · Oceania · Polar */
  region?: string;
  subregion?: string;
  latlng?: number[];
  area?: number | null;
  population: number;
  gini?: number;
  /** UTC-eltolások ("UTC+09:00") — nem IANA. */
  timezones: string[];
  currencies: Currency[];
  languages: Language[];
  callingCodes: string[];
  topLevelDomain: string[];
  /** Szomszédok alpha-3 kódja. */
  borders?: string[];
  regionalBlocs?: RegionalBloc[];
  /** Zászló emojiként: "🇰🇷". */
  flag: string;
}

/** Amerikai állam ország-szerű rekordként (usa.json): alpha3Code "USA-NV", alpha2Code "NV". */
export interface UsaState {
  name: string;
  displayName: string;
  alpha2Code: string;
  alpha3Code: string;
  capital?: string;
  region: string;
  subregion: string;
  population: number;
  latlng: number[];
  currencies: Currency[];
  languages: Language[];
  timezones: string[];
  /** Mindig 🇺🇸. */
  flag: string;
}

export type CountryLike = Country | UsaState;
