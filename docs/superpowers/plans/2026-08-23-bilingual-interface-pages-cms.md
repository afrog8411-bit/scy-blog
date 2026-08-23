# Bilingual Interface and Pages CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a default-Chinese, right-top English switch for the existing Astrofy interface and configure Pages CMS while keeping article content, URLs, and the current Astro content collections unchanged.

**Architecture:** Keep the current static Astro routes and Markdown blog/store collections. Move editable static-page data into one structured JSON file with `shared`, `zh`, and `en` sections; render the Chinese version at build time and switch visible interface strings in the browser with a small `localStorage`-backed script. Configure Pages CMS as a structured editor for that JSON file and as a field editor for the existing blog/store Markdown files.

**Tech Stack:** Astro 4.11.0, Astro content collections, Astro View Transitions, TypeScript, JSON, Pages CMS `.pages.yml`, browser `localStorage`, Node.js built-in `assert`.

---

## File map

Create:

- `.pages.yml` — Pages CMS media, settings, blog, and store editors.
- `src/data/site-settings.json` — shared values plus Chinese and English static-page settings.
- `src/lib/localization.ts` — locale types and locale helpers.
- `src/lib/siteSettings.ts` — typed settings import and locale-section merger.
- `src/components/LanguageSwitch.astro` — right-top `中 / EN` control.
- `src/components/LocalizedText.astro` — localized visible text wrapper.
- `src/scripts/language.ts` — browser locale persistence and DOM updates.
- `scripts/validate-site-settings.mjs` — dependency-free settings validator.
- `public/uploads/.gitkeep` — Pages CMS upload destination marker.
- `docs/pages-cms.md` — Chinese editing guide.

Modify:

- `package.json`, `src/config.ts`, `src/styles/global.css`.
- `src/layouts/BaseLayout.astro`, `src/layouts/PostLayout.astro`, `src/layouts/StoreItemLayout.astro`.
- `src/components/BaseHead.astro`, `Header.astro`, `SideBar.astro`, `SideBarMenu.astro`, `Footer.astro`, `HorizontalCard.astro`, `HorizontalShopItem.astro`, `cv/TimeLine.astro`.
- `src/pages/index.astro`, `projects.astro`, `services.astro`, `cv.astro`, `404.astro`.
- `src/pages/blog/[...page].astro`, `src/pages/blog/tag/[tag]/[...page].astro`, `src/pages/store/[...page].astro`, `src/pages/rss.xml.js`.

Do not modify:

- `src/content/config.ts`, `src/pages/blog/[slug].astro`, `src/pages/store/[slug].astro` for schema or route changes.
- `astro.config.mjs`, `pnpm-lock.yaml`, Cloudflare settings, environment files, or CI/CD files.

### Task 1: Add typed static settings and a validation smoke test

**Files:**

- Create: `src/data/site-settings.json`
- Create: `src/lib/localization.ts`
- Create: `src/lib/siteSettings.ts`
- Create: `scripts/validate-site-settings.mjs`
- Modify: `package.json`

- [ ] **Step 1: Create the settings file**

Create `src/data/site-settings.json` with top-level keys `shared`, `zh`, and `en`. Copy the current demo values from the Astro pages into this file, then provide Chinese and English values for all static interface text.

The required fields are:

- `shared`: `brand`, `profileImage`, `contactEmail`, and `social.support`, `social.github`, `social.twitter`, `social.linkedin`, `social.rss`.
- Each locale: `siteTitle`, `siteDescription`, `navigation`, `common`, `home`, `projects`, `services`, `cv`, `blog`, `store`, and `notFound`.
- `navigation`: `home`, `projects`, `services`, `store`, `blog`, `cv`, `contact`.
- `common`: `recentPosts`, `olderPosts`, `previousPage`, `nextPage`, `noPostsTitle`, `noPostsMessage`, `lastUpdated`, `buyNow`, `home`, `notFoundMessage`, `developedBy`, `usingTemplate`.
- `home`: `greeting`, `name`, `headline`, `intro`, `connectLabel`, `templateLabel`, `projectsHeading`, `blogHeading`.
- `projects`: `title`, `heading`, `items`.
- `services`: `title`, `heading`, `items`.
- `cv`: `title`, `profileHeading`, `profile`, `educationHeading`, `education`, `experienceHeading`, `experience`, `certificationsHeading`, `certifications`, `skillsHeading`, `skills`.
- `blog`: `title`.
- `store`: `title`.
- `notFound`: `title`, `homeLabel`.

