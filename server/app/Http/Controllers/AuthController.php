<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function formatResponse($user, $token)
    {
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();

        // Add wildcard for super_admin
        if ($user->hasRole('super_admin')) {
            $permissions[] = '*';
        }

        return [
            'user' => $user->load('roles', 'permissions'),
            'token' => $token,
            'roles' => $user->getRoleNames(),
            'permissions' => array_unique($permissions),
        ];
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        // Assign default role
        $user->assignRole('receptionist');

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json($this->formatResponse($user, $token), 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json($this->formatResponse($user, $token));
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request)
    {
        $user = $request->user()->load('roles', 'permissions');
        $permissions = $user->getAllPermissions()->pluck('name')->toArray();

        if ($user->hasRole('super_admin')) {
            $permissions[] = '*';
        }

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => array_unique($permissions),
        ]);
    }
}
