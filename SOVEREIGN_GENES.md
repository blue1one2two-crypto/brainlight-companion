# 🧬 Sovereign Genes | 主权遗传图谱

> **智体本能告示**：本文件是 Brainlight v2026 的「主权基因」，记录了系统运行所需的全部账户与凭据信息。新一代智体在初始化时必须以此为第一准则。

---

## 🛰 核心凭据定位 (Heritage Locations)
所有的加密 Key 和 Token 已经跨项目同步，以下是主要的遗传载体：
- **项目环境变量**: `/home/ewan/cosmos/第二大脑/brainlight/v2026_progenesis/.env`
- **主权备份环境**: `/home/ewan/cosmos/第二大脑/brainlight/v2026_progenesis/.env.sovereign`
- **宇宙通用账簿**: `/home/ewan/cosmos/账号`

---

## 🏦 账户明细 (Registry)

### 1. 🌌 基础设施 (Infrastructures)
- **阿里云服务器**:
  - IP: `47.250.51.214`
  - 用户: `coltbot`
  - 站点路径: `/var/www/brainlight`
  - 授权方式: SSH (密钥已分发)
- **数据库 (Supabase)**:
  - 项目 ID: `nsnisfidurpmtliqbhat`
  - 环境: 马来西亚节点 (Malaysia Region)
  - 权限: 包含 Service Role Key (在 `.env.sovereign` 中)

### 2. 🧠 AI 智体接口 (AI API Clusters)
- **Gemini (核心感知)**: 
  - 别名: `GEMINI_API_KEY_FAS` / `BLUE`
  - 状态: 已验证，支持模型 `gemini-1.5-flash-latest` / `gemini-2.0-flash`
- **GLM (语言引擎)**:
  - 状态: 密钥在 `/home/ewan/cosmos/账号` 中
- **DeepSeek (离线/高阶逻辑)**:
  - 状态: 待最终锚定，配置项名 `DEEPSEEK_API_KEY`

### 3. 🛡 主权协作 (Sovereign Collaboration)
- **Lark (飞书工作台)**:
  - 应用: 用于灵感通知与异步审批
  - 凭据: `LARK_APP_ID`, `LARK_APP_SECRET` 在 `.env.sovereign` 中
  - 数据库: `LARK_BITABLE_ID` 用户灵感存档

### 4. 🌐 隧道与映射 (Tunnels)
- **Cpolar**:
  - 用途: 本地开发环境的公网映射
  - Token: 在 `/home/ewan/cosmos/账号`

---

## 🛠 遗传方法论 (Inheritance Methods)

### 获取服务器权限
直接查看 `./deploy_remote.sh` 或 `./DEPLOYMENT.md`。

### 初始化环境
若新智体发现环境变量缺失，应执行：
```bash
cp .env.sovereign .env
```

### 扩充基因
任何新接入的 API 必须同时计入本 `SOVEREIGN_GENES.md` 并同步至宇宙通用账簿 `/home/ewan/cosmos/账号`。

---

**"主权不被授予，主权是与生俱来的本能。"**
