# 故障排查

## 构建时报 `astro/env/setup` 找不到

- 症状：`pnpm run build` 失败，并出现 `astro/env/setup` 无法导出的错误。
- 根因：旧锁文件将 Astro 固定在 4.0.2，而构建依赖需要 Astro 4.11.0 才提供该导出。
- 已验证解法：使用 `pnpm add astro@4.11.0 --save-exact` 更新 `package.json` 和 `pnpm-lock.yaml`，随后运行 `pnpm install --frozen-lockfile` 和 `pnpm run build`。
- 适用范围：当前 Astro 4.x 模板的同类导出缺失错误。
- 未解决边界：不要直接安装 `astro@latest`；新主版本需要另行检查旧模板和 `@astrojs` 依赖兼容性。
- 验证证据：当前项目 Astro 版本为 4.11.0，静态构建已成功生成 16 个页面。

构建日志中关于 Wrangler 的提示不是这个错误的根因；排查时优先查看最早出现的 `✘ [ERROR]`。

## Pages CMS 保存后设置字段缺失

- 症状：保存 Website settings 后，项目、服务、简历条目或社交链接为空，旧版本会在构建时读取 undefined 并失败。
- 根因：这些字段在 Pages CMS 中可以被留空，JSON 保存时会省略空对象或空列表；中英文列表也可能暂时数量不一致。
- 已验证解法：当前代码把这些内容当作可选项；缺失或未成对的双语列表暂不渲染，社交链接缺失时隐藏社交图标，页面仍可构建。
- 适用范围：通过 Pages CMS 编辑 `src/data/site-settings.json` 时暂时没有项目、服务、简历或社交链接的情况。
- 未解决边界：要显示双语项目、服务或简历条目，需要在中文和英文设置中分别填写对应条目；两边数量不一致时不会显示该列表。
- 验证证据：当前设置缺少部分中文条目和 `shared.social`，`pnpm run validate:site` 与 `pnpm run build` 均已通过。
