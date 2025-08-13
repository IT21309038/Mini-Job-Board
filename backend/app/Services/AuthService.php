<?php

namespace App\Services;

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AuthService
{
    public function attemptLogin(string $email, string $password): ?string
    {
        // Returns JWT Token or null
        return auth('api')->attempt(['email' => $email, 'password' => $password]);
    }

    public function issueRefreshToken(User $user, Request $request): ?array
    {
        $raw = Str::random(64);
        $hash = hash('sha256', $raw);

        $token = RefreshToken::create([
            'user_id' => $user->id,
            'token_hash' => $hash,
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'ip_address' => $request->ip(),
            'expires_at' => now()->addDays(14),
        ]);

        return ['raw' => $raw, 'model' => $token];
    }

    public function rotateRefreshToken(string $rawToken, Request $request): ?array
    {
        $hash = hash('sha256', $rawToken);

        $current = RefreshToken::query()
            ->where('token_hash', $hash)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', now())
            ->first();

        if (! $current) {
            return null; // No valid refresh token found
        }

        // rework current
        $current->update(['revoked_at' => now()]);

        // issue new token
        $raw = Str::random(64);
        $newHash = hash('sha256', $raw);

        $new = RefreshToken::create([
            'user_id' => $current->user_id,
            'token_hash' => $newHash,
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
            'ip_address' => $request->ip(),
            'expires_at' => now()->addDays(14),
        ]);

        return ['raw' => $raw, 'model' => $new, 'user_id' => $current->user_id];
    }

    public function revokeToken(string $rawToken): void
    {
        $hash = hash('sha256', $rawToken);

        RefreshToken::query()
            ->where('token_hash', $hash)
            ->update(['revoked_at' => now()]);
    }

    public function cookie(string $name, string $value, int $minutes, bool $httpOnly = true)
    {

        $domain = config('session.domain', env('COOKIE_DOMAIN', null));
        $secure = (bool) env('COOKIE_SECURE', false);
        $sameSite = strtolower((string) env('COOKIE_SAMESITE', 'lax'));

        return cookie(
            $name, $value, $minutes,
            path: '/', domain: $domain,
            secure: $secure, httpOnly: $httpOnly, raw: false, sameSite: $sameSite
        );
    }
}
