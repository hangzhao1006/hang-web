# 1. 使用官方 PHP 8.2 CLI 基础镜像
FROM php:8.2-cli

# 2. 安装 sqlite3 以及它的开发库（非常关键）
RUN apt-get update \
    && apt-get install -y sqlite3 libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

# 3. 安装 PDO 和 PDO_SQLITE 扩展
RUN docker-php-ext-install pdo pdo_sqlite

# 4. 设置工作目录
WORKDIR /app

# 5. 拷贝项目全部文件到容器
COPY . /app

# 6. 暴露 Render 默认端口（可选）
EXPOSE 10000

# 7. 启动 PHP 内置服务器，public 为站点根目录
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public"]
