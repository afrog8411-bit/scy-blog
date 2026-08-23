# 固定头像链接设计

## 目标

为网站提供固定头像地址 `https://scy.cool/avatar.jpg`。Pages CMS 仍是头像的唯一编辑入口；每次在 CMS 中更换头像并触发构建后，固定地址与侧栏头像都自动更新，不需要手工复制文件。

## 当前状态

- Pages CMS 将媒体上传到 `public/uploads`，文件名可能是哈希值。
- `src/data/site-settings.json` 中的 `shared.profileImage` 保存当前上传文件路径。
- `src/components/SideBar.astro` 直接读取该路径，因此网页当前使用的图片地址会随上传文件名变化。
- `public/profile.webp` 是模板遗留文件，不是当前头像；本次不删除它。

## 方案

### 单一数据源

继续以 `SITE_SETTINGS.shared.profileImage` 为头像源。Pages CMS 的字段和上传流程保持不变，不在配置中硬编码 `/avatar.jpg`，避免以后上传新头像时失去同步。

### 固定地址生成

新增 Astro 静态端点 `src/pages/avatar.jpg.ts`：

1. 在构建阶段读取 `shared.profileImage` 指向的 `public` 目录内文件。
2. 校验路径不能逃逸 `public` 目录，并在文件缺失或格式无法读取时让构建失败。
3. 使用项目现有的 `sharp` 依赖转换为 JPEG，确保 `/avatar.jpg` 的扩展名、内容和 MIME 类型一致。
4. Astro 静态构建生成 `dist/avatar.jpg`，由 Cloudflare Workers 作为普通静态资源发布。

### 页面引用

侧栏头像改为引用 `/avatar.jpg`，品牌名称继续作为替代文本。网站和外部使用者看到的头像地址因此统一为固定链接。

## 数据流

`Pages CMS 上传头像` → `site-settings.json 更新源图路径` → `Cloudflare 执行 Astro 构建` → `avatar.jpg.ts 读取并转换源图` → `dist/avatar.jpg` → `https://scy.cool/avatar.jpg`

## 失败处理

- 配置路径不是站内绝对路径、超出 `public` 目录、文件不存在或图片损坏：构建失败，不部署不一致的头像。
- 不删除上传源图、`public/profile.webp` 或其他现有媒体。
- 不修改 Wrangler、Cloudflare 构建设置或 Pages CMS 媒体目录。

## 验证标准

- `pnpm run validate:site`、`pnpm run test:localization` 和 `pnpm run build` 全部通过。
- `dist/avatar.jpg` 存在，并被 `sharp` 识别为 JPEG。
- 构建后的首页引用 `/avatar.jpg`，不再直接暴露哈希上传路径。
- 更换 `shared.profileImage` 后重新构建，固定文件随之更新。
- 部署后 `https://scy.cool/avatar.jpg` 返回 `200` 和 `image/jpeg`，线上首页头像使用该地址。

## 范围外事项

- 不清理模板遗留图片。
- 不调整头像尺寸、圆形遮罩或页面布局。
- 不修复 RSS、空商店等与头像无关的问题。
