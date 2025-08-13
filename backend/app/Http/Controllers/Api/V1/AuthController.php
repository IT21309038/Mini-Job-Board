<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Traits\ApiResponser;
use App\Models\User;
use App\Services\AuthService;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    use ApiResponser;

    public function __construct(private readonly AuthService $auth) {}

    // User Registration
    public function register(RegisterRequest $request)
    {
        $user = User::create($request->validated());

        // Auto login
        $token = $this->auth->attemptLogin($user->email, $request->input('password'));
        if (! $token) {
            return $this->errorResponse('Registration successful, but login failed.', code: 201);
        }

        $refresh = $this->auth->issueRefreshToken($user, $request);

        return $this->successResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
            'refresh' => $refresh['raw'],
        ], 'Registration successful.', 201)
            ->cookie($this->auth->cookie('access_token', $token, (int) config('jwt.ttl')))
            ->cookie($this->auth->cookie('refresh_token', $refresh['raw'], 60 * 24 * 14));
    }

    // User Login
    public function login(LoginRequest $request)
    {
        $token = $this->auth->attemptLogin($request->email, $request->password);

        if (! $token) {
            return $this->errorResponse('Invalid credentials.', 401);
        }

        $user = auth('api')->user();
        $refresh = $this->auth->issueRefreshToken($user, $request);

        return $this->successResponse([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
            'refresh' => $refresh['raw'],
        ], 'Login successful.', 200)
            ->cookie($this->auth->cookie('access_token', $token, (int) config('jwt.ttl')))
            ->cookie($this->auth->cookie('refresh_token', $refresh['raw'], 60 * 24 * 14));
    }

    public function me(Request $request)
    {
        $user = auth('api')->user();

        return $this->successResponse(
            [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
            'User retrieved successfully.'
        );
    }

    public function refresh(Request $request)
    {
        $rawFresh = $request->cookie('refresh_token');

        if (! $rawFresh) {
            $rawFresh = $request->header('X-Refresh-Token') ?? $request->input('refresh_token');
        }

        if (! $rawFresh) {
            return $this->errorResponse('Refresh token not provided.', 401);
        }

        // Refresh token rotate
        $rotated = $this->auth->rotateRefreshToken($rawFresh, $request);

        if (! $rotated) {
            return $this->errorResponse('Invalid or expired refresh token.', 401);
        }

        // Invalidate old token before creating new
        try {
            if (JWTAuth::getToken()) {
                JWTAuth::invalidate(true);
            }
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to refresh tokens.', 500);
        }

        $user = User::findOrFail($rotated['user_id']);
        $newAccess = JWTAuth::fromUser($user);

        return $this->successResponse([], 'Tokens refreshed successfully.')
            ->cookie($this->auth->cookie('access_token', $newAccess, (int) config('jwt.ttl')))
            ->cookie($this->auth->cookie('refresh_token', $rotated['raw'], 60 * 24 * 14));
    }

    public function logout(Request $request)
    {
        // blacklist current access token
        try {
            if (JWTAuth::getToken()) {
                JWTAuth::invalidate();
            }
        } catch (\Throwable $e) {
            return $this->errorResponse('Failed to log out.', 500);
        }

        // revoke the current refresh token (if present)
        if ($rt = $request->cookie('refresh_token')) {
            $this->auth->revokeToken($rt);
        }

        return $this->successResponse([], 'Logged out successfully.')
            ->cookie($this->auth->cookie('access_token', '', -1))
            ->cookie($this->auth->cookie('refresh_token', '', -1));
    }
}
