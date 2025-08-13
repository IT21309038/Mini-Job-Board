<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Job\JobStoreRequest;
use App\Http\Requests\Job\JobUpdateRequest;
use App\Http\Resources\JobPostResource;
use App\Models\JobPost;
use Illuminate\Http\Request;

class EmployerJobController extends Controller
{
    // List employer posted jobs
    public function index(Request $request)
    {
        $user = $request->user('api');

        // policy check implementation
        if ($user->cannot('create', JobPost::class)) {
            return $this->errorResponse(
                'You are not authorized to create job posts.',
                403
            );
        }

        $perPage = max(1, min(50, (int) $request->integer('per_page', 10)));

        $jobs = JobPost::query()
            ->where('employer_id', $user->id)
            ->latest('created_at')
            ->paginate($perPage);

        return $this->successResponse(
            [
                'jobs' => JobPostResource::collection($jobs),
                'meta' => [
                    'current_page' => $jobs->currentPage(),
                    'last_page' => $jobs->lastPage(),
                    'per_page' => $jobs->perPage(),
                    'total' => $jobs->total(),
                ],
            ],
            'Employer job posts retrieved successfully.',
            200
        );
    }

    // Create job posting
    public function store(JobStoreRequest $request)
    {
        if ($request->user('api')->cannot('create', JobPost::class)) {
            return $this->errorResponse(
                'You are not authorized to create job posts.',
                403
            );
        }

        $job = JobPost::create([
            'employer_id' => $request->user('api')->id,
            'title' => $request->string('title'),
            'description' => $request->string('description'),
            'location' => $request->string('location'),
            'job_type' => $request->input('job_type'),
        ]);

        return $this->successResponse(
            [],
            'Job post created successfully.',
            201
        );
    }

    // Update job posting
    public function update(JobUpdateRequest $request, JobPost $jobPost)
    {
        $this->authorize('update', $jobPost);

        if ($jobPost->employer_id !== $request->user('api')->id) {
            return $this->errorResponse(
                'You are not authorized to update this job post.',
                403
            );
        }

        $jobPost->fill($request->only([
            'title',
            'description',
            'location',
            'job_type',
        ]));

        $jobPost->save();

        return $this->successResponse(
            [],
            'Job post updated successfully.',
            200
        );
    }

    // Delete job posting
    public function destroy(Request $request, JobPost $jobPost)
    {
        $this->authorize('delete', $jobPost);

        if ($jobPost->employer_id !== $request->user('api')->id) {
            return $this->errorResponse(
                'You are not authorized to delete this job post.',
                403
            );
        }

        $jobPost->delete();

        return $this->successResponse(
            [],
            'Job post deleted successfully.',
            200
        );
    }
}
