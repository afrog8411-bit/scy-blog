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

function requireOptionalStringArray(value, pathName) {
  if (value !== undefined) requireStringArray(value, pathName);
}

function requireOptionalObjectArray(value, keys, pathName) {
  if (value !== undefined) requireObjectArray(value, keys, pathName);
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
  requireOptionalObjectArray(section.projects.items, ["title", "image", "description", "url"], `${pathName}.projects.items`);
  requireStringFields(section.services, ["title", "heading"], `${pathName}.services`);
  requireOptionalObjectArray(section.services.items, ["title", "image", "description", "url"], `${pathName}.services.items`);

  requireStringFields(section.cv, [
    "title", "profileHeading", "profile", "educationHeading", "experienceHeading", "certificationsHeading", "skillsHeading",
  ], `${pathName}.cv`);
  requireOptionalObjectArray(section.cv.education, ["title", "subtitle"], `${pathName}.cv.education`);
  requireOptionalObjectArray(section.cv.experience, ["title", "subtitle", "description"], `${pathName}.cv.experience`);
  requireOptionalObjectArray(section.cv.certifications, ["name", "url"], `${pathName}.cv.certifications`);
  requireOptionalStringArray(section.cv.skills, `${pathName}.cv.skills`);

  requireStringFields(section.blog, ["title"], `${pathName}.blog`);
  requireStringFields(section.store, ["title"], `${pathName}.store`);
  requireStringFields(section.notFound, ["title", "homeLabel"], `${pathName}.notFound`);
}

requireObject(settings.shared, "shared");
requireStringFields(settings.shared, ["brand", "profileImage", "contactEmail"], "shared");
if (settings.shared.social !== undefined) {
  requireStringFields(settings.shared.social, ["support", "github", "twitter", "linkedin", "rss"], "shared.social");
}

for (const locale of ["zh", "en"]) {
  validateLocale(locale);
}

console.log("site settings valid");
