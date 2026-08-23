# 故障排查

## 构建时报 `astro/env/setup` 找不到

- 症状：`pnpm run build` 失败，并出现 `astro/env/setup` 无法导出的错误。
- 根因：旧锁文件将 Astro 固定在 4.0.2，而构建依赖需要 Astro 4.11.0 才提供该导出。
- 已验证解法：使用 `pnpm add astro@4.11.0 --save-exact` 更新 `package.json` 和 `pnpm-lock.yaml`，随后运行 `pnpm install --frozen-lockfile` 和 `pnpm run build`。
- 适用范围：当前 Astro 4.x 模板的同类导出缺失错误。
- 未解决边界：不要直接安装 `astro@latest`；新主版本需要另行检查旧模板和 `@astrojs` 依赖兼容性。
- 验证证据：当前项目 Astro 版本为 4.11.0，静态构建已成功生成 11 个页面。

构建日志中关于 Wrangler 的提示不是这个错误的根因；排查时优先查看最早出现的 `✘ [ERROR]`。

## Astro 构建成功但 Workers 部署失败

- 症状：`pnpm run build` 成功，但 `npx wrangler deploy` 进入自动配置或依赖安装，并因 `ERR_PNPM_IGNORED_BUILDS` 等错误停止。
- 根因：Cloudflare 项目使用 Workers Builds，但仓库没有明确的 Wrangler 静态资源配置，部署阶段无法确定 `dist` 是要发布的资产目录。
- 已验证解法：在仓库根目录保留 `wrangler.jsonc`，将 `assets.directory` 指向 `./dist`，并保持 Astro 默认静态输出；本地用 `pnpm dlx wrangler@4.125.0 deploy --dry-run` 验证后再推送。
- 适用范围：当前项目的预渲染 Astro 网站与 Cloudflare Workers Builds。
- 未解决边界：这套配置不提供 SSR Worker；需要服务端渲染时必须另行设计 Astro adapter 和 Worker 入口。
- 验证证据：Workers Builds 已成功执行 `pnpm run build` 和 `npx wrangler deploy`，并发布 `dist` 静态文件。

## Pages CMS 保存后设置字段缺失

- 症状：保存 Website settings 后，项目、服务、简历条目或社交链接为空，旧版本会在构建时读取 undefined 并失败。
- 根因：这些字段在 Pages CMS 中可以被留空，JSON 保存时会省略空对象或空列表；中英文列表也可能暂时数量不一致。
- 已验证解法：当前代码把这些内容当作可选项；缺失或未成对的双语列表暂不渲染，社交链接缺失时隐藏社交图标，页面仍可构建。
- 适用范围：通过 Pages CMS 编辑 `src/data/site-settings.json` 时暂时没有项目、服务、简历或社交链接的情况。
- 未解决边界：要显示双语项目、服务或简历条目，需要在中文和英文设置中分别填写对应条目；两边数量不一致时不会显示该列表。
- 验证证据：当前设置缺少部分中文条目和 `shared.social`，`pnpm run validate:site` 与 `pnpm run build` 均已通过。

## 本地开发报 `No loader is configured for ".node" files: ... sharp-win32-x64.node`

- 症状：`pnpm run dev` 启动并访问页面时，esbuild 报错提示无法加载 `.node` 原生二进制文件。
- 根因：Vite 的依赖预构建（`optimizeDeps`）尝试将原生 Node C++ 模块 `sharp` 作为前端依赖打包，但 esbuild 不支持打包 `.node` 二进制文件。
- 已验证解法：在 `astro.config.mjs` 中的 `vite` 配置中添加 `optimizeDeps.exclude: ['sharp']` 以及 `ssr.external: ['sharp']`。
- 适用范围：所有在 Astro 服务端/API 端点（如头像生成 `avatar.jpg.ts`）中直接使用 `sharp` 的本地开发环境。
- 验证证据：配置后 `pnpm run dev` 正常启动，`/` 与 `/avatar.jpg` 请求均正常返回 200。

