import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const settingsPath = path.join(projectRoot, "src", "data", "site-settings.json");

assert.ok(fs.existsSync(settingsPath), "src/data/site-settings.json is required");

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
assert.equal(typeof settings.shared?.brand, "string", "shared.brand is required");
assert.equal(typeof settings.shared?.profileImage, "string", "shared.profileImage is required");

const localeSections = ["navigation", "common", "home", "projects", "services", "cv", "blog", "store", "notFound"];

for (const locale of ["zh", "en"]) {
  const section = settings[locale];
  assert.equal(typeof section?.siteTitle, "string", `${locale}.siteTitle is required`);
  assert.equal(typeof section?.siteDescription, "string", `${locale}.siteDescription is required`);

  for (const key of localeSections) {
    assert.equal(typeof section[key], "object", `${locale}.${key} is required`);
  }

  assert.ok(Array.isArray(section.projects.items), `${locale}.projects.items must be an array`);
  assert.ok(Array.isArray(section.services.items), `${locale}.services.items must be an array`);
  assert.ok(Array.isArray(section.cv.education), `${locale}.cv.education must be an array`);
  assert.ok(Array.isArray(section.cv.experience), `${locale}.cv.experience must be an array`);
  assert.ok(Array.isArray(section.cv.certifications), `${locale}.cv.certifications must be an array`);
  assert.ok(Array.isArray(section.cv.skills), `${locale}.cv.skills must be an array`);
}

const pairedArrays = [
  ["projects.items", settings.zh.projects.items, settings.en.projects.items],
  ["services.items", settings.zh.services.items, settings.en.services.items],
  ["cv.education", settings.zh.cv.education, settings.en.cv.education],
  ["cv.experience", settings.zh.cv.experience, settings.en.cv.experience],
  ["cv.certifications", settings.zh.cv.certifications, settings.en.cv.certifications],
  ["cv.skills", settings.zh.cv.skills, settings.en.cv.skills],
];

for (const [name, chinese, english] of pairedArrays) {
  assert.equal(chinese.length, english.length, `${name} locale lengths differ`);
}

console.log("site settings valid");
