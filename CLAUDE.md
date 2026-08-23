# Project rules

- 默认使用中文沟通；代码、命令、变量名使用英文。
- 静态页面和基础界面文字统一维护在 `src/data/site-settings.json` 的 `zh`、`en` 中；默认语言为中文，右上角切换语言。
- 博客和商店条目保持作者原始语言，不增加 `locale`、`titleZh`、`titleEn` 字段，不新增语言路由或重复内容。
- Pages CMS 配置位于 `.pages.yml`，内容编辑流程见 `docs/pages-cms.md`。
- 修改后至少运行 `pnpm run validate:site`、`pnpm run test:localization` 和 `pnpm run build`。
- 内容编辑不要改 `package.json`、`pnpm-lock.yaml`、`astro.config.mjs`、`.pages.yml`、环境变量或 CI/CD 配置。
- 不删除示例文章或商品；需要清理时先获得 Prince 明确许可。
- `git push`、rebase、reset 或公开部署前必须先征得 Prince 明确同意。
