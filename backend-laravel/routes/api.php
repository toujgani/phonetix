<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\PronunciationController;
use App\Http\Controllers\Api\V1\AIConversationController;
use App\Http\Controllers\Api\V1\CourseController;
use App\Http\Controllers\Api\V1\GameController;
use App\Http\Controllers\Api\V1\AdminUserController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\AdminAuditLogController;
use App\Http\Controllers\Api\V1\AdminAcademicStructureController;
use App\Http\Controllers\Api\V1\AdminSystemTelemetryController;
use App\Http\Controllers\Api\V1\LearningController;
use App\Http\Controllers\Api\V1\LiveQuizController;

/*
|--------------------------------------------------------------------------
| PHONETIX API V1 Enterprise Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Public Health & Telemetry
    Route::get('/health', [AdminSystemTelemetryController::class, 'healthCheck']);

    // Public Authentication & Registration
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Public IPA Chart Resource
    Route::get('/ipa/chart', [PronunciationController::class, 'getIpaChart']);

    // Protected Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        // Authenticated Context
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        Route::get('/learning/dashboard', [LearningController::class, 'dashboard']);
        Route::post('/learning/goals', [LearningController::class, 'createGoal']);
        Route::patch('/learning/goals/{goal}', [LearningController::class, 'updateGoal'])->whereNumber('goal');
        Route::get('/assignments', [LearningController::class, 'assignments']);
        Route::post('/assignments/{assignment}/submit', [LearningController::class, 'submitAssignment'])->whereNumber('assignment');
        Route::post('/recordings', [LearningController::class, 'storeRecording']);
        Route::post('/teacher/assignments', [LearningController::class, 'createAssignment']);
        Route::get('/teacher/submissions', [LearningController::class, 'submissions']);
        Route::patch('/teacher/submissions/{submission}', [LearningController::class, 'gradeSubmission'])->whereNumber('submission');
        Route::get('/teacher/submissions/{submission}/recording', [LearningController::class, 'submissionRecording'])->whereNumber('submission');

        // Pronunciation Assessment Laboratory
        Route::prefix('pronunciation')->group(function () {
            Route::get('/exercises', [PronunciationController::class, 'indexExercises']);
            Route::post('/assess', [PronunciationController::class, 'assessRecording'])->middleware('throttle:10,1');
            Route::get('/history', [PronunciationController::class, 'history']);
        });

        // AI Pedagogical Speaking Partner
        Route::prefix('ai')->group(function () {
            Route::get('/conversations', [AIConversationController::class, 'index']);
            Route::post('/conversations', [AIConversationController::class, 'store']);
            Route::post('/conversations/{id}/message', [AIConversationController::class, 'sendMessage']);
        });

        // Educational Games Engine
        Route::prefix('games')->group(function () {
            Route::post('/live', [LiveQuizController::class, 'create']);
            Route::post('/live/join', [LiveQuizController::class, 'join']);
            Route::get('/live/{id}', [LiveQuizController::class, 'state'])->whereNumber('id');
            Route::post('/live/{id}/start', [LiveQuizController::class, 'start'])->whereNumber('id');
            Route::post('/live/{id}/answer', [LiveQuizController::class, 'answer'])->whereNumber('id');
            Route::post('/live/{id}/next', [LiveQuizController::class, 'next'])->whereNumber('id');
            Route::get('/', [GameController::class, 'index']);
            Route::get('/{id}', [GameController::class, 'show']);
            Route::post('/{id}/attempt', [GameController::class, 'submitAttempt']);
        });

        // Courses & Curriculum
        Route::prefix('courses')->group(function () {
            Route::get('/', [CourseController::class, 'index']);
            Route::get('/{id}', [CourseController::class, 'show']);
            Route::post('/lessons/{id}/complete', [CourseController::class, 'completeLesson']);
        });

        // Super Administrator Exclusive Routes
        Route::middleware('can:manage-system')->prefix('admin')->group(function () {
            Route::get('/users', [AdminUserController::class, 'index']);
            Route::get('/users/export', [AdminUserController::class, 'export']);
            Route::get('/users/{user}', [AdminUserController::class, 'show']);
            Route::put('/users/{user}', [AdminUserController::class, 'update']);
            Route::post('/users/{user}/approve', [AdminUserController::class, 'approve']);
            Route::patch('/users/{user}/status', [AdminUserController::class, 'setStatus']);
            Route::post('/users/{user}/password-reset', [AdminUserController::class, 'passwordReset']);
            Route::delete('/users/{user}/sessions', [AdminUserController::class, 'revokeSessions']);
            Route::get('/telemetry', [AdminSystemTelemetryController::class, 'index']);
            Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
            Route::get('/academic-structure', [AdminAcademicStructureController::class, 'index']);
            Route::post('/academic-structure/{resource}', [AdminAcademicStructureController::class, 'store'])->whereIn('resource', ['years', 'semesters', 'departments', 'programs', 'groups', 'courses']);
            Route::put('/academic-structure/{resource}/{id}', [AdminAcademicStructureController::class, 'update'])->whereIn('resource', ['years', 'semesters', 'departments', 'programs', 'groups', 'courses'])->whereNumber('id');
            Route::delete('/academic-structure/{resource}/{id}', [AdminAcademicStructureController::class, 'destroy'])->whereIn('resource', ['years', 'semesters', 'departments', 'programs', 'groups', 'courses'])->whereNumber('id');
        });
    });
});
