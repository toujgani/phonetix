<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('institutional_id')->unique()->nullable();
                $table->string('first_name');
                $table->string('last_name');
                $table->string('email')->unique();
                $table->string('personal_email')->nullable();
                $table->string('phone')->nullable();
                $table->string('password');
                $table->enum('role', ['super_admin', 'teacher', 'student'])->default('student');
                $table->enum('status', ['pending', 'active', 'suspended', 'rejected'])->default('pending');
                $table->foreignId('approved_by')->nullable()->references('id')->on('users');
                $table->timestamp('approved_at')->nullable();
                $table->string('rejection_reason')->nullable();
                $table->string('avatar_url')->nullable();
                $table->string('preferred_language', 5)->default('en');
                $table->jsonb('preferences')->nullable();
                $table->rememberToken();
                $table->timestamps();
                $table->softDeletes();
                $table->index(['role', 'status']);
            });
        } else {
            // Older installs may have Laravel's starter users table. Upgrade in place and keep its records.
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'institutional_id')) $table->string('institutional_id')->nullable();
                if (!Schema::hasColumn('users', 'first_name')) $table->string('first_name')->default('');
                if (!Schema::hasColumn('users', 'last_name')) $table->string('last_name')->default('');
                if (!Schema::hasColumn('users', 'personal_email')) $table->string('personal_email')->nullable();
                if (!Schema::hasColumn('users', 'phone')) $table->string('phone')->nullable();
                if (!Schema::hasColumn('users', 'role')) $table->string('role')->default('student');
                if (!Schema::hasColumn('users', 'status')) $table->string('status')->default('active');
                if (!Schema::hasColumn('users', 'approved_by')) $table->unsignedBigInteger('approved_by')->nullable();
                if (!Schema::hasColumn('users', 'approved_at')) $table->timestamp('approved_at')->nullable();
                if (!Schema::hasColumn('users', 'rejection_reason')) $table->string('rejection_reason')->nullable();
                if (!Schema::hasColumn('users', 'avatar_url')) $table->string('avatar_url')->nullable();
                if (!Schema::hasColumn('users', 'preferred_language')) $table->string('preferred_language', 5)->default('en');
                if (!Schema::hasColumn('users', 'preferences')) $table->json('preferences')->nullable();
                if (!Schema::hasColumn('users', 'deleted_at')) $table->softDeletes();
            });

            if (Schema::hasColumn('users', 'name')) {
                DB::table('users')->where(function ($query) {
                    $query->whereNull('first_name')->orWhere('first_name', '');
                })->orderBy('id')->chunk(100, function ($users) {
                    foreach ($users as $user) {
                        $parts = preg_split('/\s+/', trim((string) $user->name), 2) ?: [];
                        DB::table('users')->where('id', $user->id)->update([
                            'first_name' => $parts[0] ?? '',
                            'last_name' => $parts[1] ?? '',
                        ]);
                    }
                });
            }
            if (!Schema::hasIndex('users', ['institutional_id'])) {
                Schema::table('users', fn (Blueprint $table) => $table->unique('institutional_id'));
            }
            if (!Schema::hasIndex('users', ['role', 'status'])) {
                Schema::table('users', fn (Blueprint $table) => $table->index(['role', 'status']));
            }
        }

        if (!Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('action');
                $table->string('entity_type')->nullable();
                $table->unsignedBigInteger('entity_id')->nullable();
                $table->jsonb('old_values')->nullable();
                $table->jsonb('new_values')->nullable();
                $table->timestamp('created_at')->useCurrent();
                $table->index(['action', 'created_at']);
            });
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        if (!Schema::hasColumn('users', 'name')) Schema::dropIfExists('users');
    }
};
