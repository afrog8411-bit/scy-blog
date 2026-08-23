# Pages CMS 编辑说明

Pages CMS 是这个网站的可视化内容编辑入口。它修改仓库里的文件，并通过 GitHub 保存修改；Cloudflare Workers Builds 看到新的提交后会自动重新构建并部署网站。

## 第一次使用

1. 打开 [Pages CMS](https://app.pagescms.org)。
2. 使用 GitHub 登录。
3. 按页面提示安装 Pages CMS GitHub App，并允许它访问 `scy-blog` 仓库。
4. 打开仓库的 `main` 分支。

## 编辑网站基础设置

进入 `Website settings` → `Site settings`：

- `Shared settings`：头像、邮箱、GitHub、Twitter、LinkedIn 等不随语言变化的内容。
- `中文设置`：中文网站标题、菜单、首页、项目、服务、简历和 404 页面。
- `English settings`：对应的英文内容。

网站第一次打开默认显示中文。访客可以点击右上角的 `中 / EN` 切换界面语言。这个切换不会改变博客文章的语言。

## 编辑博客

进入 `Content` → `Blog posts`，新建或打开一篇文章。

每篇文章只有一份标题、简介和正文：

- 文章写中文，就显示中文；
- 文章写英文，就显示英文；
- 不需要复制第二份文章，也不需要填写中文标题和英文标题；
- 原有文章地址保持不变。

正文使用富文本编辑器。文章图片可以从媒体选择器上传，新的图片会保存到 `public/uploads`。

## 编辑商店内容

进入 `Content` → `Store items`，编辑商品标题、简介、价格、购买链接、图片和正文。商店条目与博客一样只保留作者实际填写的一份语言版本。

## 保存与发布

1. 在 Pages CMS 中保存修改。
2. Pages CMS 会在 GitHub 中产生一次提交。
3. Cloudflare Workers Builds 会运行 `pnpm run build`，再根据 `wrangler.jsonc` 部署 `dist` 中的静态文件。
4. 构建和部署都成功后，网站会更新。

不需要手动删除或重新生成 `pnpm-lock.yaml`。也不要在内容编辑流程中修改 `package.json`、`astro.config.mjs`、`wrangler.jsonc` 或 `.pages.yml`。

## 本地检查

在项目目录执行：

```powershell
pnpm install --frozen-lockfile
pnpm run validate:site
pnpm run test:localization
pnpm run build
```

如果构建失败，优先查看日志中最早出现的 `✘ [ERROR]`，不要只看最后的汇总错误。
