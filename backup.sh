#!/bin/bash
# backup.sh — 从 Fly 拉取最新数据库并同步到 GitHub

APP="hangzhao-fragrant-grass-802"
DB_REMOTE="/opt/render/project/src/public/uploads/portfolio.sqlite"
DB_LOCAL="data/portfolio.sqlite"

echo "📥 从 Fly 下载数据库..."
fly ssh console -a $APP -C "cat $DB_REMOTE" > $DB_LOCAL

if [ $? -ne 0 ]; then
  echo "❌ 下载失败"
  exit 1
fi

echo "✅ 数据库已下载到 $DB_LOCAL"

# 检查是否有变化
if git diff --quiet $DB_LOCAL 2>/dev/null; then
  echo "ℹ️  数据库没有变化，无需提交"
  exit 0
fi

echo "📤 提交到 GitHub..."
git add $DB_LOCAL
git commit -m "backup: sync database $(date '+%Y-%m-%d %H:%M')"
git push

echo "✅ 已同步到 GitHub"
