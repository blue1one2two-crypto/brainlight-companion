#!/bin/bash
# Brainlight v2026 Progenesis - 阿里云全自动部署脚本 (无密码版)
# 用途：将构建产物同步至阿里云服务器的 coltbot home 目录

# ===== 配置区 =====
REMOTE_USER="coltbot"
REMOTE_HOST="47.250.51.214"
# 使用 home 目录下的站点目录 (coltbot 可写！)
REMOTE_SITE_DIR="/home/coltbot/www/brainlight"
DOMAIN="brainlight.bar"
LOCAL_BUILD_DIR="./dist"

echo "🚀 [Brainlight Deploy] 开始全自动部署至阿里云 (无密码模式)..."
echo "📍 目标目录：$REMOTE_SITE_DIR"

# 1. 检查本地构建产物
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
  echo "❌ 错误：未找到构建目录 $LOCAL_BUILD_DIR"
  echo "💡 请先运行 'npm run build' 生成生产构建"
  exit 1
fi

# 2. 检查 SSH 连通性
echo "🔍 测试服务器连接 ($REMOTE_HOST)..."
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes $REMOTE_USER@$REMOTE_HOST "exit" 2>/dev/null; then
    echo "🔑 未检测到 SSH 授权，正在配置免密登录..."
    echo "💡 系统将提示您输入服务器密码（首次部署需要）"
    ssh-copy-id -i ~/.ssh/id_ed25519.pub $REMOTE_USER@$REMOTE_HOST
    if [ $? -ne 0 ]; then
        echo "❌ SSH 授权失败，请检查密码或网络"
        exit 1
    fi
    echo "✅ SSH 授权成功！"
fi

# 3. 确保远程站点目录存在并清理旧文件
echo "📂 准备远程站点目录..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_SITE_DIR && rm -rf $REMOTE_SITE_DIR/*"

# 4. 使用 scp 同步构建文件 (无需 sudo！)
echo "📤 正在同步构建文件..."
scp -r $LOCAL_BUILD_DIR/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_SITE_DIR/

if [ $? -ne 0 ]; then
    echo "❌ 同步失败"
    exit 1
fi

echo "✅ 文件同步成功！"


# 5. 检查符号链接是否已建立
echo "🔗 检查 Nginx 站点符号链接..."
LINK_STATUS=$(ssh $REMOTE_USER@$REMOTE_HOST "readlink -f /var/www/brainlight 2>/dev/null || echo 'NOT_LINK'")

if [[ "$LINK_STATUS" == "$REMOTE_SITE_DIR" ]]; then
    echo "✅ 符号链接已正确配置"
else
    echo ""
    echo "⚠️  [首次部署需要一次性设置符号链接]"
    echo "💡 请手动登录服务器运行以下命令（仅需一次）："
    echo ""
    echo "   ssh $REMOTE_USER@$REMOTE_HOST"
    echo "   sudo rm -rf /var/www/brainlight"
    echo "   sudo ln -s $REMOTE_SITE_DIR /var/www/brainlight"
    echo "   sudo chown -h $REMOTE_USER:$REMOTE_USER /var/www/brainlight"
    echo ""
    echo "🔧 或一键执行："
    echo "   ssh -t $REMOTE_USER@$REMOTE_HOST \"sudo rm -rf /var/www/brainlight && sudo ln -s $REMOTE_SITE_DIR /var/www/brainlight\""
    echo ""
fi

# 6. 完成提示
echo ""
echo "✨ [部署完成] Brainlight v2026 已同步至服务器！"
echo "🌐 访问地址："
echo "   - https://$DOMAIN (HTTPS 已启用)"
echo "   - http://$REMOTE_HOST"
echo ""
