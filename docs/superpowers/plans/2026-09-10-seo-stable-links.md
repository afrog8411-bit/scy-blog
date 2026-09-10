# SEO and Stable Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the next publishing phase safer by centralizing contact identity, adding article structured metadata, and moving blog links to stable filename slugs while preserving current title-based URLs.

**Architecture:** Keep the existing static Astro site and client-side locale behavior. Use the existing site settings as the single source for author/contact values, pass article dates through `BaseLayout` into `BaseHead`, and use Astro static redirects for the three currently published legacy paths.

**Tech Stack:** Astro 4, Astro Content Collections, TypeScript/JavaScript, Node assertion scripts.

---

### Task 1: Add regression checks

**Files:**
- Create: `scripts/test-seo-stable-links.mjs`

- [x] Check that title-based slug generation is disabled, legacy redirects exist, contact values are read from settings, and BaseHead emits JSON-LD and RSS discovery metadata.
- [x] Run the script and observe the expected failure against the current source.

### Task 2: Centralize identity and article SEO

**Files:**
- Modify: `src/config.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/BaseHead.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/layouts/StoreItemLayout.astro`
- Modify: `src/pages/index.astro`

- [x] Read author and WeChat values from `SITE_SETTINGS.shared` everywhere the UI currently hardcodes them.
- [x] Pass article dates and author data from the post layout to the document head.
- [x] Add `author`, article time metadata, RSS autodiscovery, and schema.org JSON-LD without changing visible article copy.

### Task 3: Stabilize blog URLs and preserve old paths

**Files:**
- Modify: `astro.config.mjs`
- Modify: `src/config.ts`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/blog/[...page].astro`
- Modify: `src/pages/blog/tag/[tag]/[...page].astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/rss.xml.js`
- Modify: `src/layouts/PostLayout.astro`

- [x] Use content filenames as canonical slugs.
- [x] Add redirects for the three existing title-generated URLs to the filename-based URLs.
- [x] Ensure list, related-post, and RSS links all use the stable slug behavior.
- [x] Verify the sitemap contains canonical paths and the old paths still produce redirect pages.

### Task 4: Verify and hand off

- [x] Run the regression script, site validation, localization test, and production build.
- [x] Inspect generated JSON-LD, canonical URLs, RSS, sitemap, and redirect output.
- [x] Run desktop/mobile browser smoke checks for home, blog, an article, a legacy article URL, and RSS.
- [x] Review the diff and leave the working tree ready for the user's next push request.

