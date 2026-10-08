# @pokerzon/countries

Ország-törzsadat és segédfüggvények minden POKERZON projekthez (pokerzon.com, asiapokerhub.com, PEL, CMS, AI Agentek).

- **250 ország** (ISO 3166-1) és **51 amerikai állam**: név, rövid megjelenítési név, kódok, főváros, régió, pénznem, nyelv, fordítások, koordináta.
- **Zászló emojiként** (🇰🇷), nem képként — nincs letöltés (D-077).
- Függőség nélküli TypeScript, ESM, típusokkal.

## Install

Privát GitHub-repóból (a build az install során fut le, a `prepare` scripttel):

```bash
npm install github:dev-magnolia/pokerzon-countries#v0.1.0
```

## Usage

```ts
import { getCountry, getCountryName, getFlagEmoji, getMainCurrency } from "@pokerzon/countries";

getCountryName("KR");        // "South Korea"   — alpha-2, alpha-3, név, slug, altSpellings is jó
getFlagEmoji("VNM");         // "🇻🇳"
getMainCurrency("TW");       // "TWD"
getCountry("korea-republic-of")?.alpha3Code; // "KOR"
```

A nyers JSON is elérhető: `import data from "@pokerzon/countries/country.json"`.

| Function | Mit csinál |
|---|---|
| `getCountries({ includeUsaStates })` | országok (+ alapból az USA-államok) |
| `getCountry(code)` | keresés alpha-2, alpha-3, név, `displayName`, név-slug vagy `altSpellings` szerint, kis- és nagybetű független |
| `getCountryMemo()` | gyorsítótárazott `getCountry` nagy táblákhoz |
| `getCountryName(code)` · `getCountryNameCached(code)` | rövid megjelenítési név (`displayName`) |
| `getFlagEmoji(code)` · `alpha2ToFlagEmoji(alpha2)` | zászló emoji |
| `alpha3ToAlpha2(alpha3)` | ISO alpha-3 → alpha-2 (pl. a legacy PEL-kódokhoz) |
| `getMainCurrency(code)` | fő pénznem, ISO 4217 |
| `isUsaState(x)` · `isCountry(x)` | típusőrök |
| `stringToSlug(str)` | slug a névből |
| `countries` · `usaStates` | a nyers tömbök, típusosan |

## Data

`data/country.json` és `data/usa.json` — a forrás (ezt szerkeszd). Mezők és háttér: pokerzon-docs wiki → Data Models → Reference → country.json.

- `name`: hivatalos angol név; `displayName`: rövid név (12 esetben eltér: South Korea, Vietnam, Laos, Macau, Russia …).
- `flag`: zászló emoji. `timezones`: UTC-eltolás, nem IANA (az IANA időzónát a PEL tárolja).
- Hiányzó fordítások: ko, zh-hant.

## Development

```bash
npm install
npm test          # node:test + tsx
npm run build     # data → src/generated/data.ts → dist/
```

Kiadás: a verzió emelése a `package.json`-ban, commit, tag (`git tag v0.1.1`), push a taggel; a projektek a taggel hivatkoznak rá.
