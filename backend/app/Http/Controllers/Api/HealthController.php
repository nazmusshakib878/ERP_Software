<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HealthController extends Controller
{
    /**
     * Application Health & Readiness Check
     * Validates database connectivity, storage writeability, and cache operations.
     * Never exposes database credentials, hostnames, or internal stack traces.
     */
    public function check(Request $request)
    {
        $dbConnected = false;
        $dbError = null;
        $dbDriver = 'unknown';

        try {
            DB::connection()->getPdo();
            $dbDriver = DB::connection()->getDriverName();
            $dbConnected = true;
        } catch (\Throwable $e) {
            Log::error('Health check database failure: ' . $e->getMessage());
            $dbError = 'Database unavailable';
        }

        $storageWritable = is_writable(storage_path('framework/cache')) && is_writable(storage_path('logs'));
        
        $cacheOperational = false;
        try {
            Cache::put('health_check_probe', true, 10);
            $cacheOperational = Cache::get('health_check_probe') === true;
            Cache::forget('health_check_probe');
        } catch (\Throwable $e) {
            Log::warning('Health check cache probe failure: ' . $e->getMessage());
        }

        $isHealthy = $dbConnected && $storageWritable;
        $statusCode = $isHealthy ? 200 : 503;

        return response()->json([
            'status' => $isHealthy ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'app' => [
                'name' => config('app.name', 'NS ERP'),
                'env' => config('app.env', 'production'),
            ],
            'services' => [
                'database' => $dbConnected ? 'connected' : 'error',
                'database_driver' => $dbDriver,
                'storage' => $storageWritable ? 'writable' : 'read_only',
                'cache' => $cacheOperational ? 'operational' : 'degraded',
            ],
            'version' => '1.0.0',
        ], $statusCode);
    }
}

