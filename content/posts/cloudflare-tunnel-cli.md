---
title: Cloudflare Tunnel 命令行使用教程
date: "2026-07-03"
tags: ['Cloudflare','Tunnel','内网穿透','安装配置']
description: "使用 cloudflared 命令行创建 Cloudflare Tunnel，把本地 Web、TCP 或 SSH 服务安全暴露出去。"
---

## 概述

Cloudflare Tunnel 可以把你电脑或内网里的服务通过 Cloudflare 暴露到公网。它的好处是：本机不需要公网 IP，也不需要在路由器上做端口转发；`cloudflared` 会从本机主动连到 Cloudflare，再由 Cloudflare 把访问流量转发回来。

这篇文章主要记录命令行用法。示例里会保留少量 Windows 路径；macOS 和 Linux 用户把路径和服务管理命令换成自己的环境即可。常见用法分为两类：

- **临时测试**：快速生成一个随机域名，适合演示或调试。
- **长期使用**：绑定自己的域名，例如 `app.example.com`，适合真正部署。

## 准备工作

开始之前，需要准备：

- **一台能运行 cloudflared 的电脑**
- **PowerShell、CMD、Bash、Zsh 或其他终端**
- **Cloudflare 账号**
- **一个已经接入 Cloudflare 的域名**，长期绑定自定义域名时需要
- **本地服务**，例如 `http://localhost:3000`、`http://localhost:8080`、SSH、RDP 或其他 TCP 服务

如果只是临时测试，不绑定自己的域名，也可以先看「快速体验」。

## 安装 cloudflared

不同系统的安装方式略有区别。Windows 可以使用 `winget`：

```powershell
winget install --id Cloudflare.cloudflared
```

安装完成后检查版本：

```powershell
cloudflared --version
```

如果命令找不到，重新打开一个终端再试。还是不行的话，检查 `cloudflared.exe` 所在目录是否已经加入 `PATH`。

macOS 可以使用 Homebrew：

```bash
brew install cloudflared
```

Linux 可以从 Cloudflare 官方下载对应架构的包，或者使用发行版支持的安装方式。

部分平台上的 `cloudflared` 不会自动更新，后续可以重新执行安装命令或下载最新版覆盖旧版本。

## 快速体验：不绑定域名

假设本地已经有一个服务运行在 `http://localhost:8080`，直接执行：

```powershell
cloudflared tunnel --url http://localhost:8080
```

启动成功后，终端里会输出一个随机的 `trycloudflare.com` 地址。把这个地址发给别人，对方就能访问你本地的 `8080` 服务。

这个方式非常适合临时演示，但不适合长期使用：

- 地址是随机的，不方便记忆
- 进程停止后访问就会断
- 如果 `%USERPROFILE%\.cloudflared` 里已经有 `config.yml`，可能会影响快速隧道，需要临时改名再运行

## 长期使用：绑定自己的域名

下面假设你要把本机的 `http://localhost:3000` 发布到：

```text
app.example.com
```

请把文中的 `example.com`、`app.example.com`、`my-app-tunnel` 替换成你自己的域名和隧道名称。

### 1. 登录 Cloudflare

执行：

```powershell
cloudflared tunnel login
```

这会打开浏览器，让你登录 Cloudflare 并选择要授权的域名。完成后，本机会生成一个证书文件，通常在：

```text
C:\Users\<你的用户名>\.cloudflared\cert.pem
```

### 2. 创建 Tunnel

```powershell
cloudflared tunnel create my-app-tunnel
```

执行成功后，终端会输出一个 Tunnel ID，也就是一串 UUID，例如：

```text
Created tunnel my-app-tunnel with id 11111111-2222-3333-4444-555555555555
```

同时会在 `%USERPROFILE%\.cloudflared` 下生成一个对应的 JSON 凭证文件。

可以用下面的命令确认隧道存在：

```powershell
cloudflared tunnel list
```

### 3. 写配置文件

创建配置目录：

```powershell
mkdir $env:USERPROFILE\.cloudflared
```

编辑配置文件：

```powershell
notepad $env:USERPROFILE\.cloudflared\config.yml
```

写入下面内容：

