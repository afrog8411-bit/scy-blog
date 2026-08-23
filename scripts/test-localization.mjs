import assert from "node:assert/strict";
import { getLocalized, normalizeLocale, toLocalized } from "../src/lib/localization.ts";

assert.equal(normalizeLocale("en"), "en");
assert.equal(normalizeLocale("fr"), "zh");
assert.deepEqual(toLocalized("same"), { zh: "same", en: "same" });
assert.equal(getLocalized({ zh: "中文", en: "English" }, "en"), "English");
assert.equal(getLocalized({ zh: "中文", en: "" }, "en"), "中文");

console.log("localization helpers valid");
