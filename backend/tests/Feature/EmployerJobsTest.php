<?php

use App\Enums\JobType;
use App\Models\User;
use Tests\CreatesJwtUser;

uses(CreatesJwtUser::class);

it('employer can create and update a job', function () {
    $employer = User::factory()->employer()->create();
    $this->actAsJwt($employer);

    // Create
    $create = $this->postJson('/api/v1/employer/jobs', [
        'title' => 'Backend Engineer',
        'description' => 'Laravel + MySQL',
        'location' => 'Colombo',
        'job_type' => JobType::FullTime->value,
    ])->assertCreated();

    $jobId = data_get($create->json(), 'data.id') ?? data_get($create->json(), 'id');
    expect($jobId)->not()->toBeNull();

    // Partial update (PATCH)
    $this->patchJson("/api/v1/employer/jobs/{$jobId}", [
        'title' => 'Backend Engineer (Laravel 12)',
    ])->assertOk();

    // Show public
    $this->getJson("/api/v1/jobs/{$jobId}")
        ->assertOk()
        ->assertJsonFragment(['title' => 'Backend Engineer (Laravel 12)']);
});
