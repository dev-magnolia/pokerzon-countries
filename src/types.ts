/** Currency (ISO 4217). */
export interface Currency {
  code: string | null;
  name: string | null;
  symbol: string | null;
}

/** Language (ISO 639). */
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

/** A country in country.json (ISO 3166-1). */
export interface Country {
  /** Official English name, sometimes long: "Korea (Republic of)". */
  name: string;
  /** Short display name: "South Korea". */
  displayName: string;
  /** ISO 3166-1 alpha-2: "KR" — the key. */
  alpha2Code: string;
  /** ISO 3166-1 alpha-3: "KOR". */
  alpha3Code: string;
  numericCode?: string;
  /** Olympic (IOC) code. */
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
  /** UTC offsets ("UTC+09:00"), not IANA time zones. */
  timezones: string[];
  currencies: Currency[];
  languages: Language[];
  callingCodes: string[];
  topLevelDomain: string[];
  /** Neighbours, alpha-3 codes. */
  borders?: string[];
  regionalBlocs?: RegionalBloc[];
  /** Flag emoji: "🇰🇷". */
  flag: string;
}

/** A US state as a country-like record (usa.json): alpha3Code "USA-NV", alpha2Code "NV". */
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
  /** Always 🇺🇸. */
  flag: string;
}

export type CountryLike = Country | UsaState;