```yaml
tunnel: 11111111-2222-3333-4444-555555555555
credentials-file: C:\Users\<你的用户名>\.cloudflared\11111111-2222-3333-4444-555555555555.json

ingress:
  - hostname: app.example.com
    service: http://localhost:3000
  - service: http_status:404
```

这里有几个点要注意：

- `tunnel` 填刚才创建出来的 Tunnel ID。
- `credentials-file` 填对应 JSON 文件的真实路径。
- `hostname` 填你准备访问的域名。
- `service` 填本地服务地址。
- 最后一条 `http_status:404` 是兜底规则，建议保留。

如果你的本地服务是 HTTPS，但证书是自签名证书，可以临时这样写：

```yaml
ingress:
  - hostname: app.example.com
    service: https://localhost:8443
    originRequest:
      noTLSVerify: true
  - service: http_status:404
```

`noTLSVerify: true` 适合开发环境，生产环境最好换成可信证书。

### 4. 校验配置

```powershell
cloudflared tunnel ingress validate
```

如果想检查某个 URL 会命中哪条规则：

```powershell
cloudflared tunnel ingress rule https://app.example.com
```

### 5. 绑定 DNS

```powershell
cloudflared tunnel route dns my-app-tunnel app.example.com
```

这个命令会在 Cloudflare DNS 中创建一条 CNAME，指向这个 Tunnel 对应的 `cfargotunnel.com` 地址。

### 6. 启动 Tunnel

```powershell
cloudflared tunnel run my-app-tunnel
```

保持这个终端窗口不要关闭，然后访问：

```text
https://app.example.com
```

如果能看到本地 `3000` 端口的服务，说明已经成功。

## 作为系统服务运行

长期使用时，不建议一直开着一个终端窗口。可以把 `cloudflared` 安装成系统服务，让它开机后自动运行。

下面以 Windows 服务为例。先用管理员身份打开 PowerShell 或 CMD，然后执行：

```powershell
cloudflared service install
```

启动服务：

```powershell
sc start cloudflared
```

停止服务：

```powershell
sc stop cloudflared
```

查看服务状态：

```powershell
sc query cloudflared
```

如果你是按前面方式把配置放在 `%USERPROFILE%\.cloudflared\config.yml`，但服务启动后找不到配置，通常是因为 Windows 服务默认运行在系统账户下。更稳的做法是把配置和凭证放到固定目录，并在服务启动参数里指定配置文件。

例如创建目录：

```powershell
mkdir C:\Cloudflared
mkdir C:\Cloudflared\config
```

把 `config.yml` 和 `<Tunnel-ID>.json` 放到：

```text
C:\Cloudflared\config
```

然后把 `config.yml` 里的路径改成：

```yaml
tunnel: 11111111-2222-3333-4444-555555555555
credentials-file: C:\Cloudflared\config\11111111-2222-3333-4444-555555555555.json

ingress:
  - hostname: app.example.com
    service: http://localhost:3000
  - service: http_status:404

logfile: C:\Cloudflared\cloudflared.log
```

如果服务已经安装完成，可以在注册表里把 `Cloudflared` 服务的 `ImagePath` 改成类似下面这样：

```text
C:\Program Files (x86)\cloudflared\cloudflared.exe --config=C:\Cloudflared\config\config.yml tunnel run
```

实际的 `cloudflared.exe` 路径以你电脑上的安装位置为准。修改后重启服务：

```powershell
sc stop cloudflared
sc start cloudflared
```

## 发布多个本地服务

一个 Tunnel 可以转发多个域名。比如：

```yaml
tunnel: 11111111-2222-3333-4444-555555555555
credentials-file: C:\Cloudflared\config\11111111-2222-3333-4444-555555555555.json

ingress:
  - hostname: app.example.com
    service: http://localhost:3000
  - hostname: api.example.com
    service: http://localhost:8080
  - hostname: admin.example.com
    service: http://localhost:9000
  - service: http_status:404
```

然后分别创建 DNS 路由：

```powershell
cloudflared tunnel route dns my-app-tunnel app.example.com
cloudflared tunnel route dns my-app-tunnel api.example.com
cloudflared tunnel route dns my-app-tunnel admin.example.com
```

改完配置后，重启 Tunnel 或系统服务。

