import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  CDN_BASE_URL, FLAG_EMOJI_FONT_URL, VERSION, countries, getFlagSvgPath, getFlagSvgUrl, polyfillFlagEmojis,
} from "../src/index.js";

test("every country has a 4x3 and a 1x1 SVG", () => {
  for (const c of countries) {
    for (const r of ["4x3", "1x1"] as const) {
      const p = getFlagSvgPath(c.alpha2Code, r)!;
      assert.ok(existsSync(new URL(`../${p}`, import.meta.url)), `${c.name}: ${p}`);
    }
  }
});

test("SVG paths and URLs", () => {
  assert.equal(getFlagSvgPath("KOR"), "flags/4x3/kr.svg");
  assert.equal(getFlagSvgPath("Vietnam", "1x1"), "flags/1x1/vn.svg");
  assert.equal(getFlagSvgPath("USA-NV"), "flags/4x3/us.svg");
  assert.equal(getFlagSvgPath("nope"), null);
  assert.equal(getFlagSvgUrl("KR"), `${CDN_BASE_URL}/flags/4x3/kr.svg`);
  assert.equal(getFlagSvgUrl("TW", { ratio: "1x1", baseUrl: "/assets/" }), "/assets/flags/1x1/tw.svg");
  assert.ok(CDN_BASE_URL.endsWith(`@v${VERSION}`));
  assert.ok(existsSync(new URL("../assets/TwemojiCountryFlags.woff2", import.meta.url)));
  assert.ok(FLAG_EMOJI_FONT_URL.endsWith("/assets/TwemojiCountryFlags.woff2"));
});

test("polyfill is a no-op without a DOM (SSR)", () => {
  assert.equal(polyfillFlagEmojis(), false);
});
