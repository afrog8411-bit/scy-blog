import assert from "node:assert/strict";
import { getLocalized, isLocalizedLinkAvailable, isLocalizedTextAvailable, mergeLocalized, normalizeLocale, toLocalized } from "../src/lib/localization.ts";

assert.equal(normalizeLocale("en"), "en");
assert.equal(normalizeLocale("fr"), "zh");
assert.deepEqual(toLocalized("same"), { zh: "same", en: "same" });
assert.equal(getLocalized({ zh: "中文", en: "English" }, "en"), "English");
assert.equal(getLocalized({ zh: "中文", en: "" }, "en"), "中文");
assert.equal(isLocalizedLinkAvailable({ zh: "", en: "" }), false);
assert.equal(isLocalizedLinkAvailable({ zh: "按钮", en: "Button" }), true);
assert.equal(isLocalizedTextAvailable({ zh: "", en: "" }), false);
assert.equal(isLocalizedTextAvailable({ zh: "你好", en: "" }), true);

assert.deepEqual(mergeLocalized(undefined, [{ title: "demo" }], "projects.items"), []);
assert.deepEqual(mergeLocalized([], ["demo"], "cv.skills"), []);
assert.deepEqual(
  mergeLocalized(
    { title: "简历" },
    { title: "Resume" },
    "cv"
  ),
  {
    title: { zh: "简历", en: "Resume" },
    education: [],
    experience: [],
    certifications: [],
    skills: [],
  }
);
assert.throws(
  () => mergeLocalized(["中文"], ["English", "Extra"], "home.items"),
  /Localized settings length mismatch/
);

console.log("localization helpers valid");
