<?php

use App\Http\Controllers\Api\V1\ChapterReleaseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Chapter Release API Routes
|--------------------------------------------------------------------------
|
| These routes handle group-specific chapter publication state management.
| All routes require Sanctum authentication.
| Authorization is enforced via ChapterPolicy.
|
| Include in routes/api.php:
|   require base_path('routes/api_chapter_releases.php');
|
*/

Route::prefix('v1/chapters/{chapter}')
    ->middleware(['auth:sanctum'])
    ->group(function () {

        /**
         * POST /api/v1/chapters/{chapter}/launch
         * Publish a chapter for a specific group.
         * Required payload: { "group_id": 1 }
         * Authorization: teacher (owns course) | super_admin
         */
        Route::post('launch', [ChapterReleaseController::class, 'launch'])
            ->name('chapters.release.launch');

        /**
         * POST /api/v1/chapters/{chapter}/lock
         * Lock a chapter for a specific group (preserves past student progress).
         * Required payload: { "group_id": 1, "lock_reason": "Exam period" }
         * Authorization: teacher (owns course) | super_admin
         */
        Route::post('lock', [ChapterReleaseController::class, 'lock'])
            ->name('chapters.release.lock');

        /**
         * POST /api/v1/chapters/{chapter}/schedule
         * Schedule a future automatic release for a group.
         * Required payload: { "group_id": 1, "scheduled_at": "2026-11-15T09:00:00Z" }
         * Authorization: teacher (owns course) | super_admin
         */
        Route::post('schedule', [ChapterReleaseController::class, 'schedule'])
            ->name('chapters.release.schedule');

        /**
         * GET /api/v1/chapters/{chapter}/access
         * Check whether the authenticated student's group has access to this chapter.
         * Returns: { "authorized": bool, "reason": string?, "released_at": string? }
         * Authorization: any authenticated user
         */
        Route::get('access', [ChapterReleaseController::class, 'checkAccess'])
            ->name('chapters.release.access');
    });
