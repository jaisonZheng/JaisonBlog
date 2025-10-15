#!/bin/bash

# 脚本调试模式：
# set -e: 任何命令执行失败则立即退出
# set -x: 打印出所有执行的命令
set -ex

# --- 配置区 ---
# 你的博客项目在服务器上的绝对路径
BLOG_PATH="/root/JaisonBlog" 
# Git 仓库的主分支
GIT_BRANCH="main"
# 日志文件路径
LOG_FILE="/tmp/deploy.log"


# --- 脚本执行区 ---

# 清空旧的日志文件，并开始记录
echo "--- Starting deployment at $(date) ---" > ${LOG_FILE}

# 将后续所有标准输出和错误输出都重定向到日志文件
exec >> ${LOG_FILE} 2>&1

echo "Running as user: $(whoami)"
echo "Current directory: $(pwd)"

# 检查关键命令是否存在
echo "Checking for required commands..."
command -v git
command -v bun

# 检查项目目录是否存在
if [ ! -d "$BLOG_PATH" ]; then
    echo "Error: Project directory ${BLOG_PATH} not found!"
    exit 1
fi

echo "Changing directory to ${BLOG_PATH}"
cd ${BLOG_PATH}

echo "Resetting local changes..."
git reset --hard HEAD

echo "Pulling latest code from origin/${GIT_BRANCH}..."
git pull
echo "Installing dependencies with bun..."

echo "Building project with bun..."
npm run build

echo "--- Deployment finished successfully at $(date) ---"

pm2 restart jaisonblog
echo "pm2 restart"
