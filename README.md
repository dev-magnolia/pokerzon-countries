# @pokerzon/countries

Country reference data and small, typed helpers — used across the POKERZON projects.

- **250 countries** (ISO 3166-1) and **51 US states** as country-like records: official and short display names, ISO codes, capital, region, currencies, languages, translations, coordinates.
- **Flags three ways** — emoji (🇰🇷), emoji with a polyfill for Windows, or SVG — pick per place.
- TypeScript, ESM, with type definitions; one tiny runtime dependency (the emoji-flag polyfill).

## Install

```bash
npm install github:dev-magnolia/pokerzon-countries#v0.2.0
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
| `polyfillFlagEmojis({ fontName, fontUrl })` | `boolean` | Loads the flag font where emoji flags are missing (client only) |
| `getFlagSvgUrl(code, { ratio, baseUrl })` | `string \| null` | SVG flag URL (4x3 or 1x1), CDN by default |
| `getFlagSvgPath(code, ratio)` | `string \| null` | `flags/4x3/kr.svg` — path inside the package |
| `FLAG_EMOJI_FONT_FAMILY` · `FLAG_EMOJI_FONT_URL` · `CDN_BASE_URL` · `VERSION` | `string` | Constants |
| `countries` · `usaStates` | `Country[]` · `UsaState[]` | The raw arrays, typed |

Types: `Country`, `UsaState`, `CountryLike`, `Currency`, `Language`, `RegionalBloc`.

## Flags

| Option | How | Pros | Cons |
|---|---|---|---|
| **Emoji** | `country.flag`, `getFlagEmoji(code)` | Nothing to download; text, so it scales and copies | Chrome / Edge on Windows show two letters (e.g. "KR"); iOS set to mainland China hides 🇹🇼 |
| **Emoji + polyfill** | call `polyfillFlagEmojis()` once on the client, and put `"Twemoji Country Flags"` first in `font-family` | Same as emoji, and works on Windows Chrome / Edge — the 77 kB font loads only there | One extra font request on those browsers |
| **SVG** | `<img src={getFlagSvgUrl(code)}>` (4x3 or 1x1) | Identical everywhere, crisp at any size | One file per flag (mostly 1–10 kB); not text |
| **Flagpack** | `<img src={getFlagpackUrl(code, { size: "s" })}>` — flag.vercel.app | Small, pixel-tuned icons (s 16×12, m 20×15, l 32×24); immutable cache | Free Vercel-hosted API without SLA; no Kosovo (XK → `null`); fixed sizes |

```ts
import { polyfillFlagEmojis, FLAG_EMOJI_FONT_FAMILY, getFlagSvgUrl, getFlagpackUrl } from "@pokerzon/countries";

polyfillFlagEmojis();                       // client side, once (e.g. in the root layout); no-op on the server
// CSS: .flag { font-family: "Twemoji Country Flags", system-ui, sans-serif; }

getFlagSvgUrl("KR");                        // https://cdn.jsdelivr.net/gh/dev-magnolia/pokerzon-countries@v0.2.0/flags/4x3/kr.svg
getFlagSvgUrl("KR", { ratio: "1x1", baseUrl: "/assets" });   // "/assets/flags/1x1/kr.svg" — self-hosted copy
getFlagpackUrl("SG", { size: "s" });     // https://flag.vercel.app/s/SG.svg
getFlagpackUrl("GB");                     // https://flag.vercel.app/m/GB-UKM.svg (default size: m)
```

Self-hosting: copy `node_modules/@pokerzon/countries/flags` (and `assets/TwemojiCountryFlags.woff2` for the polyfill) into your public folder, then pass `baseUrl` / `fontUrl`. By default both are served from jsDelivr, pinned to the package version. Flagpack is not bundled: to avoid depending on flag.vercel.app, install `flagpack-core` and serve its `svg/` folder (same `{s,m,l}/{CODE}.svg` paths), then pass `baseUrl`. Always show the country name or code next to a flag, so nothing is lost where a flag cannot render.

## Data

- `data/country.json` — 250 countries. Fields: `name`, `displayName`, `alpha2Code`, `alpha3Code`, `numericCode`, `cioc`, `nativeName`, `altSpellings`, `translations` (de, es, fr, ja, it, br, pt, nl, hr, fa), `capital`, `demonym`, `region`, `subregion`, `latlng`, `area`, `population`, `gini`, `timezones` (UTC offsets, not IANA), `currencies`, `languages`, `callingCodes`, `topLevelDomain`, `borders`, `regionalBlocs`, `flag` (emoji).
- `data/usa.json` — 51 US states (`alpha3Code`: `USA-NV` …, `flag`: 🇺🇸).
- `displayName` differs from `name` in 12 cases: United Kingdom, Bolivia, Iran, Macedonia, North Korea, South Korea, Moldova, Russia, Venezuela, Vietnam, Laos, Macau.
- `flags/4x3/*.svg`, `flags/1x1/*.svg` — 271 flags from flag-icons (by alpha-2, lowercase), every country covered.
- `assets/TwemojiCountryFlags.woff2` — the polyfill font.

## Development

```bash
npm install
npm test          # node:test + tsx
npm run build     # data/*.json → src/generated/data.ts → dist/
```

Release: bump the version in `package.json`, commit, `git tag vX.Y.Z`, push with tags. Projects pin the tag.

## License

Code: MIT (see `LICENSE`). Country data in `data/country.json`: derived from [REST Countries](https://gitlab.com/restcountries/restcountries), MPL-2.0. Flag SVGs: [flag-icons](https://github.com/lipis/flag-icons), MIT. Polyfill: [country-flag-emoji-polyfill](https://github.com/talkjs/country-flag-emoji-polyfill), MIT; its font uses [Twemoji](https://github.com/twitter/twemoji) artwork, CC-BY 4.0. See `NOTICE`.
