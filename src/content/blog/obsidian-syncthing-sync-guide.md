---
title: Obsidian 电脑手机自动同步教程（小白AI懒人版）
description: 零代码基础，把 Prompt 复制给你的本地 AI 助手，5分钟搞定 Obsidian 与 Syncthing 多端双向同步
pubDate: 2026-09-06
heroImage: /uploads/obsidian-banner.png
tags:
  - 教程
  - Obsidian
---
# Obsidian 电脑手机自动同步教程（小白AI懒人版）

> [!info] 三步极简核心流程
> 这篇教程专为小白和不想看复杂术语的人设计。如果你电脑上有本地 AI 工具（如 Codex、Claude Code、Cursor 等），同步只需三步：
> 1. 把本文现成的 Prompt 复制发给你的 AI，它会在后台全自动帮你下载、写入防冲突规则和底层配置
> 2. 电脑端双击启动软件，调出二维码
> 3. 手机端安装软件扫码，Obsidian 直接打开库

# 前期准备与下载

- 一：软件下载链接
    
    如果你打算让 AI 帮你全自动下载，==可以直接跳过这里直接看第二节复制 Prompt==；如果你习惯自己先下好安装包，这是官方安全地址：
    
    1. **电脑端（Windows 修复版）**：[GermanCoding / SyncTrayzor 最新 Release](https://github.com/GermanCoding/SyncTrayzor/releases/latest)，下载 SyncTrayzorSetup-x64.exe。
    
    > [!warning] 电脑端版本避坑
    > ==千万不要去下载网上老教程里 canton7 的老版本==！老版本遇到新内核会无限闪退报错 unknown flag -n，这个是社区最新维护的修复版。
    
    2. **手机端（Android 通用版）**：[Catfriend1 / Syncthing-Fork 最新 Release](https://github.com/Catfriend1/syncthing-android/releases/latest)，下载以 `universal_release.apk` 或 `release.apk` 结尾的文件。

# 把 Prompt 复制发给 AI

- 一：直接复制这段话
    
    打开你的 AI 工具（例如 Codex / Claude Code / Cursor 等），直接点击下方按键复制全部内容发给它：

    <div class="not-prose my-3 flex items-center justify-between bg-base-200/80 border border-primary/25 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5">
      <span class="text-xs sm:text-sm font-mono font-semibold text-base-content/80 flex items-center gap-1.5">
        <span>✦</span> <span>AI 自动化执行指令 (Prompt)</span>
      </span>
      <button type="button" class="copy-prompt-btn btn btn-primary btn-sm text-xs font-mono gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        <span class="copy-prompt-text">点击一键复制提示词</span>
      </button>
    </div>

    ```text
    我想使用 Syncthing 实现 Windows 电脑和 Android 手机的 Obsidian 双向自动同步，请帮我全自动搞定电脑端：

    1. 下载安装包到我的桌面：
       - 手机端安装包：从 GitHub (Catfriend1/syncthing-android) 下载最新的 Android 通用版 APK，重命名为 syncthing-fork-android.apk 放在桌面。
       - 电脑端安装包：从 GitHub (GermanCoding/SyncTrayzor) 下载最新的 SyncTrayzorSetup-x64.exe 放在桌面（必须用 GermanCoding 的修复版，避免 unknown flag -n 闪退）。
    2. 配置防冲突规则：
       - 我要同步的 Obsidian 知识库绝对路径是：【把这里替换成你的 Obsidian 库路径，例如 C:\Users\xxx\Documents\MyNotes】
       - 请直接在该知识库根目录下帮我创建 .stignore 文件，排除 workspace.json、workspace-mobile.json、cache 和回收站等易冲突状态。
    3. 注入同步配置：
       - 检查电脑端 Syncthing 配置，帮我把该文件夹直接预载进 Syncthing 的 config.xml，设置文件夹 ID 为 obsidian-sync，开启回收站式版本控制（保留 30 天）。
    `

- 二：AI 会自动搞定的事情
    
    > [!tip] AI 代劳的底层脏活
    > - **自动下载**：检测系统架构，直接拉取两个最新安装包到桌面。
    > - **自动防冲突**：注入 .stignore，保证电脑和手机的标签页、窗口布局各过各的，绝不产生 .sync-conflict 垃圾文件。
    > - **自动预载**：直接写好底层配置，你启动软件后根本不需要手动点「添加文件夹」。

# 电脑端启动

- 一：安装与显示二维码
    
    AI 执行完毕并提示下载成功后：
    
    1. 去电脑桌面，双击运行 **SyncTrayzorSetup-x64.exe**，一路点击「下一步」完成安装。
    2. 软件会自动启动，右下角托盘图标变绿即表示运行正常。
    3. 弹出「是否发送匿名报告」选择 **「否」**。
    4. 点击软件主界面右上角的 **「操作」 -> 「显示 ID」**，屏幕上会展示出连接二维码。

# 手机端操作

- 一：安装与配对
    
    将桌面的 syncthing-fork-android.apk 发送到手机安装：
    
    1. **权限开启**：打开时务必允许 **「所有文件访问权限」**（否则无法写入 Obsidian 笔记）。
    2. **扫码添加电脑**：
       - 点击手机顶部中间的 **「设备」** 标签页。
       - 点击右上角 **+** 号，点击设备 ID 旁边的 **二维码图标**，扫描电脑屏幕上的二维码。
       - 设备名称随意填写（如 我的电脑），点击右上角 **对勾（✔）** 保存。

- 二：接收同步文件夹
    
    1. 点击顶部左侧的 **「文件夹」** 标签页。
    2. 点击右上角带有加号的文件夹图标 **[+]**。
    3. 填写参数：
       - **文件夹标签**：填写 Obsidian（随意填）。
       - **文件夹 ID**：必须填 **obsidian-sync**（==核心：两端必须完全一致==）。
       - **目录**：点击选择路径（推荐：内部存储/Documents/Obsidian/MyNotes）。
       - **设备**：勾选你的 我的电脑。
    4. 点击右上角 **对勾（✔）** 保存。
    
    > [!tip] 自动同步开始
    > 保存后，两台设备会在局域网下秒级建立传输，几秒钟就能把所有历史笔记、图片和子目录同步过来。

# 在手机 Obsidian 中打开

- 一：加载知识库
    
    1. 打开手机端 **Obsidian** App。
    2. 选择 **「打开本地已存在的库 (Open folder as vault)」**。
    3. 浏览并选中刚才同步的文件夹目录。
    4. 赋予访问权限，进入知识库。此时你的所有笔记与结构已完整呈现！

# 注意事项与防坑指南

- 一：核心避坑须知
    
    > [!warning] 安全与使用须知
    > 1. **严禁父子目录嵌套**：如果你有子文件夹（比如 日记/漫剧），==千万不要在软件里同时添加父文件夹和子文件夹==，会造成死锁！直接同步最外层父文件夹即可，里面的所有子目录会自动全量同步。
    > 2. **手机防杀后台**：在手机「应用信息」中把 Syncthing-Fork 的电池策略设为 ==无限制==，并在后台多任务界面给它 ==加锁==，就能实现全天候无感自动同步。
    > 3. **版本恢复**：万一误删了文件，电脑知识库根目录下的隐藏文件夹 .stversions 中保存着 30 天内的所有历史版本，随时可以找回。