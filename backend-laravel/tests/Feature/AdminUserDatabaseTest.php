<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserDatabaseTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_search_and_paginate_real_user_records(): void
    {
        User::create(['first_name' => 'Ada', 'last_name' => 'Admin', 'email' => 'admin@example.test', 'password' => 'secret-password', 'role' => 'super_admin', 'status' => 'active']);
        User::create(['first_name' => 'Sam', 'last_name' => 'Student', 'institutional_id' => 'S-100', 'email' => 'sam@example.test', 'password' => 'secret-password', 'role' => 'student', 'status' => 'active']);
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.test', 'password' => 'secret-password'])->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/v1/admin/users?search=S-100&per_page=10')
            ->assertOk()->assertJsonPath('users.total', 1)->assertJsonPath('users.data.0.email', 'sam@example.test')
            ->assertJsonPath('statistics.students', 1)->assertJsonPath('statistics.administrators', 1);
    }

    public function test_non_admin_cannot_access_user_database(): void
    {
        User::create(['first_name' => 'Sam', 'last_name' => 'Student', 'email' => 'sam@example.test', 'password' => 'secret-password', 'role' => 'student', 'status' => 'active']);
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'sam@example.test', 'password' => 'secret-password'])->assertOk()->json('token');

        $this->withToken($token)->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_registration_creates_pending_database_user(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'first_name' => 'Taylor', 'last_name' => 'Learner', 'institutional_id' => 'STU-2026-0001',
            'email' => 'taylor@example.test', 'password' => 'long-password', 'password_confirmation' => 'long-password',
        ])->assertCreated()->assertJsonPath('user.status', 'pending');

        $this->assertDatabaseHas('users', ['email' => 'taylor@example.test', 'role' => 'student', 'status' => 'pending']);
    }

    public function test_login_on_an_empty_database_returns_credentials_error_instead_of_schema_error(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@phonetix-institution.edu', 'password' => 'incorrect-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_admin_can_approve_edit_and_revoke_a_users_sessions(): void
    {
        User::create(['first_name' => 'Ada', 'last_name' => 'Admin', 'email' => 'admin@example.test', 'password' => 'secret-password', 'role' => 'super_admin', 'status' => 'active']);
        User::create(['first_name' => 'Sam', 'last_name' => 'Student', 'institutional_id' => 'S-200', 'email' => 'sam@example.test', 'password' => 'secret-password', 'role' => 'student', 'status' => 'pending']);
        $adminToken = $this->postJson('/api/v1/auth/login', ['email' => 'admin@example.test', 'password' => 'secret-password'])->assertOk()->json('token');

        $this->withToken($adminToken)->postJson('/api/v1/admin/users/2/approve')->assertOk()->assertJsonPath('user.status', 'active');
        $this->withToken($adminToken)->putJson('/api/v1/admin/users/2', [
            'first_name' => 'Samuel', 'last_name' => 'Student', 'email' => 'sam@example.test', 'institutional_id' => 'S-200',
            'phone' => '+10000000000', 'role' => 'student', 'status' => 'active', 'group_ids' => [],
        ])->assertOk()->assertJsonPath('user.first_name', 'Samuel');

        $studentToken = $this->postJson('/api/v1/auth/login', ['email' => 'sam@example.test', 'password' => 'secret-password'])->assertOk()->json('token');
        $this->withToken($adminToken)->deleteJson('/api/v1/admin/users/2/sessions')->assertOk()->assertJsonPath('revoked_sessions', 1);
        app('auth')->forgetGuards();
        $this->withToken($studentToken)->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->assertDatabaseHas('users', ['id' => 2, 'first_name' => 'Samuel', 'phone' => '+10000000000', 'status' => 'active']);
    }
}
