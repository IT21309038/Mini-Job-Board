<?php

use App\Models\Application;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\CreatesJwtUser;

uses(Tests\TestCase::class, CreatesJwtUser::class)->in('.');
uses()->group('applications');

it('candidate can apply with pdf and employer can list and download', function () {
    // Fake disk so we can assertExists/assertMissing
    Storage::fake('local');
    Mail::fake();

    // Create employer & candidate
    $employer = User::factory()->employer()->create();
    $candidate = User::factory()->candidate()->create();

    // Employer creates a job (use factory for speed)
    $this->actAsJwt($employer);
    $job = JobPost::factory()->for($employer, 'employer')->create();

    // Candidate applies (multipart + PDF)
    $this->withHeaders([]); // reset headers
    $this->actAsJwt($candidate);

    $resume = UploadedFile::fake()->create('resume.pdf', 200, 'application/pdf');

    $apply = $this->post('/api/v1/candidate/applications', [
        'job_id' => $job->id,
        'cover_letter' => 'Hello!',
        'resume' => $resume,
    ])->assertCreated();

    $appId = data_get($apply->json(), 'data.application_id');
    $app = Application::find($appId);

    expect($app)->not()->toBeNull();

    // Employer lists applicants
    $this->withHeaders([]);
    $this->actAsJwt($employer);

    $this->getJson("/api/v1/employer/jobs/{$job->id}/applications")
        ->assertOk()
        ->assertJsonFragment(['email' => $candidate->email]);

    // Signed download (as employer)
    $signed = URL::signedRoute('applications.resume.download', ['application' => $app->id]);
    $this->get($signed)->assertOk();
});
