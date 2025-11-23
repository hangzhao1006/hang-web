# 使用官方 PHP CLI 镜像
FROM php:8.2-cli

# 开启 PDO SQLite 扩展
RUN docker-php-ext-install pdo pdo_sqlite

# 工作目录：/app
WORKDIR /app

# 把整个项目拷贝进容器
COPY . /app

# 运行 PHP 内置服务器
# Render 会自动提供 PORT 环境变量（默认 10000）
# -t public 表示把 public 作为网站根目录
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t public"]
