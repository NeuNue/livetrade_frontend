#!/usr/bin/env bash
# ============================================================================
# 纳指自习室 Web 数据一键同步：
#   1) 导出 game.db → public/data/*.json
#   2) git 提交数据变化
#   3) 推送 GitHub → 触发 Vercel 自动构建部署
#
# 用法:
#   ./sync.sh                # 导出（默认读取 ../usstock-game/data/game.db）+ 提交 + 推送
#   ./sync.sh --db /path/to/game.db
#
# 定时自动同步（crontab 示例，每 10 分钟一次）:
#   */10 * * * * cd "/Users/slein/Project/dsh idea/usstock-web" && ./sync.sh >> /tmp/usstock-web-sync.log 2>&1
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")"

# 解析 python3 / git（launchd / crontab 的 PATH 很精简，可能找不到 anaconda/homebrew）
if command -v python3 >/dev/null 2>&1; then
  PYTHON3="$(command -v python3)"
elif [ -x /opt/anaconda3/bin/python3 ]; then
  PYTHON3=/opt/anaconda3/bin/python3
elif [ -x /usr/bin/python3 ]; then
  PYTHON3=/usr/bin/python3
else
  echo "❌ 找不到 python3，请修改 sync.sh 顶部 PYTHON3 路径" >&2
  exit 1
fi

echo "==> [1/3] 导出数据快照…"
"$PYTHON3" ../usstock-game/export_web.py "$@"

echo "==> [2/3] 提交变更…"
git add -A
if git diff --cached --quiet; then
  echo "    ℹ️ 无数据变化，跳过提交"
else
  git commit -q -m "chore(data): update web snapshot $(date '+%Y-%m-%d %H:%M:%S')"
  echo "    ✅ 已提交"
fi

echo "==> [3/3] 推送 GitHub（触发 Vercel 部署）…"
git push origin HEAD
echo "✅ 同步完成，Vercel 正在自动部署，稍后刷新页面即可看到新数据。"
