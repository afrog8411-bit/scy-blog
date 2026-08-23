import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const settingsPath = path.join(projectRoot, "src", "data", "site-settings.json");

assert.ok(fs.existsSync(settingsPath), "src/data/site-settings.json is required");

const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
function requireObject(value, pathName) {
  assert.ok(value && typeof value === "object" && !Array.isArray(value), `${pathName} must be an object`);
}

function requireOwn(value, key, pathName) {
  assert.ok(Object.hasOwn(value, key), `${pathName}.${key} is required`);
  return value[key];
}

function requireString(value, pathName) {
  assert.equal(typeof value, "string", `${pathName} must be a string`);
}

function requireStringFields(value, keys, pathName) {
  requireObject(value, pathName);
  for (const key of keys) {
    requireString(requireOwn(value, key, pathName), `${pathName}.${key}`);
  }
}

function requireStringArray(value, pathName) {
  assert.ok(Array.isArray(value), `${pathName} must be an array`);
  value.forEach((item, index) => requireString(item, `${pathName}[${index}]`));
}

function requireObjectArray(value, keys, pathName) {
  assert.ok(Array.isArray(value), `${pathName} must be an array`);
  value.forEach((item, index) => requireStringFields(item, keys, `${pathName}[${index}]`));
}

function validateLocale(locale) {
  const section = settings[locale];
  const pathName = locale;

  requireObject(section, pathName);
  requireStringFields(section, ["siteTitle", "siteDescription"], pathName);
  requireStringFields(section.navigation, ["home", "projects", "services", "store", "blog", "cv", "contact"], `${pathName}.navigation`);
  requireStringFields(section.common, [
    "recentPosts", "olderPosts", "previousPage", "nextPage", "noPostsTitle", "noPostsMessage",
    "lastUpdated", "buyNow", "home", "notFoundMessage", "developedBy", "usingTemplate",
  ], `${pathName}.common`);
  requireStringFields(section.home, [
    "greeting", "name", "headline", "intro", "connectLabel", "connectUrl", "templateLabel",
    "templateUrl", "projectsHeading", "blogHeading",
  ], `${pathName}.home`);

  requireStringFields(section.projects, ["title", "heading"], `${pathName}.projects`);
  requireObjectArray(section.projects.items, ["title", "image", "description", "url"], `${pathName}.projects.items`);
  requireStringFields(section.services, ["title", "heading"], `${pathName}.services`);
  requireObjectArray(section.services.items, ["title", "image", "description", "url"], `${pathName}.services.items`);

  requireStringFields(section.cv, [
    "title", "profileHeading", "profile", "educationHeading", "experienceHeading", "certificationsHeading", "skillsHeading",
  ], `${pathName}.cv`);
  requireObjectArray(section.cv.education, ["title", "subtitle"], `${pathName}.cv.education`);
  requireObjectArray(section.cv.experience, ["title", "subtitle", "description"], `${pathName}.cv.experience`);
  requireObjectArray(section.cv.certifications, ["name", "url"], `${pathName}.cv.certifications`);
  requireStringArray(section.cv.skills, `${pathName}.cv.skills`);

  requireStringFields(section.blog, ["title"], `${pathName}.blog`);
  requireStringFields(section.store, ["title"], `${pathName}.store`);
  requireStringFields(section.notFound, ["title", "homeLabel"], `${pathName}.notFound`);
}

requireObject(settings.shared, "shared");
requireStringFields(settings.shared, ["brand", "profileImage", "contactEmail"], "shared");
requireStringFields(settings.shared.social, ["support", "github", "twitter", "linkedin", "rss"], "shared.social");

for (const locale of ["zh", "en"]) {
  validateLocale(locale);
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
