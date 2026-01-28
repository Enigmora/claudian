<p align="center">
  <img src="assets/logo-2.svg" alt="Claudian" width="400">
</p>

<p align="center">
  <strong>Obsidian 的终极 Claude AI 集成</strong>
</p>

<p align="center">
  <a href="https://enigmora.com"><img src="https://img.shields.io/badge/by-Enigmora-purple.svg?style=flat-square" alt="by Enigmora"></a>
  <a href="https://obsidian.md"><img src="https://img.shields.io/badge/Obsidian-插件-7C3AED?style=flat-square&logo=obsidian&logoColor=white" alt="Obsidian 插件"></a>
  <a href="https://anthropic.com"><img src="https://img.shields.io/badge/由Claude驱动-FF6B35?style=flat-square" alt="由 Claude 驱动"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/许可证-MIT-green?style=flat-square" alt="MIT 许可证"></a>
</p>

<p align="center">
  <a href="#安装">安装</a> •
  <a href="#功能">功能</a> •
  <a href="https://github.com/Enigmora/claudian/wiki">文档</a> •
  <a href="README.md">English</a> •
  <a href="README_ES.md">Español</a> •
  <a href="README_DE.md">Deutsch</a> •
  <a href="README_FR.md">Français</a> •
  <a href="README_JA.md">日本語</a>
</p>

---

<p align="center">
  <img src="docs/images/preview.png" alt="Claudian 预览" width="700">
</p>

---

## 什么是 Claudian？

Claudian 将 **Claude AI** 直接带入您的 Obsidian 知识库。在专用侧边栏中与 Claude 聊天，处理您的笔记以获取智能建议，并使用**代理模式**通过自然语言命令管理整个知识库。

您的 API 密钥保存在您的设备上。除非您要求 Claude 分析笔记，否则您的笔记永远不会离开您的知识库。

---

## 功能

### 💬 集成聊天
无需离开 Obsidian 即可与 Claude 对话。响应实时流式传输，您可以随时中途停止任何请求。

### 📝 智能笔记处理
分析您的笔记，根据知识库的现有结构获取**标签**、**维基链接**和**原子概念**的智能建议。

### 🤖 代理模式
使用自然语言管理您的知识库：
- *"创建一个 Projects/2025 文件夹，并为每个季度创建子文件夹"*
- *"将所有带有 #存档 标签的笔记移动到 Archive 文件夹"*
- *"将这篇笔记翻译成英文"*

**52 种操作**涵盖文件管理、编辑器控制、模板、书签、画布等。

### 📊 批量处理
使用提取模板一次处理多篇笔记：
- 关键想法和摘要
- 问题和待办事项
- 概念和联系

### 🗺️ 概念图
从选定的笔记生成可视化概念图，以 Mermaid 格式渲染。

### 🧠 智能模型选择
自动模型编排将每个任务路由到最佳的 Claude 模型：
- 简单任务 → Haiku（快速且经济）
- 内容创作 → Sonnet（平衡）
- 深度分析 → Opus（最高质量）

### 🌍 多语言支持
完全支持**英语**、**西班牙语**、**中文**、**德语**、**法语**和**日语**。更多语言即将推出。

---

## 安装

### 从社区插件安装（推荐）
1. 打开**设置 → 社区插件**
2. 点击**浏览**并搜索 "Claudian"
3. 点击**安装**，然后**启用**

### 手动安装
1. 从 [Releases](https://github.com/Enigmora/claudian/releases) 下载最新版本
2. 解压到知识库的 `.obsidian/plugins/claudian/` 目录
3. 在**设置 → 社区插件**中启用

---

## 快速开始

1. 在 [console.anthropic.com](https://console.anthropic.com/) 获取您的 API 密钥
2. 打开**设置 → Claudian**并输入您的密钥
3. 点击功能区中的 Claudian 图标或使用命令面板
4. 开始聊天！

> **注意：** 此插件需要 Anthropic 提供的 API 密钥。API 使用可能会根据 [Anthropic 的定价](https://www.anthropic.com/pricing)产生费用。Claudian 与 Anthropic 无关联。

有关详细配置选项，请参阅[配置指南](https://github.com/Enigmora/claudian/wiki/Configuration)。

---

## 文档

访问 **[Wiki](https://github.com/Enigmora/claudian/wiki)** 获取完整文档：

- [入门指南](https://github.com/Enigmora/claudian/wiki/Getting-Started)
- [聊天界面](https://github.com/Enigmora/claudian/wiki/Features/Chat-Interface)
- [代理模式](https://github.com/Enigmora/claudian/wiki/Features/Agent-Mode)
- [批量处理](https://github.com/Enigmora/claudian/wiki/Features/Batch-Processing)
- [故障排除](https://github.com/Enigmora/claudian/wiki/Troubleshooting)

---

## 隐私与安全

- **网络使用**：此插件连接到 [Anthropic API](https://api.anthropic.com) 来处理您的请求。只有当您明确要求 Claude 分析笔记时，笔记内容才会被发送。
- **本地存储**：您的 API 密钥仅存储在您的设备上，保存在 Obsidian 的插件数据中
- **无遥测**：我们不收集任何使用数据或分析信息
- **开源**：100% 可审计的代码，采用 [MIT 许可证](LICENSE)

---

## 贡献

欢迎贡献！详情请参阅我们的[贡献指南](CONTRIBUTING.md)。

```bash
git clone https://github.com/Enigmora/claudian.git
cd claudian && npm install
npm run dev
```

---

## 许可证

[MIT 许可证](LICENSE) — 可在您的项目中自由使用。

---

<p align="center">
  <img src="assets/logo.svg" alt="Claudian" width="48">
</p>

<p align="center">
  <strong>Claudian</strong><br>
  <sub>由 <a href="https://github.com/Enigmora">Enigmora</a> 开发</sub>
</p>
