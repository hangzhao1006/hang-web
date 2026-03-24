#!/bin/sh

UPLOAD_DIR="/opt/render/project/src/public/uploads"
BACKUP_DIR="/opt/render/project/src/_uploads_seed"

# 如果 volume 是空的（没有 .initialized 标记），从备份拷贝初始文件
if [ ! -f "$UPLOAD_DIR/.initialized" ]; then
    echo "First run: seeding uploads from image..."
    cp -rn "$BACKUP_DIR"/* "$UPLOAD_DIR"/ 2>/dev/null || true
    touch "$UPLOAD_DIR/.initialized"
    echo "Done seeding."
fi

# 启动 PHP 服务器
exec php -S 0.0.0.0:8080 -t public
