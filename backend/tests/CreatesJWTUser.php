<?php

namespace Tests;

use App\Models\User;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

trait CreatesJwtUser
{
    protected function actAsJwt(User $user): void
    {
        $token = JWTAuth::fromUser($user);
        $this->withHeader('Authorization', 'Bearer '.$token);
    }
}
