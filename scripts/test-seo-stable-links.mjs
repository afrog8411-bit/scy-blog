import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

assert.match(read("src/config.ts"), /GENERATE_SLUG_FROM_TITLE\s*=\s*false/, "blog URLs must use stable file slugs");

const astroConfig = read("astro.config.mjs");
for (const legacyPath of [
  "/blog/早起攻略/",
  "/blog/如何订阅codexchatgpt/",
  "/blog/obsidian-电脑手机自动同步教程小白ai懒人版/",
]) {
  assert.match(astroConfig, new RegExp(legacyPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `missing redirect for ${legacyPath}`);
}

const baseHead = read("src/components/BaseHead.astro");
assert.match(baseHead, /application\/ld\+json/, "BaseHead must emit structured data");
assert.match(baseHead, /rel=["']alternate["']/, "BaseHead must advertise the RSS feed");
assert.match(baseHead, /article:published_time/, "article published time metadata is required");

for (const file of [
  "src/pages/index.astro",
  "src/layouts/PostLayout.astro",
  "src/layouts/StoreItemLayout.astro",
]) {
  assert.match(read(file), /SITE_SETTINGS\.shared|site\.(brand|wechat)/, `${file} must read identity from site settings`);
}

assert.match(read("src/layouts/BaseLayout.astro"), /publishedTime|modifiedTime/, "BaseLayout must pass article dates to the head");

console.log("SEO and stable link checks passed");
