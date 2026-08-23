# 故障排查

## 构建时报 `astro/env/setup` 找不到

- 症状：`pnpm run build` 失败，并出现 `astro/env/setup` 无法导出的错误。
- 根因：旧锁文件将 Astro 固定在 4.0.2，而构建依赖需要 Astro 4.11.0 才提供该导出。
- 已验证解法：使用 `pnpm add astro@4.11.0 --save-exact` 更新 `package.json` 和 `pnpm-lock.yaml`，随后运行 `pnpm install --frozen-lockfile` 和 `pnpm run build`。
- 适用范围：当前 Astro 4.x 模板的同类导出缺失错误。
- 未解决边界：不要直接安装 `astro@latest`；新主版本需要另行检查旧模板和 `@astrojs` 依赖兼容性。
- 验证证据：当前项目 Astro 版本为 4.11.0，静态构建已成功生成 16 个页面。

构建日志中关于 Wrangler 的提示不是这个错误的根因；排查时优先查看最早出现的 `✘ [ERROR]`。
