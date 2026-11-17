<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AdminSystemTelemetryController extends Controller
{
    public function healthCheck()
    {
        try {
            DB::connection()->getPdo();
            return response()->json(['status' => 'ok', 'database' => 'connected']);
        } catch (\Throwable $error) {
            return response()->json(['status' => 'error', 'database' => 'unavailable'], 503);
        }
    }

    public function index()
    {
        $started = microtime(true);
        try {
            DB::connection()->getPdo();
            $database = ['status' => 'healthy', 'driver' => DB::connection()->getDriverName(), 'latency_ms' => round((microtime(true) - $started) * 1000, 2)];
        } catch (\Throwable $error) {
            $database = ['status' => 'unavailable', 'driver' => DB::connection()->getDriverName(), 'latency_ms' => null];
        }

        $queue = ['driver' => config('queue.default'), 'pending_jobs' => null, 'failed_jobs' => null];
        if ($database['status'] === 'healthy' && config('queue.default') === 'database' && Schema::hasTable('jobs')) {
            $queue['pending_jobs'] = DB::table('jobs')->count();
            $queue['failed_jobs'] = Schema::hasTable('failed_jobs') ? DB::table('failed_jobs')->count() : 0;
        }

        // Sum persisted recording metadata instead of walking every file on each refresh.
        $storageBytes = $database['status'] === 'healthy' && Schema::hasTable('voice_recordings') ? (int) DB::table('voice_recordings')->sum('file_size_bytes') : 0;

        return response()->json([
            'application' => ['status' => 'running', 'environment' => app()->environment(), 'php_version' => PHP_VERSION, 'laravel_version' => app()->version()],
            'database' => $database,
            'queue' => $queue,
            'storage' => ['disk' => config('filesystems.default'), 'used_bytes' => $storageBytes, 'used_mb' => round($storageBytes / 1024 / 1024, 2)],
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
