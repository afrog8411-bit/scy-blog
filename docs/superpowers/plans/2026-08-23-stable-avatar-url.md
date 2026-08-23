# Stable Avatar URL Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 Pages CMS 当前头像自动生成并使用固定地址 `https://scy.cool/avatar.jpg`。

**Architecture:** `SITE_SETTINGS.shared.profileImage` 继续作为唯一数据源。独立头像模块负责安全解析 `public` 内的源图并用 Sharp 转成 JPEG；Astro 静态端点在构建时输出 `dist/avatar.jpg`，侧栏只引用固定路径。

**Tech Stack:** Astro 4.11、TypeScript、Node.js、Sharp、pnpm、Cloudflare Workers Static Assets

---

## 文件结构

- Create: `src/lib/avatar.ts` — 安全解析头像源路径并生成 JPEG 字节。
- Create: `src/pages/avatar.jpg.ts` — 将头像生成器暴露为 Astro 静态端点。
- Create: `scripts/test-avatar.mjs` — 验证路径边界和 JPEG 转换。
- Create: `scripts/test-avatar-build.mjs` — 验证构建产物与首页固定引用。
- Modify: `src/components/SideBar.astro` — 侧栏头像改用 `/avatar.jpg`。
- Modify: `package.json` — 添加头像单元测试和构建产物测试命令。

### Task 1: 头像 JPEG 生成器

**Files:**
- Create: `scripts/test-avatar.mjs`
- Create: `src/lib/avatar.ts`
- Modify: `package.json`

- [ ] **Step 1: 先添加失败的头像生成器测试**

在 `package.json` 的 `scripts` 中加入：

```json
"test:avatar": "node --experimental-strip-types scripts/test-avatar.mjs"
```

