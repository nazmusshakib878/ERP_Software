#!/bin/sh
set -e

echo "=== NS ERP Production Container Starting ==="

# Handle SQLite initialization only if using SQLite driver
if [ "$DB_CONNECTION" = "sqlite" ] || [ -z "$DB_CONNECTION" ]; then
    echo "Configuring SQLite database file..."
    mkdir -p /var/www/database
    if [ ! -f /var/www/database/database.sqlite ]; then
        touch /var/www/database/database.sqlite
    fi
    chmod 777 /var/www/database /var/www/database/database.sqlite 2>/dev/null || true
else
    echo "Production database driver: $DB_CONNECTION"
fi

# Run database migrations safely
echo "Running database schema migrations..."
php artisan migrate --force

# Run demo seeders ONLY if explicitly requested via environment variable
if [ "$SEED_DEMO_DATA" = "true" ] || [ "$SEED_DEMO_DATA" = "1" ]; then
    echo "Explicit SEED_DEMO_DATA flag detected. Seeding demo accounts..."
    php artisan db:seed --force
else
    echo "Production safety active: Demo seeders skipped. (Set SEED_DEMO_DATA=true only if initial demo data is desired)."
fi

# Link storage
php artisan storage:link 2>/dev/null || true

# Production optimization & caching
if [ "$APP_ENV" = "production" ]; then
    echo "Optimizing Laravel configuration and routes for production..."
    php artisan config:cache
    php artisan route:cache
fi

PORT="${PORT:-8000}"
echo "NS ERP Laravel API is ready and listening on port $PORT"
exec php artisan serve --host=0.0.0.0 --port="$PORT"
