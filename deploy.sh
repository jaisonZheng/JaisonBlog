#!/usr/bin/env bash
set -Eeuo pipefail
umask 027
CONFIG_FILE="${BLOG_DEPLOY_CONFIG:-/etc/jaisonblog/deploy.env}"
[[ ! -f "$CONFIG_FILE" ]] || source "$CONFIG_FILE"
BLOG_PATH="${BLOG_PATH:-/root/JaisonBlog}"
GIT_BRANCH="${GIT_BRANCH:-main}"
GITHUB_URL="${GITHUB_URL:-https://github.com/jaisonZheng/JaisonBlog.git}"
DEPLOY_PROXY="${DEPLOY_PROXY:-http://127.0.0.1:7890}"
PM2_APP="${PM2_APP:-jaisonblog}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:4321/}"
STATE="$BLOG_PATH/.deploy"
mkdir -p "$STATE/releases" "$STATE/dependencies" "$BLOG_PATH/logs"
exec 9>"$STATE/deploy.lock"
flock -w 1800 9 || { echo 'Another deployment holds the lock'; exit 1; }
LOG_FILE="$BLOG_PATH/logs/deploy-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee -a "$LOG_FILE") 2>&1
export CI=true GIT_TERMINAL_PROMPT=0
# Bound V8 and image-worker memory on the 2 GB Tencent host.
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=512}"
export UV_THREADPOOL_SIZE="${UV_THREADPOOL_SIZE:-1}"
export MALLOC_ARENA_MAX="${MALLOC_ARENA_MAX:-2}"
export VIPS_CONCURRENCY="${VIPS_CONCURRENCY:-1}"
# Proxy applies only to this process and its children, never to the whole server.
export HTTPS_PROXY="$DEPLOY_PROXY" HTTP_PROXY="$DEPLOY_PROXY" ALL_PROXY="$DEPLOY_PROXY"
export https_proxy="$DEPLOY_PROXY" http_proxy="$DEPLOY_PROXY" all_proxy="$DEPLOY_PROXY"
export NO_PROXY='localhost,127.0.0.1,::1' no_proxy='localhost,127.0.0.1,::1'
STAGE='' PREVIOUS='' SWITCHED=0
health_check() {
  for _ in {1..30}; do
    if curl --noproxy '*' -fsS --max-time 5 "$HEALTH_URL" -o /dev/null; then return 0; fi
    sleep 2
  done
  return 1
}
finish() {
  local status=$?
  trap - EXIT
  if (( status != 0 )); then
    echo "Deployment failed (exit $status); preserving the last working build."
    if (( SWITCHED )); then
      ln -s "$PREVIOUS" "$BLOG_PATH/dist.rollback"
      mv -Tf "$BLOG_PATH/dist.rollback" "$BLOG_PATH/dist"
      pm2 restart "$PM2_APP" || true
      health_check || echo 'ERROR: rollback health check failed'
    fi
    [[ -z "$STAGE" ]] || rm -rf -- "$STAGE"
  fi
  exit "$status"
}
trap finish EXIT
cd "$BLOG_PATH"
echo "Starting GitHub deployment at $(date -Is)"
git -c http.proxy="$DEPLOY_PROXY" fetch --no-tags "$GITHUB_URL" "+refs/heads/$GIT_BRANCH:refs/remotes/github/$GIT_BRANCH"
TARGET=$(git rev-parse "refs/remotes/github/$GIT_BRANCH")
if [[ -f "$STATE/deployed-commit" && "$(cat "$STATE/deployed-commit")" == "$TARGET" && "${FORCE_DEPLOY:-0}" != 1 ]]; then
  health_check
  echo "Already deployed $TARGET"
  exit 0
fi
# Fail on unexpected local edits or divergent history instead of discarding them.
git merge --ff-only "refs/remotes/github/$GIT_BRANCH"
# Keep the running release; reclaim the older rollback before the next build.
CURRENT=$(readlink -f "$BLOG_PATH/dist")
for release in "$STATE"/releases/*; do
  [[ -d "$release" ]] || continue
  [[ "$release/dist" == "$CURRENT" ]] || rm -rf -- "$release"
done
AVAILABLE=$(df -Pk "$STATE" | awk 'NR==2 {print $4}')
(( AVAILABLE > 1100000 )) || { echo 'Less than 1.1 GB free; refusing to risk the running site.'; exit 1; }
STAGE=$(mktemp -d "$STATE/releases/release-${TARGET:0:12}-XXXXXX")
# Hardlink large immutable content/assets; build metadata stays in the release.
cp -al src public "$STAGE/"
cp package.json package-lock.json astro.config.ts tsconfig.json uno.config.ts "$STAGE/"
DEPS="$STATE/dependencies/$(sha256sum package-lock.json | cut -d' ' -f1)"
if [[ ! -f "$DEPS/.complete" ]]; then
  mkdir -p "$DEPS"
  cp package.json package-lock.json "$DEPS/"
  (cd "$DEPS"; npm ci --include=dev --no-audit --no-fund --registry=https://registry.npmmirror.com)
  if [[ -d "$BLOG_PATH/node_modules/.astro/assets" ]]; then
    mkdir -p "$DEPS/node_modules/.astro"
    cp -al "$BLOG_PATH/node_modules/.astro/assets" "$DEPS/node_modules/.astro/"
  fi
  touch "$DEPS/.complete"
fi
ln -s "$DEPS/node_modules" "$STAGE/node_modules"
(cd "$STAGE"; npm run build)
test -f "$STAGE/dist/server/entry.mjs"
# Convert the original dist directory once; subsequent switches are atomic.
if [[ ! -L "$BLOG_PATH/dist" ]]; then
  mkdir -p "$STATE/releases/legacy"
  mv "$BLOG_PATH/dist" "$STATE/releases/legacy/dist"
  ln -s "$STATE/releases/legacy/dist" "$BLOG_PATH/dist"
fi
PREVIOUS=$(readlink -f "$BLOG_PATH/dist")
ln -s "$STAGE/dist" "$BLOG_PATH/dist.next"
mv -Tf "$BLOG_PATH/dist.next" "$BLOG_PATH/dist"
SWITCHED=1
pm2 restart "$PM2_APP"
health_check
printf '%s\n' "$TARGET" > "$STATE/deployed-commit"
# Retain dependencies needed by current and rollback builds only.
for dependency in "$STATE"/dependencies/*; do
  [[ -d "$dependency" ]] || continue
  KEEP=0
  for release in "$STATE"/releases/*; do
    [[ "$(readlink -f "$release/node_modules" 2>/dev/null || true)" == "$dependency/node_modules" ]] && KEEP=1
  done
  [[ "$(readlink -f "$BLOG_PATH/node_modules" 2>/dev/null || true)" == "$dependency/node_modules" ]] && KEEP=1
  (( KEEP )) || rm -rf -- "$dependency"
done
find "$BLOG_PATH/logs" -name 'deploy-*.log' -mtime +30 -delete
echo "Successfully deployed $TARGET at $(date -Is)"
