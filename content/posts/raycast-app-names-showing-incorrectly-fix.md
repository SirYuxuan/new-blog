---
title: 修复Raycast应用名称显示问题
date: "2025-10-15"
tags: ['Raycast', 'macOS', 'Troubleshooting']
---

## 问题描述

如果你发现 Raycast 搜索应用时，显示的应用名称是英文（例如 `WeChat`, `Calendar`, `Activity Monitor`），而你的 macOS 系统界面（如程序坞、启动台）显示的是正确的中文名（如「微信」、「日历」、「活动监视器」），这篇文章将为你解释原因并提供修复步骤。

这不是 Raycast 的 Bug，而是一个与 macOS 系统底层相关的问题。

## 根本原因：macOS 的双层名称机制

理解这个问题的关键在于了解 macOS 如何存储和显示应用名称：

1.  **底层元数据（Spotlight 索引）**：
    *   这是 `mdls` 命令和 Raycast 读取的数据源。
    *   存储在由 **Spotlight** 维护的索引中。
    *   当这个索引损坏或未更新时，应用名称就可能显示为英文或旧名称。

2.  **表层显示名称（系统界面）**：
    *   这是你在程序坞、访达和启动台中看到的名称。
    *   系统直接读取应用程序包内的本地化资源文件（如 `zh_CN.lproj/InfoPlist.strings`）。
    *   因此，即使 Spotlight 索引出了问题，系统界面通常也能正确显示。

**简单来说**：Raycast 依赖的“数据库”（Spotlight 索引）出错了，而系统界面有自己获取名称的“捷径”，所以出现了显示不一致的情况。

## 修复步骤

请按照以下步骤操作，从最简单的方法开始尝试。

### 方法一：强制重建 Spotlight 索引（最有效）

这是解决此问题最根本的方法。它会强制 macOS 重新扫描所有文件和应用，重建其内部搜索数据库。

1.  打开 **“系统设置”** > **“聚焦”**。
2.  在 **“隐私”** 标签页中，将你的整个硬盘（通常是 `Macintosh HD`）拖入列表，或点击 `+` 号添加它。这会暂时禁用该磁盘的索引。
3.  等待几分钟，然后从隐私列表中移除该磁盘。系统会立即开始重建索引。

**或者，使用终端命令（更直接）：**

```bash
# 1. 首先，确保 Spotlight 索引是开启状态
sudo mdutil -i on /

# 2. 强制删除并重建索引（这需要一些时间，请耐心等待）
sudo mdutil -E /
```

执行后，你可能会看到如下提示：
```
/:
    Indexing enabled.
```
重建索引的过程可能在后台持续数小时，期间你可能会听到风扇声，这是正常的。

### 方法二：重启系统核心服务

有时，简单地重启相关服务也能刷新数据。

1.  打开 **“活动监视器”**。
2.  在搜索框中输入 `spotlight`。
3.  选中名为 `mds` 或 `mds_stores` 的进程，点击左上角的 **“强制结束”** (X) 按钮。系统会自动重启该进程。

### 方法三：重置 Raycast 的缓存

如果系统索引是正确的，但 Raycast 仍然显示旧数据，可以尝试清除其缓存。

1.  完全退出 Raycast。
2.  打开 **“终端”** 应用，输入以下命令后回车：
    ```bash
    defaults delete com.raycast.macos
    ```
3.  重新启动 Raycast。

## 验证修复是否成功

要检查 Spotlight 索引是否已恢复正常，可以打开 **“终端”** 并使用我们在文章中提到的 `mdls` 命令进行测试。

```bash
# 检查“日历”应用
mdls -name kMDItemDisplayName /System/Applications/Calendar.app

# 检查“活动监视器”
mdls -name kMDItemDisplayName /System/Applications/Utilities/Activity\ Monitor.app
```

如果命令返回了正确的中文名称（例如 `kMDItemDisplayName = "日历"`），说明索引已修复。此时 Raycast 中的应用名称通常也会随之恢复正常。

## 总结

Raycast 应用名称显示异常，本质上是一个 **Spotlight 索引问题**。通过 **重建 Spotlight 索引**，你可以从根本上解决它。虽然这需要一些等待时间，但通常是一劳永逸的。

如果问题依旧，可以尝试在 Raycast 中为特定应用设置 **昵称（Alias）**：找到该应用后，按 `⌘ + Return` 即可为其设置一个你习惯的中文昵称，方便以后搜索。
