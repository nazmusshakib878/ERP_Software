<?php

$envOrigins = array_filter(array_map('trim', explode(',', (string) (env('ALLOWED_ORIGINS') ?: env('CORS_ALLOWED_ORIGINS') ?: ''))));

$frontendUrl = env('FRONTEND_URL');
if ($frontendUrl) {
    $envOrigins[] = rtrim($frontendUrl, '/');
}

// Production origins: Always explicitly include verified production Vercel frontend
$productionOrigins = array_values(array_unique(array_filter([
    'https://erp-rouge-five.vercel.app',
    ...$envOrigins,
])));

// Development origins: active only when not in production
$devOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
];

$allowedOrigins = env('APP_ENV') === 'production'
    ? $productionOrigins
    : array_values(array_unique([...$productionOrigins, ...$devOrigins]));

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Production CORS configuration for NS ERP.
    | Explicitly allows the production Vercel frontend, preview URLs, and dev servers.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => $allowedOrigins,

    'allowed_origins_patterns' => [
        '#^https:\/\/.*\.vercel\.app$#',
    ],

    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'Accept',
        'Origin',
        'X-CSRF-TOKEN',
    ],

    'exposed_headers' => ['Authorization'],

    'max_age' => 86400,

    'supports_credentials' => false,

];
