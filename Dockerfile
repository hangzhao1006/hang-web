FROM php:8.2-cli

RUN apt-get update \
    && apt-get install -y sqlite3 libsqlite3-dev \
       libfreetype6-dev libjpeg62-turbo-dev libpng-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_sqlite gd

WORKDIR /opt/render/project/src

COPY . .

RUN mkdir -p public/uploads && chmod -R 755 public/uploads

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]