import { test } from "node:test";
import assert from "node:assert/strict";
import {
  alpha2ToFlagEmoji, alpha3ToAlpha2, countries, getCountries, getCountry, getCountryMemo, getCountryName,
  getCountryNameCached, getFlagEmoji, getMainCurrency, isUsaState, stringToSlug, usaStates,
} from "../src/index.js";

test("data", () => {
  assert.equal(countries.length, 250);
  assert.equal(usaStates.length, 51);
  assert.equal(getCountries().length, 301);
  assert.equal(getCountries({ includeUsaStates: false }).length, 250);
  for (const c of countries) {
    assert.match(c.alpha2Code, /^[A-Z]{2}$/);
    assert.equal(c.flag, alpha2ToFlagEmoji(c.alpha2Code), c.name);
    assert.ok(c.displayName);
  }
  assert.equal(new Set(countries.map((c) => c.alpha2Code)).size, 250);
});

test("getCountry: code, name, slug, altSpellings", () => {
  for (const q of ["KR", "kr", "KOR", "Korea (Republic of)", "South Korea", "korea-republic-of", "south-korea"]) {
    assert.equal(getCountry(q)?.alpha2Code, "KR", q);
  }
  assert.equal(getCountry("Viet Nam")?.alpha2Code, "VN");
  assert.equal(getCountry("Vietnam")?.alpha2Code, "VN");
  assert.equal(getCountry("USA-NV")?.name, "Nevada");
  assert.equal(getCountry(""), null);
  assert.equal(getCountry("nope"), null);
});

test("names", () => {
  assert.equal(getCountryName("KR"), "South Korea");
  assert.equal(getCountryName("VNM"), "Vietnam");
  assert.equal(getCountryName("LA"), "Laos");
  assert.equal(getCountryName("MO"), "Macau");
  assert.equal(getCountryName("TW"), "Taiwan");
  assert.equal(getCountryNameCached("KR"), "South Korea");
  assert.equal(getCountryMemo()("PH")?.displayName, "Philippines");
});

test("flags (D-077)", () => {
  assert.equal(getFlagEmoji("KR"), "🇰🇷");
  assert.equal(getFlagEmoji("VNM"), "🇻🇳");
  assert.equal(getFlagEmoji("Taiwan"), "🇹🇼");
  assert.equal(getFlagEmoji("USA-NV"), "🇺🇸");
  assert.equal(getFlagEmoji("xx"), "");
  assert.equal(alpha2ToFlagEmoji("jp"), "🇯🇵");
  assert.equal(alpha2ToFlagEmoji("JPN"), "");
});

test("helpers", () => {
  assert.equal(alpha3ToAlpha2("kor"), "KR");
  assert.equal(alpha3ToAlpha2("usa"), "US");
  assert.equal(getMainCurrency("KR"), "KRW");
  assert.equal(getMainCurrency("TW"), "TWD");
  assert.equal(stringToSlug("Viet Nam"), "viet-nam");
  assert.equal(stringToSlug("Côte d'Ivoire"), "cote-divoire");
  assert.ok(isUsaState(getCountry("USA-TX")!));
});