创建 `scripts/test-avatar.mjs`：

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createAvatarJpeg, resolvePublicImagePath } from "../src/lib/avatar.ts";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const settingsPath = path.join(projectRoot, "src", "data", "site-settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
const profileImage = settings.shared.profileImage;

assert.throws(
  () => resolvePublicImagePath("uploads/avatar.jpg", projectRoot),
  /must start with a single slash/
);
assert.throws(
  () => resolvePublicImagePath("//example.com/avatar.jpg", projectRoot),
  /must start with a single slash/
);
assert.throws(
  () => resolvePublicImagePath("/../package.json", projectRoot),
  /must stay inside public/
);

const sourcePath = resolvePublicImagePath(profileImage, projectRoot);
assert.ok(fs.existsSync(sourcePath), `profile image does not exist: ${sourcePath}`);

const jpeg = await createAvatarJpeg(profileImage, projectRoot);
const metadata = await sharp(jpeg).metadata();
assert.equal(metadata.format, "jpeg");
assert.ok((metadata.width ?? 0) > 0, "generated avatar must have a width");
assert.ok((metadata.height ?? 0) > 0, "generated avatar must have a height");

console.log("avatar generator valid");
```

- [ ] **Step 2: 运行测试并确认失败原因正确**

Run:

```powershell
pnpm run test:avatar
```

Expected: FAIL，错误包含 `ERR_MODULE_NOT_FOUND` 和 `src/lib/avatar.ts`。

- [ ] **Step 3: 添加最小头像生成器实现**

创建 `src/lib/avatar.ts`：

```ts
import path from "node:path";
import sharp from "sharp";

export function resolvePublicImagePath(
  profileImage: string,
  projectRoot = process.cwd()
): string {
  if (!profileImage.startsWith("/") || profileImage.startsWith("//")) {
    throw new Error("profile image path must start with a single slash");
  }

  const publicRoot = path.resolve(projectRoot, "public");
  const sourcePath = path.resolve(publicRoot, profileImage.slice(1));
  const relativePath = path.relative(publicRoot, sourcePath);

  if (
    relativePath === "" ||
    relativePath === ".." ||
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    throw new Error("profile image path must stay inside public");
  }

  return sourcePath;
}

export async function createAvatarJpeg(
  profileImage: string,
  projectRoot = process.cwd()
): Promise<Buffer> {
  const sourcePath = resolvePublicImagePath(profileImage, projectRoot);

  return sharp(sourcePath)
    .rotate()
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
}
```

- [ ] **Step 4: 运行测试并确认通过**

Run:

```powershell
pnpm run test:avatar
```

Expected: PASS，输出 `avatar generator valid`。

- [ ] **Step 5: 提交头像生成器**

```powershell
git add package.json scripts/test-avatar.mjs src/lib/avatar.ts
git commit -m "feat: add avatar image generator"
```

### Task 2: 固定头像路由与侧栏引用

**Files:**
- Create: `scripts/test-avatar-build.mjs`
- Create: `src/pages/avatar.jpg.ts`
- Modify: `src/components/SideBar.astro`
- Modify: `package.json`

- [ ] **Step 1: 先添加失败的构建产物测试**

在 `package.json` 的 `scripts` 中加入：

```json
"test:avatar-build": "node scripts/test-avatar-build.mjs"
```

创建 `scripts/test-avatar-build.mjs`：

```js
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const avatarPath = path.join(projectRoot, "dist", "avatar.jpg");
const indexPath = path.join(projectRoot, "dist", "index.html");
const settingsPath = path.join(projectRoot, "src", "data", "site-settings.json");
const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

assert.ok(fs.existsSync(avatarPath), "dist/avatar.jpg must exist");
const metadata = await sharp(avatarPath).metadata();
assert.equal(metadata.format, "jpeg", "dist/avatar.jpg must contain JPEG data");

const indexHtml = fs.readFileSync(indexPath, "utf8");
assert.ok(indexHtml.includes('src="/avatar.jpg"'), "homepage must use /avatar.jpg");
assert.ok(
  !indexHtml.includes(settings.shared.profileImage),
  "homepage must not expose the hashed profile image path"
);

console.log("stable avatar build valid");
```

- [ ] **Step 2: 构建并确认产物测试失败**

Run:

```powershell
pnpm run build
pnpm run test:avatar-build
```

Expected: `pnpm run build` PASS；`pnpm run test:avatar-build` FAIL，错误为 `dist/avatar.jpg must exist`。

- [ ] **Step 3: 添加 Astro 静态头像端点**

创建 `src/pages/avatar.jpg.ts`：

```ts
import type { APIRoute } from "astro";
import { createAvatarJpeg } from "../lib/avatar";
import { SITE_SETTINGS } from "../lib/siteSettings";

export const GET: APIRoute = async () => {
  const jpeg = await createAvatarJpeg(SITE_SETTINGS.shared.profileImage);

  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
    },
  });
};
```

- [ ] **Step 4: 让侧栏使用固定地址**

在 `src/components/SideBar.astro` 中删除：

```ts
import { Image } from "astro:assets";
```

将头像组件：

```astro
<Image class="mask mask-circle" format="webp" width={300} height={300} src={SITE_SETTINGS.shared.profileImage} alt={SITE_SETTINGS.shared.brand} />
```

替换为：

```astro
<img
  class="mask mask-circle"
  width="300"
  height="300"
  src="/avatar.jpg"
  alt={SITE_SETTINGS.shared.brand}
  decoding="async"