## 连接 TCP 或 SSH 服务

Web 服务可以直接用浏览器访问；如果是 TCP、SSH、RDP 这类非 HTTP 服务，通常需要客户端也安装 `cloudflared`，先在本地开一个代理端口，再用原来的客户端连这个本地端口。

### 服务端发布 TCP

例如你要把服务端的 `localhost:7870` 暴露为 `tcp.example.com`：

```powershell
cloudflared tunnel --hostname tcp.example.com --url tcp://localhost:7870
```

这个命令适合临时连接。如果要长期运行，也可以写进 Tunnel 的 `ingress`：

```yaml
ingress:
  - hostname: tcp.example.com
    service: tcp://localhost:7870
  - service: http_status:404
```

### 客户端连接 TCP

在客户端电脑上执行：

```powershell
cloudflared access tcp --hostname tcp.example.com --url localhost:9210
```

然后让你的客户端程序连接：

```text
localhost:9210
```

第一次连接时，`cloudflared` 可能会打开浏览器让你完成 Cloudflare Access 登录。

### SSH 示例

服务端配置：

```yaml
ingress:
  - hostname: ssh.example.com
    service: ssh://localhost:22
  - service: http_status:404
```

创建 DNS：

```powershell
cloudflared tunnel route dns my-app-tunnel ssh.example.com
```

客户端先建立本地代理：

```powershell
cloudflared access tcp --hostname ssh.example.com --url localhost:2222
```

再用 SSH 连本地端口：

```powershell
ssh user@localhost -p 2222
```

如果这个 SSH 暴露到公网，强烈建议在 Cloudflare Zero Trust 里给 `ssh.example.com` 加 Access 策略，只允许自己的邮箱、团队账号或指定身份提供商访问。

## 常用命令

查看 Tunnel 列表：

```powershell
cloudflared tunnel list
```

查看某个 Tunnel 详情：

```powershell
cloudflared tunnel info my-app-tunnel
```

查看 DNS 路由：

```powershell
cloudflared tunnel route list
```

指定配置文件启动：

```powershell
cloudflared tunnel --config C:\Cloudflared\config\config.yml run my-app-tunnel
```

开启调试日志：

```powershell
cloudflared tunnel --loglevel debug run my-app-tunnel
```

删除 Tunnel：

```powershell
cloudflared tunnel delete my-app-tunnel
```

## 常见问题

### 访问域名提示 1016

通常是 Tunnel 没有运行，或者 DNS 路由没有正确指向 Tunnel。

检查：

```powershell
cloudflared tunnel info my-app-tunnel
cloudflared tunnel route list
```

### Tunnel 能启动，但网页打不开

先确认本机服务真的可访问：

```powershell
curl http://localhost:3000
```

如果本机都访问不了，问题不在 Cloudflare Tunnel，而在你的服务本身。

### 修改配置后没有生效

如果是手动运行，停止后重新执行：

```powershell
cloudflared tunnel run my-app-tunnel
```

如果是系统服务：

```powershell
sc stop cloudflared
sc start cloudflared
```

### 公司或服务器防火墙拦截

Cloudflare Tunnel 是主动向外连接 Cloudflare。一般不需要开放入站端口，但出站访问需要允许 `80` 和 `443`。如果网络环境严格，还需要按 Cloudflare 官方文档放行相关连接。

## 小结

最常用的一套命令其实就这些：

```powershell
winget install --id Cloudflare.cloudflared
cloudflared tunnel login
cloudflared tunnel create my-app-tunnel
cloudflared tunnel route dns my-app-tunnel app.example.com
cloudflared tunnel run my-app-tunnel
```

真正容易踩坑的是配置文件路径和系统服务账户。先在普通终端里跑通，再安装成服务，会更容易排查。

参考资料：

- [Cloudflare Tunnel 下载文档](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/)
- [创建本地管理的 Tunnel](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/create-local-tunnel/)
- [Windows 服务运行 cloudflared](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/as-a-service/windows/)
- [Quick Tunnels](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/)
- [Arbitrary TCP 连接](https://developers.cloudflare.com/cloudflare-one/applications/non-http/cloudflared-authentication/arbitrary-tcp/)