Each project/service item has `title`, `image`, `description`, `url`, and optional `badge`. Education items have `title` and `subtitle`. Experience items have `title`, `subtitle`, and `description`. Certification items have `name` and `url`. Skills is a string array. The Chinese and English arrays must have the same lengths. Keep existing demo files; do not delete them.

- [ ] **Step 2: Add locale primitives**

Create `src/lib/localization.ts`:

~~~ts
export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

export type LocalizedString = { zh: string; en: string };
export type LocalizedValue = string | LocalizedString;

export function isLocale(value: unknown): value is Locale {
  return value === "zh" || value === "en";
}

export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function toLocalized(value: LocalizedValue): LocalizedString {
  return typeof value === "string" ? { zh: value, en: value } : value;
}

export function getLocalized(value: LocalizedValue, locale: Locale = DEFAULT_LOCALE): string {
  const normalized = toLocalized(value);
  return normalized[locale] || normalized[DEFAULT_LOCALE];
}

export type LocalizedTree<T> =
  T extends string ? LocalizedString
    : T extends Array<infer Item> ? Array<LocalizedTree<Item>>
      : T extends object ? { [Key in keyof T]: LocalizedTree<T[Key]> }
        : T;
~~~

- [ ] **Step 3: Add the settings merger**

Create `src/lib/siteSettings.ts`. Import the JSON, export `SITE_SETTINGS`, and export `localizeSection(key)`. The merger must pair matching `zh` and `en` strings recursively and throw `Localized settings length mismatch at <path>` when paired arrays have different lengths. Use the `LocalizedTree` type from Task 1.

- [ ] **Step 4: Add validation**

Create `scripts/validate-site-settings.mjs`. Use Node's `fs`, `path`, `url`, and `assert/strict`. Check the required top-level keys, all locale sections listed in Step 1, that projects/services/CV arrays are arrays, and that each paired localized array has equal length. Print exactly `site settings valid` on success and a useful assertion message on failure.

Add this package script without changing the existing scripts:

~~~json
"validate:site": "node scripts/validate-site-settings.mjs"
~~~

- [ ] **Step 5: Run the foundation check**

Run:

~~~powershell
pnpm run validate:site
~~~

Expected: `site settings valid`.

- [ ] **Step 6: Commit**

~~~powershell
git add src/data/site-settings.json src/lib/localization.ts src/lib/siteSettings.ts scripts/validate-site-settings.mjs package.json
git commit -m "feat: add localized site settings"
~~~

### Task 2: Configure Pages CMS

**Files:**

- Create: `.pages.yml`
- Create: `public/uploads/.gitkeep`

- [ ] **Step 1: Add media and grouped content entries**

Create `.pages.yml` with:

~~~yaml
media:
  input: public/uploads
  output: /uploads

content:
  - name: site
    label: Website settings
    type: group
    items:
      - name: settings
        label: Site settings
        type: file
        path: src/data/site-settings.json
        format: json
        fields:
          - name: shared
            label: Shared settings
            type: object
          - name: zh
            label: 中文设置
            type: object
          - name: en
            label: English settings
            type: object
  - name: content
    label: Content
    type: group
    items:
      - name: blog
        label: Blog posts
        type: collection
        path: src/content/blog
        format: yaml-frontmatter
        filename:
          template: "{primary}.md"
          field: create
      - name: store
        label: Store items
        type: collection
        path: src/content/store
        format: yaml-frontmatter
        filename:
          template: "{primary}.md"
          field: create
