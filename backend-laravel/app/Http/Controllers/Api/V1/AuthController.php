<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate(['email' => ['required', 'email'], 'password' => ['required', 'string']]);
        $user = User::where('email', strtolower(trim($credentials['email'])))->first();
        if (!$user || !Hash::check($credentials['password'], $user->password)) throw ValidationException::withMessages(['email' => ['Invalid institutional email or password.']]);
        if ($user->status !== 'active') return response()->json(['code' => strtoupper($user->status), 'message' => 'ACCOUNT_'.strtoupper($user->status)], 403);
        $user->forceFill(['last_login_at' => now()])->save();
        $token = $user->createToken('phonetix-web')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $this->profile($user)]);
    }

    public function register(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'], 'last_name' => ['required', 'string', 'max:255'],
            'institutional_id' => ['required', 'string', 'max:255', 'unique:users,institutional_id'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'], 'personal_email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:40'], 'password' => ['required', 'string', 'min:8', 'confirmed'],
            'group_name' => ['nullable', 'string', 'max:255'],
        ]);
        $attributes = [
            'first_name' => $data['first_name'], 'last_name' => $data['last_name'],
            'institutional_id' => $data['institutional_id'], 'email' => strtolower($data['email']),
            'personal_email' => $data['personal_email'] ?? null, 'phone' => $data['phone'] ?? null,
            'password' => $data['password'], 'role' => 'student', 'status' => 'pending',
        ];
        if (Schema::hasColumn('users', 'name')) $attributes['name'] = trim($data['first_name'].' '.$data['last_name']);
        $user = User::create($attributes);
        if (!empty($data['group_name'])) {
            $groupId = \DB::table('groups')->where('name', $data['group_name'])->value('id');
            if ($groupId) $user->groups()->attach($groupId, ['status' => 'active']);
        }
        return response()->json(['user' => $this->profile($user)], 201);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $this->profile($request->user())]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->noContent();
    }

    private function profile(User $user): array
    {
        return $user->only(['id', 'institutional_id', 'first_name', 'last_name', 'email', 'personal_email', 'phone', 'role', 'status', 'created_at']);
    }
}
