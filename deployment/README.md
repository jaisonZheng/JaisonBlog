# 腾讯云博客自动更新

GitHub `main` push → `https://jaison.ink/webhook` → 签名校验 → 部署脚本 → GitHub HTTPS fetch → 构建 → 切换 dist → PM2 重启 → HTTP 健康检查。

服务器配置位于 `/etc/jaisonblog/deploy.env`，webhook 密钥位于 `/etc/jaisonblog/webhook.secret`（仅 root 可读，不能提交）。Nginx 将 `/webhook` 转发到 `127.0.0.1:10086`。PM2 的 `webhook-listener` 启动仓库根目录的 `webhook-server.cjs`。

默认仅部署脚本及其子进程使用 `http://127.0.0.1:7890` 代理（服务器已有的 `stonemonkey-mihomo`）；博客服务和其他程序不设置全局代理。公网仓库 HTTPS 拉取不需要 GitHub 私钥或 token。

`deploy.sh` 使用 Bash、flock、Git、Node/npm、curl 和 PM2。Git 只做 fast-forward，保留未提交修改；构建时按 package-lock 安装包含开发依赖的 npm 包，默认使用 npmmirror。大型资源在构建目录中使用硬链接，依赖按锁文件哈希复用。构建失败保持当前站点；重启后健康检查失败会切回旧构建。每次构建前清理上一轮的旧回滚版本，成功后留下当前版本和一个回滚版本。空间不足会退出并写日志。

查看日志：

```sh
ssh myserver 'sudo -i pm2 logs webhook-listener --lines 50 --nostream'
ssh myserver 'sudo ls -t /root/JaisonBlog/logs/deploy-*.log | head'
```

手动部署（先加载 root 的 Node/PM2 PATH）：

```sh
ssh myserver 'sudo -i bash /root/JaisonBlog/deploy.sh'
```

相同提交会跳过重建；需要强制重建时设置 `FORCE_DEPLOY=1`。状态文件为 `/root/JaisonBlog/.deploy/deployed-commit`。

本地 `origin` 的 push URL 应只保留 GitHub，避免 Gitee 容量或认证失败影响 `git push origin main`。分支推送、删除事件和非目标仓库事件不会部署。