~~~

Expand the `shared`, `zh`, and `en` object definitions with every field from Task 1. Use nested `object` fields for navigation/common/page sections; use `object` with `list: true` for project, service, education, experience, and certification entries; use `string` with `list: true` for skills; use `image` for image paths; use `text` for descriptions; and use `string` for labels and URLs.

The blog collection fields must match the current schema exactly: `title`, `description`, `pubDate`, `updatedDate`, `heroImage`, `badge`, `tags`, and `body`. Use `rich-text` for `body`, `date` for `pubDate`, `image` for `heroImage`, and a string list for `tags`. The store collection fields must match `title`, `description`, `custom_link_label`, `custom_link`, `updatedDate`, `pricing`, `oldPricing`, `badge`, `checkoutUrl`, `heroImage`, and `body`.

Set blog and store collection views to use `title` as the primary field, sort blog by `pubDate` descending, and sort store by `updatedDate` descending. Do not add `locale`, `titleZh`, or `titleEn` fields to content entries.

- [ ] **Step 2: Add the upload marker**

Create an empty `public/uploads/.gitkeep`. Do not move existing files from `public`.

- [ ] **Step 3: Validate the configuration shape**

Run:

~~~powershell
pnpm run validate:site
pnpm run build
~~~

Expected: the validator succeeds and Astro builds without a settings import or content schema error. Pages CMS account authentication is a separate user action; do not change GitHub permissions automatically.

- [ ] **Step 4: Commit**

~~~powershell
git add .pages.yml public/uploads/.gitkeep
git commit -m "feat: configure Pages CMS content editors"
~~~

### Task 3: Implement the browser language switch

**Files:**

