# Dockerfile for Fly.io
FROM php:8.2-cli

RUN apt-get update \
    && apt-get install -y sqlite3 libsqlite3-dev \
       libfreetype6-dev libjpeg62-turbo-dev libpng-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_sqlite gd

WORKDIR /opt/render/project/src

COPY . .

# 备份 uploads 内容，volume 挂载会覆盖原目录
RUN cp -r public/uploads _uploads_seed

RUN mkdir -p public/uploads && chmod -R 755 public/uploads

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8080

CMD ["/start.sh"]
