FROM php:8.2-cli-alpine

# Install system utilities, libraries and required PHP extensions (PostgreSQL, MySQL, SQLite, BCMath, Opcache)
RUN apk add --no-cache \
    curl \
    git \
    libzip-dev \
    zip \
    unzip \
    sqlite-dev \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    oniguruma-dev \
    && docker-php-ext-install pdo pdo_sqlite pdo_mysql pdo_pgsql pgsql bcmath mbstring opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy backend codebase into container
COPY backend/ /var/www/

# Install PHP dependencies without dev packages
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Prepare directories and permissions
RUN mkdir -p /var/www/database \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    /var/www/storage/framework/cache \
    /var/www/storage/logs \
    /var/www/bootstrap/cache \
    && touch /var/www/database/database.sqlite \
    && chmod -R 777 /var/www/storage /var/www/bootstrap/cache /var/www/database

# Copy entrypoint script and fix potential Windows CRLF issues
COPY backend/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/entrypoint.sh && chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000

CMD ["/usr/local/bin/entrypoint.sh"]