/>
```

- [ ] **Step 5: 重新构建并确认固定地址通过**

Run:

```powershell
pnpm run build
pnpm run test:avatar-build
```

Expected: Astro 构建输出包含 `/avatar.jpg`；测试输出 `stable avatar build valid`。

- [ ] **Step 6: 提交固定头像路由**

```powershell
git add package.json scripts/test-avatar-build.mjs src/pages/avatar.jpg.ts src/components/SideBar.astro
git commit -m "feat: expose stable avatar URL"
```

### Task 3: 回归验证与 Workers 部署预演

**Files:**
- Verify only; no new files.

- [ ] **Step 1: 验证锁文件和依赖安装**

Run:

```powershell
pnpm install --frozen-lockfile
```

Expected: PASS，输出 `Lockfile is up to date` 或 `Already up to date`，且 `pnpm-lock.yaml` 不变化。

- [ ] **Step 2: 运行全部站点测试**

Run:

```powershell
pnpm run validate:site
pnpm run test:localization
pnpm run test:avatar
pnpm run build
pnpm run test:avatar-build
```

Expected:

```text
site settings valid
localization helpers valid
avatar generator valid
stable avatar build valid
```

Astro 构建退出码为 `0`。RSS 路由大小写和空商店提醒可以继续出现，但不得新增错误。

- [ ] **Step 3: 预演 Cloudflare Workers 部署**

Run:

```powershell
pnpm dlx wrangler@4.125.0 deploy --dry-run
```

Expected: PASS，Wrangler 读取 `dist`，输出 `--dry-run: exiting now.`。

- [ ] **Step 4: 检查工作区和提交历史**

Run:

```powershell
git diff --check
git status --short --branch
git log -4 --oneline --decorate
```

Expected: 没有已跟踪的未提交文件；仅允许既有的 `?? .superpowers/`。最新历史包含设计、头像生成器和固定路由提交。

- [ ] **Step 5: 创建本地版本标签**

Run:

```powershell
git tag -a v3.1.7 -m "v3.1.7"
git tag --points-at HEAD
```

Expected: 输出 `v3.1.7`。这一步只创建本地标签，不推送。

### Task 4: 授权后推送与线上验收

**Files:**
- Verify only; no new files.

- [ ] **Step 1: 获取本次推送授权**

明确询问 Prince：`本地实现和验证已完成，可以把 main 与 v3.1.7 推送到 GitHub 吗？`

Expected: 在 Prince 明确回复“可以”之前停止；不得执行任何 `git push`。

- [ ] **Step 2: 原子推送分支与标签**

获得授权后运行：

```powershell
git push --atomic origin main refs/tags/v3.1.7
```

Expected: `main` 和 `v3.1.7` 同时推送成功，无强制推送。

- [ ] **Step 3: 核验远程引用**

Run:

```powershell
git ls-remote origin refs/heads/main refs/tags/v3.1.7 'refs/tags/v3.1.7^{}'
```

Expected: `main` 与标签解引用后的提交哈希都等于本地 `git rev-parse HEAD`。

- [ ] **Step 4: 等待 Cloudflare 自动部署完成**

加载 `web-access` skill，完成其前置检查和风险提示，然后查看 Cloudflare 最新构建。最新任务必须对应本次提交，且构建与部署结果均为 `success`。

- [ ] **Step 5: 对比线上固定头像与本地产物**

Cloudflare 成功后运行：

```powershell
node -e "const fs=require('node:fs');const crypto=require('node:crypto');const hash=b=>crypto.createHash('sha256').update(b).digest('hex');Promise.all([fs.promises.readFile('dist/avatar.jpg'),fetch('https://scy.cool/avatar.jpg',{cache:'no-store'}).then(async r=>{if(r.status!==200)throw new Error('avatar status '+r.status);if(!(r.headers.get('content-type')||'').includes('image/jpeg'))throw new Error('unexpected content type');return Buffer.from(await r.arrayBuffer())})]).then(([local,remote])=>{if(hash(local)!==hash(remote))throw new Error('live avatar does not match dist/avatar.jpg');console.log('live avatar matches local build')})"
```

Expected: 输出 `live avatar matches local build`。

- [ ] **Step 6: 验证线上首页使用固定地址**

Run:

```powershell
node -e "fetch('https://scy.cool/',{cache:'no-store'}).then(async r=>{if(r.status!==200)throw new Error('homepage status '+r.status);const html=await r.text();if(!html.includes('src=\"/avatar.jpg\"'))throw new Error('homepage does not use /avatar.jpg');console.log('live homepage uses stable avatar URL')})"
```

Expected: 输出 `live homepage uses stable avatar URL`。

最终固定链接：`https://scy.cool/avatar.jpg`。
