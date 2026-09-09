import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const rss = read("src/pages/rss.xml.js");
assert.match(rss, /export\s+(?:const\s+)?GET\b|export\s+async\s+function\s+GET\b/, "RSS endpoint must export GET");
assert.match(rss, /createSlug/, "RSS links must use the same slug generator as article routes");

const tagRoute = read("src/pages/blog/tag/[tag]/[...page].astro");
assert.match(tagRoute, /new\s+Set\s*\(|Set\s*\(/, "tag paths must deduplicate tags");

const astroConfig = read("astro.config.mjs");
const settings = read("src/data/site-settings.json");
assert.doesNotMatch(astroConfig, /astrofy-template\.netlify\.app/, "Astro config still points to template hostname");
assert.doesNotMatch(settings, /Astrofy|astrofy-template/i, "site settings still contain template copy");

const baseHead = read("src/components/BaseHead.astro");
assert.match(baseHead, /rel=["']canonical["']/, "BaseHead must emit a canonical link");

const card = read("src/components/HorizontalCard.astro");
assert.match(card, /pubDate|readingTime/, "blog cards must support date or reading-time metadata");

const navigation = read("src/components/SideBarMenu.astro");
assert.match(navigation, /id="home"\s+href="\/"/, "sidebar must include a home link");
assert.match(read("src/components/SideBarFooter.astro"), /href="\/rss\.xml"/, "sidebar must expose the RSS feed");

for (const file of [
  "src/content/blog/energetic sleep.md",
  "src/content/blog/how-to-subscribe-codex-chatgpt.md",
  "src/content/blog/obsidian-syncthing-sync-guide.md",
]) {
  assert.doesNotMatch(read(file), /^#\s+/m, `${file} must leave the article H1 to the layout`);
}

console.log("blog optimization checks passed");

