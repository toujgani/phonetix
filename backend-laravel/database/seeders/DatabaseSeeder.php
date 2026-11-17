<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $demoUsers = [
            [
                'email' => 'admin@phonetix-institution.edu',
                'first_name' => 'Eleanor',
                'last_name' => 'Vance',
                'institutional_id' => 'ADM-2026-001',
                'role' => 'super_admin',
                'password' => 'Admin@2026',
            ],
            [
                'email' => 'teacher@phonetix-institution.edu',
                'first_name' => 'Arthur',
                'last_name' => 'Holloway',
                'institutional_id' => 'FAC-2026-104',
                'role' => 'teacher',
                'password' => 'Teacher@2026',
            ],
            [
                'email' => 'student@phonetix-institution.edu',
                'first_name' => 'Sophia',
                'last_name' => 'Chen',
                'institutional_id' => 'STU-2026-8842',
                'role' => 'student',
                'password' => 'Student@2026',
            ],
        ];

        foreach ($demoUsers as $demoUser) {
            $password = $demoUser['password'];
            unset($demoUser['password']);

            User::updateOrCreate(
                ['email' => $demoUser['email']],
                [
                    ...$demoUser,
                    'status' => 'active',
                    'approved_at' => now(),
                    'password' => Hash::make($password),
                ],
            );
        }
    }
}
