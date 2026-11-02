#!/bin/sh
set -e

# Ensure SQLite file exists
if [ ! -f /var/www/database/database.sqlite ]; then
    touch /var/www/database/database.sqlite
fi
chmod 777 /var/www/database /var/www/database/database.sqlite 2>/dev/null || true

# Run migrations and seed data safely
php artisan migrate --force
php artisan db:seed --force

# Storage link and caching
php artisan storage:link 2>/dev/null || true
php artisan config:cache
php artisan route:cache

PORT="${PORT:-8000}"
echo "NS ERP Laravel API is ready on port $PORT"
exec php artisan serve --host=0.0.0.0 --port="$PORT"

