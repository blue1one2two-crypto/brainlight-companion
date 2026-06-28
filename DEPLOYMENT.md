# Brainlight v2026 | 部署配置文档

## 🌐 阿里云服务器信息

| 配置项 | 值 |
| :--- | :--- |
| **服务器IP** | `47.250.51.214` |
| **SSH 用户** | `coltbot` |
| **站点目录** | `/var/www/brainlight` |
| **域名** | `brainlight.bar` (主) / `www.brainlight.bar` (副) |
| **Web 服务器** | Nginx |

---

## 🚀 快速部署

### 方式一：自动化脚本（推荐）
```bash
# 1. 构建生产版本
npm run build

# 2. 运行部署脚本
./deploy_remote.sh
```

> [!NOTE]
> 首次部署时，脚本会自动配置 SSH 免密登录与 Nginx 虚拟主机。

### 方式二：手动部署
```bash
# 1. 构建
npm run build

# 2. 使用 rsync 同步
rsync -avz --delete dist/ coltbot@47.250.51.214:/var/www/brainlight/
```

---

## 🔧 服务器环境要求

### 已安装服务
- ✅ Nginx
- ✅ Node.js (仅用于本地构建)
- ✅ SSH Server (端口 22)

### Nginx 配置参考
```nginx
server {
    listen 80;
    server_name brainlight.bar www.brainlight.bar;
    root /var/www/brainlight;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## 🔐 SSH 配置

### 初次连接
```bash
# 生成 SSH 密钥（如果没有）
ssh-keygen -t ed25519 -C "brainlight-deploy"

# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub coltbot@47.250.51.214
```

### 测试连接
```bash
ssh coltbot@47.250.51.214 "echo 'SSH 连接成功'"
```

---

## 🌍 域名解析

### DNS 记录（在域名注册商处配置）
| 类型 | 主机记录 | 记录值 | TTL |
| :--- | :--- | :--- | :--- |
| A | @ | 47.250.51.214 | 600 |
| A | www | 47.250.51.214 | 600 |

### 验证解析
```bash
# 检查域名解析
dig brainlight.bar +short
# 应返回: 47.250.51.214
```

---

## 🔒 HTTPS 配置（可选）

### 使用 Let's Encrypt
```bash
# 登录服务器
ssh coltbot@47.250.51.214

# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 自动配置 SSL
sudo certbot --nginx -d brainlight.bar -d www.brainlight.bar

# 测试自动续期
sudo certbot renew --dry-run
```

---

## 📝 故障排查

### 问题：SSH 连接超时
```bash
# 检查服务器是否在线
ping 47.250.51.214

# 检查 SSH 端口是否开放
nc -zv 47.250.51.214 22
```

### 问题：Nginx 无法启动
```bash
# 登录服务器检查配置
ssh coltbot@47.250.51.214
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

### 问题：域名无法访问
1. 确认 DNS 解析生效（可能需要 10 分钟至 48 小时）
2. 检查阿里云安全组是否开放 80/443 端口
3. 验证 Nginx 配置与站点目录权限

---

## 🔄 更新流程

### 常规更新
```bash
# 本地开发 → 构建 → 部署
npm run build && ./deploy_remote.sh
```

### 回滚到上一版本
```bash
# 服务器端维护了旧版本备份（如果配置了）
ssh coltbot@47.250.51.214 "cd /var/www && ls -la"
```

---

## 📞 联系信息

- **部署脚本位置**: `/home/ewan/cosmos/第二大脑/brainlight/v2026_progenesis/deploy_remote.sh`
- **服务器管理**: SSH `coltbot@47.250.51.214`
- **技术支持**: 由 Antigravity AI 协同
