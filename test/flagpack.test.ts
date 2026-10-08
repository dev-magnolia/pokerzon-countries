import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { countries, getFlagpackUrl, FLAGPACK_SIZES } from "../src/index.js";

const require = createRequire(import.meta.url);
const svgRoot = join(dirname(require.resolve("flagpack-core/package.json")), "svg");

test("every country except Kosovo resolves to an existing Flagpack file, in all sizes", () => {
  for (const c of countries) {
    for (const size of ["s", "m", "l"] as const) {
      const url = getFlagpackUrl(c.alpha2Code, { size, baseUrl: "" });
      if (c.alpha2Code === "XK") { assert.equal(url, null); continue; }
      assert.ok(url && existsSync(join(svgRoot, url)), `${c.name}: ${url}`);
    }
  }
});

test("Flagpack URLs", () => {
  assert.equal(getFlagpackUrl("SG"), "https://flag.vercel.app/m/SG.svg");
  assert.equal(getFlagpackUrl("sgp", { size: "s" }), "https://flag.vercel.app/s/SG.svg");
  assert.equal(getFlagpackUrl("GB", { size: "l" }), "https://flag.vercel.app/l/GB-UKM.svg");
  assert.equal(getFlagpackUrl("USA-NV"), "https://flag.vercel.app/m/US.svg");
  assert.equal(getFlagpackUrl("KR", { baseUrl: "/flags/flagpack/" }), "/flags/flagpack/m/KR.svg");
  assert.equal(getFlagpackUrl("nope"), null);
  assert.deepEqual(FLAGPACK_SIZES.m, { width: 20, height: 15 });
});