- Create: `src/components/LanguageSwitch.astro`
- Create: `src/components/LocalizedText.astro`
- Create: `src/scripts/language.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/BaseHead.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Create `LocalizedText.astro`**

Render the Chinese value in the static HTML and store both values in data attributes:

~~~astro
---
import type { LocalizedValue } from "../lib/localization";
import { toLocalized } from "../lib/localization";

interface Props {
  value: LocalizedValue;
  class?: string;
}

const { value, class: className } = Astro.props;
const text = toLocalized(value);
---

<span class={className} data-localized data-localized-zh={text.zh} data-localized-en={text.en}>{text.zh}</span>
~~~

- [ ] **Step 2: Create the runtime**

Create `src/scripts/language.ts` with these behaviors:

- storage key is `site-language`;
- only `zh` and `en` are accepted;
- invalid/missing storage falls back to `zh`;
- `<html lang>`, `data-language`, localized text nodes, localized metadata, and `aria-pressed` state are updated;
- storage failures do not prevent the current-page switch;
- initialization runs once and again on every `astro:page-load`;
- button event listeners are not duplicated across transitions.

Use `data-localized`, `data-localized-zh`, `data-localized-en`, `data-localized-meta`, and `data-language-choice` as the stable DOM contract.

- [ ] **Step 3: Create the right-top control**

Create `LanguageSwitch.astro`:

~~~astro
<div class="fixed right-4 top-4 z-50 rounded-full bg-base-100/90 px-2 py-1 text-sm shadow backdrop-blur">
  <button type="button" data-language-choice="zh" aria-pressed="true" class="px-2 py-1">中</button>
  <span aria-hidden="true" class="opacity-50">/</span>
  <button type="button" data-language-choice="en" aria-pressed="false" class="px-2 py-1">EN</button>
</div>

<script>
  import "../scripts/language";
</script>
~~~

- [ ] **Step 4: Mount the control and localize metadata**

Update `BaseLayout.astro` to use `<html lang="zh-CN" data-language="zh" data-theme="lofi">`, render `LanguageSwitch` once outside the drawer content, and keep the existing mobile-only Header.

Update `BaseHead.astro` so title, description, Open Graph title/description, and Twitter title/description accept `string | LocalizedString`, render Chinese at build time, and expose both locale values through the DOM contract. Keep image and URL generation unchanged.

- [ ] **Step 5: Add only the required visibility rules**

If a static text contains inline markup that cannot safely be placed in a data attribute, render one `data-locale-block="zh"` and one `data-locale-block="en"` block and add:

~~~css
[data-locale-block="en"] { display: none; }
html[data-language="en"] [data-locale-block="zh"] { display: none; }
html[data-language="en"] [data-locale-block="en"] { display: block; }
~~~

Do not use `innerHTML` to render CMS values.

- [ ] **Step 6: Compile-check**

Run:

~~~powershell
pnpm run validate:site
pnpm run build
~~~

Expected: both commands succeed.

### Task 4: Migrate shared chrome and static pages

**Files:**

- Modify: `src/components/Header.astro`, `SideBar.astro`, `SideBarMenu.astro`, `Footer.astro`.
- Modify: `src/components/HorizontalCard.astro`, `HorizontalShopItem.astro`, `cv/TimeLine.astro`.
- Modify: `src/pages/index.astro`, `projects.astro`, `services.astro`, `cv.astro`, `404.astro`.

- [ ] **Step 1: Migrate shared navigation/profile/footer**

Import `SITE_SETTINGS`, `localizeSection`, and `LocalizedText`. Keep current active IDs and all current href values. Replace visible navigation/footer labels with localized values. Use `SITE_SETTINGS.shared.profileImage` and shared social links; do not change external URLs.

- [ ] **Step 2: Make reusable cards locale-aware**

Keep links, image paths, prices, and article data as ordinary values. Render visible title, description, and badge through `LocalizedText` when they are localized values. Use `getLocalized(value, "zh")` for image alt text and non-visible URLs. A plain string must render identically in both languages, which is how article/store content stays authored-language-only.

- [ ] **Step 3: Migrate the homepage**

In `index.astro`, import `localizeSection("home")` and `localizeSection("projects")`. Replace hard-coded greeting, name, headline, intro, CTA labels, project heading, and blog heading. Replace the three hard-coded project cards with `projects.items.slice(0, 3)` while preserving the current card/divider structure. Keep latest-blog sorting, `createSlug`, and article collection data unchanged.

- [ ] **Step 4: Migrate projects, services, CV, and 404**

Use `localizeSection("projects")`, `localizeSection("services")`, `localizeSection("cv")`, and `localizeSection("notFound")`. Preserve page routes, classes, card counts, timeline markup, and `includeSidebar={false}` on 404. Use `getLocalized(value, "zh")` for image/link paths and localized-capable components for visible content.

- [ ] **Step 5: Verify static routes**

Run:

~~~powershell
pnpm run validate:site
pnpm run build
~~~

Expected: all current static routes build with no missing-settings import and no Astro content schema error.

- [ ] **Step 6: Commit**

~~~powershell
git add src/components src/pages/index.astro src/pages/projects.astro src/pages/services.astro src/pages/cv.astro src/pages/404.astro src/styles/global.css
git commit -m "feat: localize static site interface"
~~~

### Task 5: Localize blog/store chrome without changing content

**Files:**

- Modify: `src/layouts/PostLayout.astro`, `src/layouts/StoreItemLayout.astro`.
- Modify: `src/pages/blog/[...page].astro`, `src/pages/blog/tag/[tag]/[...page].astro`, `src/pages/store/[...page].astro`.
- Modify: `src/pages/rss.xml.js`, `src/config.ts`.

- [ ] **Step 1: Localize list and pagination UI**

Use `localizeSection("blog")`, `localizeSection("store")`, and `localizeSection("common")` for page headings, empty states, recent/older labels, and previous/next labels. Keep collection reads, sorting, pagination, tag filtering, `createSlug`, and all generated links unchanged.

- [ ] **Step 2: Localize detail-layout UI only**

In `PostLayout.astro`, keep article title, description, date, badge, tags, and rendered slot unchanged; localize only the fixed last-updated label. In `StoreItemLayout.astro`, keep item fields and rendered body unchanged; localize only the fixed buy button label.

- [ ] **Step 3: Keep RSS default-only**

Read `SITE_SETTINGS.zh.siteTitle` and `SITE_SETTINGS.zh.siteDescription` in `src/config.ts` or a single shared metadata helper. Keep one RSS feed and all item links unchanged.

- [ ] **Step 4: Check the content model**

Use `rg` to verify that no blog/store file gains `locale`, `titleZh`, or `titleEn`. Run `pnpm run build`. Expected: one file and one URL per article/store entry, with only surrounding interface text changing.

- [ ] **Step 5: Commit**

~~~powershell
git add src/layouts/PostLayout.astro src/layouts/StoreItemLayout.astro src/pages/blog src/pages/store src/pages/rss.xml.js src/config.ts
git commit -m "feat: localize blog and store interface"
~~~

### Task 6: Add editing documentation and finish verification

**Files:**

- Create: `docs/pages-cms.md`

- [ ] **Step 1: Document the user workflow**

Write Chinese instructions covering:

1. Open `https://app.pagescms.org` and sign in with GitHub.
2. Install the Pages CMS GitHub App for this repository when prompted.
3. Open the `main` branch.
4. Use Website Settings for Chinese/English interface settings, Blog Posts for one-language Markdown articles, and Store Items for one-language products.
5. Upload images through the media picker; new uploads go to `public/uploads`.
6. Save in Pages CMS; it creates the GitHub commit and Cloudflare Pages rebuilds the site.
7. Do not edit `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, or `.pages.yml` in the content workflow.
8. For local verification, use `pnpm install --frozen-lockfile` and `pnpm run build`.

- [ ] **Step 2: Run automated verification**

Run each command separately:

~~~powershell
pnpm --version
pnpm run validate:site
pnpm install --frozen-lockfile --registry=https://registry.npmmirror.com
pnpm run build
git diff --check
~~~

Expected: pnpm remains `11.21.0`; validation prints `site settings valid`; frozen install does not change the lockfile; build exits 0; diff check prints nothing.

- [ ] **Step 3: Run browser verification**

Start:

~~~powershell
pnpm run dev -- --host 127.0.0.1
~~~

At the printed local URL verify:

- first visit is Chinese;
- the control is visible at the upper-right on desktop and mobile widths;
- `EN` changes navigation, buttons, headings, pagination, empty states, footer, and metadata;
- refresh and Astro View Transitions preserve English;
- `中` returns to Chinese;
- blog title/body/tags and store title/body remain authored-language-only;
- existing blog/store links work;
- the browser console has no new errors.

Stop the dev server after verification.

- [ ] **Step 4: Review, commit documentation, and tag locally**

Run:

~~~powershell
git status --short
git diff --check
git log --oneline -8
~~~

Confirm no environment, secret, deployment, lockfile, route, or article-schema changes occurred. Commit the guide:

~~~powershell
git add docs/pages-cms.md
git commit -m "docs: explain Pages CMS editing workflow"
~~~

After all verification passes, create the local milestone tag:

~~~powershell
git tag -a v3.1.0 -m "Add bilingual interface and Pages CMS editing"
~~~

Do not run `git push`; ask Prince explicitly before any push.

- [ ] **Step 5: Final handoff**

Report the local commits, `v3.1.0` tag, validation results, Pages CMS URL, and confirmation that original article URLs and single-language article entries remain unchanged. Separate any pre-existing build warning from new failures.

## References

- Pages CMS configuration overview: https://pagescms.org/docs/configuration/
- Pages CMS content entries: https://pagescms.org/docs/configuration/content/
- Pages CMS object fields: https://pagescms.org/docs/configuration/fields/object/
- Pages CMS media configuration: https://pagescms.org/docs/configuration/media/
- Pages CMS filename configuration: https://pagescms.org/docs/configuration/content/filename/

