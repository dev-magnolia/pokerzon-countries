# @pokerzon/countries

Country reference data and small, typed helpers — used across the POKERZON projects.

- **250 countries** (ISO 3166-1) and **51 US states** as country-like records: official and short display names, ISO codes, capital, region, currencies, languages, translations, coordinates.
- **Flags as emoji** (🇰🇷) instead of images: nothing to download, renders instantly in large tables.
- Dependency-free TypeScript, ESM, with type definitions.

## Install

```bash
npm install github:dev-magnolia/pokerzon-countries#v0.1.1
```

The package is built during install (`prepare` script).

## Usage

```ts
import { getCountry, getCountryName, getFlagEmoji, getMainCurrency } from "@pokerzon/countries";

getCountryName("KR");                         // "South Korea" — alpha-2, alpha-3, name, slug or alt spelling
getFlagEmoji("VNM");                          // "🇻🇳"
getMainCurrency("TW");                        // "TWD"
getCountry("korea-republic-of")?.alpha3Code;  // "KOR"
```

The raw data is exported too: `import countries from "@pokerzon/countries/country.json"`.

## API

| Function | Returns | Description |
|---|---|---|
| `getCountries({ includeUsaStates })` | `CountryLike[]` | All countries, with the US states by default (301); `includeUsaStates: false` → 250 |
| `getCountry(code)` | `CountryLike \| null` | Lookup by alpha-2, alpha-3, name, `displayName`, name slug or any `altSpellings`, case-insensitive |
| `getCountryMemo()` | `(code) => CountryLike \| null` | Memoized `getCountry` for large tables |
| `getCountryName(code)` | `string \| null` | Short display name: `KR` → `South Korea` |
| `getCountryNameCached(code)` | `string \| null` | Cached `getCountryName` |
| `getFlagEmoji(code)` | `string` | Flag emoji from any code or name; empty string if unknown |
| `alpha2ToFlagEmoji(alpha2)` | `string` | Two letters → flag emoji, without lookup |
| `alpha3ToAlpha2(alpha3)` | `string \| null` | `KOR` → `KR` |
| `getMainCurrency(code)` | `string \| null` | Main currency, ISO 4217: `KR` → `KRW` |
| `isUsaState(x)` · `isCountry(x)` | type guard | Country or US state |
| `stringToSlug(str)` | `string` | `Viet Nam` → `viet-nam` |
| `countries` · `usaStates` | `Country[]` · `UsaState[]` | The raw arrays, typed |

Types: `Country`, `UsaState`, `CountryLike`, `Currency`, `Language`, `RegionalBloc`.

## Data

- `data/country.json` — 250 countries. Fields: `name`, `displayName`, `alpha2Code`, `alpha3Code`, `numericCode`, `cioc`, `nativeName`, `altSpellings`, `translations` (de, es, fr, ja, it, br, pt, nl, hr, fa), `capital`, `demonym`, `region`, `subregion`, `latlng`, `area`, `population`, `gini`, `timezones` (UTC offsets, not IANA), `currencies`, `languages`, `callingCodes`, `topLevelDomain`, `borders`, `regionalBlocs`, `flag` (emoji).
- `data/usa.json` — 51 US states (`alpha3Code`: `USA-NV` …, `flag`: 🇺🇸).
- `displayName` differs from `name` in 12 cases: United Kingdom, Bolivia, Iran, Macedonia, North Korea, South Korea, Moldova, Russia, Venezuela, Vietnam, Laos, Macau.
- Flag emoji are not rendered as flags by browsers on Windows (two letters are shown); load a flag-emoji web font there if needed.

## Development

```bash
npm install
npm test          # node:test + tsx
npm run build     # data/*.json → src/generated/data.ts → dist/
```

Release: bump the version in `package.json`, commit, `git tag vX.Y.Z`, push with tags. Projects pin the tag.

## License

Code: MIT (see `LICENSE`). Country data in `data/country.json`: derived from [REST Countries](https://gitlab.com/restcountries/restcountries), MPL-2.0 — see `NOTICE` for the changes made.
