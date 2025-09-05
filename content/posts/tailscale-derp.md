---
title: Tailscale-Derp节点安装配置教程
date: "2025-09-05"
tags: ['教程','安装配置']
---

## 概述
DERP (Designated Encrypted Relay for Packets) 是Tailscale的加密中继服务，用于在NAT穿透失败时提供备用的连接路径。

## 系统要求
- **操作系统**: Linux (推荐Ubuntu 20.04+ 或 CentOS 7+)
- **内存**: 至少512MB RAM
- **存储**: 至少1GB可用空间
- **网络**: 公网IP，开放端口33445、33446、3478

## 安装步骤

### 1. 下载Derp二进制文件并安装
```bash
# 更新软件包列表 & 升级系统 
sudo apt update && sudo apt upgrade -y

# 安装基本依赖 
sudo apt install -y wget git openssl curl

# 下载Golang，我使用的是x86_64版本，您也可以根据需要选择合适的版本 [All releases - The Go Programming Language](https://go.dev/dl/) 
wget https://go.dev/dl/go1.22.3.linux-amd64.tar.gz

# 删除旧的Golang并解压新的内容 
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.3.linux-amd64.tar.gz

# 配置环境变量 
export PATH=$PATH:/usr/local/go/bin

# 检查Golang是否安装成功 
go version

# 配置Golang环境（国外服务器可跳过） 
go env -w GO111MODULE=on 
go env -w GOPROXY=https://goproxy.cn,direct

# 安装Tailscale Derper 
go install tailscale.com/cmd/derper@main

# 创建 /etc/derp 文件夹并赋予权限，以便后续修改文件重新编译到这里
sudo mkdir -p /etc/derp/
sudo chmod 777 /etc/derp/

# 编译文件到指定文件夹(*是通配符，可指定具体版本目录)
cd ~/go/pkg/mod/tailscale.com@*/cmd/derper

# 编译文件到之前创建的文件夹
go build -o /etc/derp/derper

# 创建derp.service

sudo sh -c "cat > /etc/systemd/system/derp.service <<EOF
[Unit]
Description=TS Derper
After=network.target
Wants=network.target

[Service]
User=root
WorkingDirectory=/etc/derp
ExecStart=/etc/derp/derper \
  -verify-clients \
  -hostname derp.domain.com \
  -a :33445 \
  -http-port 33446 \
  -certmode manual \
  -certdir /etc/derp
Restart=always
RestartPreventExitStatus=1

[Install]
WantedBy=multi-user.target

EOF
"
# 自行把证书放到下面位置
# /etc/derp/derp.domain.com.crt
# /etc/derp/derp.domain.com.key


```
### 2. 安装tailscaled
**derper 需要本地运行的 `tailscaled` 来验证客户端状态**

```bash
# 如果你用的是 Linux x86_64，可以用官方脚本安装）
curl -fsSL https://tailscale.com/install.sh | sh

# 启动
systemctl enable --now tailscaled
systemctl status tailscaled

# 登录 tailscaled（让它加入你的 Tailscale 网络）
tailscale up
```

### 3. 启动derper
```bash
# 启动服务
systemctl restart derp
# 查看日志
journalctl -u derp -f
```

配置文件内容：
```json
{
  "version": "1",
  "regions": {
    "999": {
      "regionID": 999,
      "regionCode": "my-derp",
      "regionName": "My DERP Server",
      "nodes": [
        {
          "name": "derp1",
          "regionID": 999,
          "hostName": "your-server-ip",
          "ipv4": "your-server-ip",
          "derpPort": 33445,
          "stunPort": 33446,
          "stunOnly": false
        }
      ]
    }
  }
}
```

### 3. 创建systemd服务文件
```bash
sudo nano /etc/systemd/system/derp.service
```

服务文件内容：
```ini
[Unit]
Description=DERP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/etc/derp
ExecStart=/etc/derp/derp -config=/etc/derp/derp.conf
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 4. 启动服务
```bash
# 重新加载systemd配置
sudo systemctl daemon-reload

# 启用服务（开机自启）
sudo systemctl enable derp

# 启动服务
sudo systemctl start derp

# 检查服务状态
sudo systemctl status derp
```

- **注意开放端口 3478、33445、33446**

## 配置Tailscale客户端

### 1. 在Tailscale管理后台配置
1. 登录 [Tailscale管理后台](https://login.tailscale.com/admin/acls/file)
2. 在JSON editor里添加如下代码
```json
"derpMap": {
		"OmitDefaultRegions": true,
		"Regions": {
			"901": {
				"RegionID":   901,
				"RegionCode": "YuxuanMini",
				"RegionName": "YuxuanMini Derper",
				"Nodes": [
					{
						"Name":             "901a",
						"RegionID":         901,
						"HostName":         "derp.domain.com",
						"DERPPort":         33445,
						"IPv4":             "your public ip",
						"InsecureForTests": true
					}
				]
			}
		}
	},
```
![](https://oss.yuxuan66.com/obsidian/20250828133938717-1756359578797-1756359587932-1756359592601.png)


## 验证安装

### 1. 检查服务状态
```bash
# 查看服务状态
sudo systemctl status derp

# 查看日志
sudo journalctl -u derp -f

# 检查端口监听
sudo netstat -tlnp | grep derp
```

### 2. 测试连接
```bash
# 测试DERP端口
telnet your-server-ip 33445

# 测试STUN端口
nc -u your-server-ip 33446
```

## 故障排除

### 常见问题

#### 1. 服务启动失败
```bash
# 查看详细日志
sudo journalctl -u derp -n 50

# 检查配置文件语法
/etc/derp/derp -config=/etc/derp/derp.conf -check
```

#### 2. 端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :33445
sudo netstat -tlnp | grep :33446

# 杀死占用进程
sudo kill -9 <PID>
```

#### 3. 防火墙问题
```bash
# 检查防火墙状态
sudo ufw status
# 或
sudo firewall-cmd --list-all
```



## 总结
通过以上步骤，您就可以成功搭建一个DERP服务器，为Tailscale网络提供可靠的中继服务。记得定期维护和监控服务状态，确保网络的稳定性。
