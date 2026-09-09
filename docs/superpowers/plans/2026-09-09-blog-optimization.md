# Blog Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Remove template residue, restore RSS and stable tag generation, make navigation and article structure clearer, and reduce avoidable page weight without changing author-written article or store content.

**Architecture:** Keep the existing Astro static-site and client-side locale model. Centralize site identity in `src/data/site-settings.json`, use the existing layout/components for metadata and cards, and add a small structural regression script under `scripts/` because the repository has no test runner. Treat article content as source material: only heading markup and presentation metadata change.

**Tech Stack:** Astro 4, Astro Content Collections, TypeScript/JavaScript, TailwindCSS, Node assertion scripts.

---

### Task 1: Add structural regression checks

**Files:**
- Create: `scripts/test-blog-optimization.mjs`

- [x] **Step 1: Write failing checks** for:
  - RSS endpoint exports `GET`.
  - Tag route deduplicates tag values before pagination.
  - Site config no longer contains the template hostname or template title.
  - Horizontal cards render date metadata when supplied.
  - Base head emits a canonical link.
- [x] **Step 2: Run** `node scripts/test-blog-optimization.mjs`; confirm it fails against the current source.
- [x] **Step 3: Keep assertions source-based and dependency-free** so the script runs in the existing Node toolchain.

### Task 2: Fix site identity and metadata

**Files:**
- Modify: `astro.config.mjs:8`
- Modify: `public/robots.txt:4`
- Modify: `src/data/site-settings.json:32,91-92,114`
- Modify: `src/components/Footer.astro:15`
- Modify: `src/components/BaseHead.astro`

- [x] **Step 1:** Replace template hostname and English template copy with the current site identity, keeping the real deployment hostname in one config value.
- [x] **Step 2:** Add `<link rel="canonical">` using `Astro.url` and preserve the existing Open Graph metadata.
- [x] **Step 3:** Point robots.txt to the real sitemap path and change the footer template link into a neutral author/site footer.
- [x] **Step 4:** Run the structural checks and inspect generated HTML for hostname, canonical, and title values.

### Task 3: Restore RSS and unique tag paths

**Files:**
- Modify: `src/pages/rss.xml.js:5`
- Modify: `src/pages/blog/tag/[tag]/[...page].astro:11-23`
- Modify: `src/components/SideBarFooter.astro` or the relevant footer/navigation component if the RSS link remains hidden

- [x] **Step 1:** Rename the endpoint export from `get` to `GET`.
- [x] **Step 2:** Build the tag list from a `Set` before calling `paginate`, preserving first-seen order.
- [x] **Step 3:** Expose the RSS URL in a visible, valid link when site settings provide it; do not render empty social links.
- [x] **Step 4:** Run the structural checks and `pnpm run build`; confirm `dist/rss.xml` exists and the duplicate tag route warning is gone.

### Task 4: Improve navigation and article/listing semantics

**Files:**
- Modify: `src/components/SideBarMenu.astro`
- Modify: `src/components/HorizontalCard.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/blog/[...page].astro`
- Modify: `src/pages/blog/tag/[tag]/[...page].astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/pages/cv.astro`

- [x] **Step 1:** Add usable Home, Blog, Store, and Contact navigation entries; only expose project/service/CV entries when their settings contain meaningful content.
- [x] **Step 2:** Add optional `pubDate` and `readingTime` props to `HorizontalCard`, render a semantic `time` element, and pass them from blog listings.
- [x] **Step 3:** Change CV section labels from styled `div` elements to `h2` elements.
- [x] **Step 4:** Add a canonical “start here”/value proposition block on the home page through existing localized settings fields.
- [x] **Step 5:** Keep the frontmatter title as the only article H1; update the three existing Markdown files’ section headings from top-level `#` to `##` where they are article sections.
- [x] **Step 6:** Add `rel="noopener noreferrer"` to external blank-target links and an accessible label to the mobile menu control.
- [x] **Step 7:** Run structural checks, localization tests, and browser smoke checks.

### Task 5: Reduce avoidable asset cost

**Files:**
- Modify: `src/components/BaseHead.astro`
- Modify: `src/components/HorizontalCard.astro`
- Modify: `src/components/HorizontalShopItem.astro`
- Modify: `src/layouts/PostLayout.astro`
- Modify: `src/layouts/StoreItemLayout.astro`
- Create: optimized derivatives under `public/uploads/` only when generated from existing images

- [x] **Step 1:** Add intrinsic image dimensions to card and hero images to reduce layout shifts.
- [x] **Step 2:** Prefer modern derivatives for the 1.25MB service poster and keep original files available for source content.
- [x] **Step 3:** Reduce unnecessary Google Font weights or add a reliable system fallback.
- [x] **Step 4:** Re-run build and inspect output sizes.

### Task 6: Final verification and documentation hygiene

**Files:**
- Modify: `docs/superpowers/plans/2026-09-09-blog-optimization.md` only to mark completed steps if needed

- [x] **Step 1:** Run `node scripts/test-blog-optimization.mjs`.
- [x] **Step 2:** Run `pnpm run validate:site`.
- [x] **Step 3:** Run `pnpm run test:localization`.
- [x] **Step 4:** Run `pnpm run build` and inspect RSS, sitemap, and route output.
- [x] **Step 5:** Run a local browser smoke test for desktop/mobile, locale/theme toggle, navigation, tag page, article, and RSS.
- [x] **Step 6:** Review `git diff` and `git status`; keep temporary screenshots outside the repository.


