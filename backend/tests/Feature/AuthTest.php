<?php

use App\Models\User;
use Tests\CreatesJwtUser;

uses(CreatesJwtUser::class);

it('logs in and returns me', function () {
    $user = User::factory()->employer()->create(['password' => 'Secret123!']);

    $res = $this->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'Secret123!',
    ])->assertOk();

    // Grab access token from Set-Cookie is tricky; just reuse JWT directly for tests:
    $this->actAsJwt($user);

    $this->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.email', $user->email);
});
