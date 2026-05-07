---
title: Claude Code 对接 DeepSeek 使用教程
date: "2026-05-07"
tags: ['Claude Code','DeepSeek','AI','安装配置']
description: "从安装 Claude Code 开始，介绍如何通过 DeepSeek 的 Anthropic 兼容接口，让 Claude Code 使用 DeepSeek 模型。"
---

## 概述

Claude Code 是一个运行在终端里的 AI 编程助手。正常情况下，它会连接 Anthropic 官方服务；如果你想使用 DeepSeek 的模型，可以通过 DeepSeek 提供的 Anthropic 兼容接口，把 Claude Code 的请求转发到 DeepSeek。

这篇文章主要记录从零安装 Claude Code，并把它配置为使用 DeepSeek 的过程。

## 准备工作

在开始之前，需要准备以下内容：

- **Node.js 18+**：npm 安装方式需要用到
- **DeepSeek API Key**：在 [DeepSeek 开放平台](https://platform.deepseek.com/) 创建
- **一个本地项目目录**：Claude Code 通常在项目目录中启动
- **终端环境**：macOS / Linux 推荐 Bash、Zsh 或 Fish；Windows 推荐 PowerShell、Git Bash 或 WSL

如果你已经安装过 Claude Code，可以跳过安装部分，直接看「配置 DeepSeek」。

## 安装 Claude Code

### 方法一：使用 npm 安装

这是 DeepSeek 官方文档中给出的安装方式，也适合已经安装 Node.js 的用户。

```bash
npm install -g @anthropic-ai/claude-code
```

安装完成后，检查版本：

```bash
claude --version
```

如果能看到版本号，说明安装成功。

> 注意：不建议使用 `sudo npm install -g`，否则后续自动更新或权限管理可能会比较麻烦。如果遇到 npm 全局安装权限问题，优先修复 npm 的全局目录权限。

### 方法二：使用官方安装脚本

Anthropic 官方也提供了原生安装脚本。macOS、Linux、WSL 可以执行：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell 可以执行：

```powershell
irm https://claude.ai/install.ps1 | iex
```

安装后同样用下面的命令验证：

```bash
claude --version
claude doctor
```

`claude doctor` 可以检查当前安装方式、版本和环境是否正常。

## 配置 DeepSeek

DeepSeek 提供了 Anthropic API 兼容地址，所以核心配置就是把 Claude Code 的 API 地址、Token 和模型名改成 DeepSeek。

### macOS / Linux 临时配置

在终端中执行：

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=<你的 DeepSeek API Key>
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
```

然后进入你的项目目录：

```bash
cd /path/to/my-project
claude
```

这里的配置只对当前终端窗口生效。关闭终端后，需要重新执行。

### Windows PowerShell 临时配置

Windows 用户可以在 PowerShell 中执行：

```powershell
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="<你的 DeepSeek API Key>"
$env:ANTHROPIC_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-v4-pro[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-v4-flash"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
```

然后执行：

```powershell
cd C:\path\to\my-project
claude
```

## 持久化配置

如果你不想每次打开终端都重新 export，可以把环境变量写入 Shell 配置文件。

### macOS / Linux

如果你使用 Zsh：

```bash
nano ~/.zshrc
```

如果你使用 Bash：

```bash
nano ~/.bashrc
```

追加下面的内容：

```bash
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
export ANTHROPIC_AUTH_TOKEN=<你的 DeepSeek API Key>
export ANTHROPIC_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_OPUS_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_SONNET_MODEL=deepseek-v4-pro[1m]
export ANTHROPIC_DEFAULT_HAIKU_MODEL=deepseek-v4-flash
export CLAUDE_CODE_SUBAGENT_MODEL=deepseek-v4-flash
export CLAUDE_CODE_EFFORT_LEVEL=max
```

保存后重新加载配置：

```bash
source ~/.zshrc
```

或者：

```bash
source ~/.bashrc
```

### 使用 Claude Code 的 settings.json

Claude Code 也支持通过 `~/.claude/settings.json` 配置环境变量。这个方式适合只想让 Claude Code 使用这些变量，而不是污染整个终端环境。

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "<你的 DeepSeek API Key>",
    "ANTHROPIC_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "deepseek-v4-pro[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "deepseek-v4-flash",
    "CLAUDE_CODE_SUBAGENT_MODEL": "deepseek-v4-flash",
    "CLAUDE_CODE_EFFORT_LEVEL": "max"
  }
}
```

如果你已经有 `settings.json`，不要直接覆盖整个文件，只需要合并其中的 `env` 字段即可。

## 验证是否生效

进入任意项目目录：

```bash
cd /path/to/my-project
claude
```

启动后可以先问一个简单问题：

```text
请用一句话说明当前项目的技术栈。
```

如果 Claude Code 能正常返回，并且 DeepSeek 控制台出现了 API 调用记录，说明已经接入成功。

也可以在 Claude Code 内执行：

```text
/status
```

查看当前配置来源，确认环境变量是否被读取。

## 常见问题

### 1. 提示 API Key 无效

先检查 `ANTHROPIC_AUTH_TOKEN` 是否填成了 DeepSeek API Key，而不是 Anthropic 的 Key。

还要注意不要把尖括号一起填进去：

```bash
# 错误
export ANTHROPIC_AUTH_TOKEN=<sk-xxxxxxxx>

# 正确
export ANTHROPIC_AUTH_TOKEN=sk-xxxxxxxx
```

### 2. 请求超时

长任务或大文件分析可能触发客户端超时，可以补充设置：

```bash
export API_TIMEOUT_MS=600000
```

这里是 10 分钟。DeepSeek 的 Anthropic API 文档也推荐过类似配置。

### 3. 模型名报错

DeepSeek 的模型名可能会随着平台更新变化。如果 `deepseek-v4-pro[1m]` 不可用，可以先换成通用模型：

```bash
export ANTHROPIC_MODEL=deepseek-chat
export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat
```

实际可用模型以 DeepSeek 官方文档和控制台为准。

### 4. npm 安装失败

先检查 Node.js 版本：

```bash
node -v
npm -v
```

Claude Code 需要 Node.js 18 或更高版本。如果版本太低，建议先升级 Node.js，再重新执行：

```bash
npm install -g @anthropic-ai/claude-code
```

## 总结

Claude Code 对接 DeepSeek 的关键点只有三个：

1. 安装 Claude Code
2. 获取 DeepSeek API Key
3. 设置 `ANTHROPIC_BASE_URL`、`ANTHROPIC_AUTH_TOKEN` 和模型环境变量

配置完成后，日常使用方式不变，仍然是在项目目录中执行 `claude`。区别只是底层模型从 Anthropic 切换成了 DeepSeek。

参考文档：

- [Claude Code 安装文档](https://docs.anthropic.com/en/docs/claude-code/setup)
- [Claude Code settings 文档](https://docs.anthropic.com/en/docs/claude-code/settings)
- [DeepSeek 接入 Claude Code 文档](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code)
- [DeepSeek Anthropic API 文档](https://api-docs.deepseek.com/zh-cn/guides/anthropic_api)
