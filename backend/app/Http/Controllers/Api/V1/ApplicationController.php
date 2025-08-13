<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\ApplicationStoreRequest;
use App\Mail\ApplicationSubmitted;
use App\Models\Application;
use App\Models\JobPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class ApplicationController extends Controller
{
    // Candidate Job apply
    public function store(ApplicationStoreRequest $request)
    {
        $user = $request->user('api');

        if ($user->role->value !== 'candidate') {
            return $this->errorResponse('Only candidates can apply for jobs.', 403);
        }

        $job = JobPost::findOrFail($request->integer('job_id'));

        // Prevent Duplicates
        $exists = Application::where('candidate_id', $user->id)->where('job_id', $job->id)->exists();

        if ($exists) {
            return $this->errorResponse('You have already applied for this job.', 409);
        }

        // Resume upload to lecal storage
        $resumePath = null;
        $resumeName = null;

        if ($file = $request->file('resume')) {
            // generates a unique hashed filename
            $resumePath = $file->store("resumes/{$user->id}", 'local');
            $resumeName = $file->getClientOriginalName();
        }

        $application = Application::create([
            'candidate_id' => $user->id,
            'job_id' => $job->id,
            'cover_letter' => $request->input('cover_letter'),
            'resume_path' => $resumePath,
            'resume_original_name' => $resumeName,
        ]);

        // Signed download for employer
        $resumeUrl = null;

        if ($resumePath) {
            $resumeUrl = URL::signedRoute(
                'applications.resume.download',
                ['application' => $application->id],
                now()->addDays(7));
        }

        // Email employer
        try {
            Mail::to($job->employer->email)->send(new ApplicationSubmitted($application->load('candidate', 'job'), $resumeUrl));
            // Mail::to($user->email)->send(new ApplicationSubmitted($application->load('candidate','job'), null)); // optional confirmation
        } catch (\Throwable $e) {
            // application is created even if email fails
            logger()->warning('Email send failed: '.$e->getMessage());
        }

        return $this->successResponse(
            ['application_id' => $application->id],
            'Application submitted successfully.',
            201
        );
    }

    // Candidate application List
    public function indexForCandidate(Request $request)
    {
        $user = $request->user('api');

        // Build paginator
        $paginator = Application::with(['job:id,title,location,job_type,employer_id'])
            ->where('candidate_id', $user->id)
            ->latest('created_at')
            ->paginate(10);

        // Map ONLY the items (not the paginator) to your desired shape
        $items = $paginator->getCollection()->map(function (Application $app) {
            return [
                'id' => $app->id,
                'job' => [
                    'id' => $app->job->id,
                    'title' => $app->job->title,
                    'location' => $app->job->location,
                    'job_type' => $app->job->job_type,
                ],
                'cover_letter' => $app->cover_letter,
                'resume' => [
                    'original_name' => $app->resume_original_name,
                    'download_url' => $app->resume_path
                        ? URL::signedRoute('applications.resume.download', ['application' => $app->id], now()->addDays(7))
                        : null,
                ],
                'created_at' => $app->created_at?->toISOString(),
            ];
        })->values();

        // Return only the items + your slim meta
        return $this->successResponse([
            'applications' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Your applications.');
    }

    // Employer job posting list of applications
    public function indexForEmployer(Request $request, JobPost $jobPost)
    {
        // Build paginator
        $paginator = Application::with(['candidate:id,name,email'])
            ->where('job_id', $jobPost->id)
            ->latest('created_at')
            ->paginate(10);

        $items = $paginator->getCollection()->map(function (Application $app) {
            return [
                'id' => $app->id,
                'job' => [
                    'id' => $app->job->id,
                    'title' => $app->job->title,
                    'location' => $app->job->location,
                    'job_type' => $app->job->job_type,
                ],
                'cover_letter' => $app->cover_letter,
                'resume' => [
                    'original_name' => $app->resume_original_name,
                    'download_url' => $app->resume_path
                        ? URL::signedRoute('applications.resume.download', ['application' => $app->id], now()->addDays(7))
                        : null,
                ],
                'created_at' => $app->created_at?->toISOString(),
            ];
        })->values();

        return $this->successResponse([
            'applications' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], 'Applications for this job.');
    }

    // Signed Resume Download
    public function downloadResume(Request $request, Application $application)
    {
        $this->authorize('download', $application);

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('local');

        $path = $application->resume_path;
        if (! $path || ! $disk->exists($path)) {
            return $this->errorResponse('Resume not found.', 404);
        }

        $name = $application->resume_original_name ?: 'resume.pdf';

        return $disk->download($path, $name);
    }
}
