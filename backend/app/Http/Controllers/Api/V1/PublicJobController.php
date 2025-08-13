<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostResource;
use App\Http\Traits\ApiResponser;
use App\Models\JobPost;
use Illuminate\Http\Request;

class PublicJobController extends Controller
{
    use ApiResponser;

    // Job posts get paginated with filters
    public function index(Request $request)
    {
        $perPage = (int) $request->integer('per_page', 10);
        $perPage = max(1, min(50, $perPage));

        $keyword = trim((string) $request->query('keyword', ''));
        $location = trim((string) $request->query('location', ''));
        $jobType = trim((string) $request->query('job_type', ''));
        $sort = (string) $request->query('sort', '-created_at'); // -created_at indicates descending order

        // Apply filters and pagination to the job posts query
        $query = JobPost::query()->with('employer:id,name');

        if ($keyword !== '') {
            $query->where(function ($w) use ($keyword) {
                $w->where('title', 'like', "%{$keyword}%")
                    ->orWhere('description', 'like', "%{$keyword}%");
            });
        }

        if ($location !== '') {
            $query->where('location', 'like', "%{$location}%");
        }

        if ($jobType !== '') {
            $query->where('job_type', $jobType);
        }

        // sorting
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        if (! in_array($column, ['created_at', 'title', 'location'], true)) {
            $column = 'created_at';
        }
        $query->orderBy($column, $direction);

        $page = $query->paginate($perPage)->appends($request->query());

        return $this->successResponse(
            [
                'jobs' => JobPostResource::collection($page),
                'meta' => [
                    'per_page' => $perPage,
                    'total' => $page->total(),
                    'current_page' => $page->currentPage(),
                    'last_page' => $page->lastPage(),
                ],
            ],
            'Job posts retrieved successfully.',
            200,
        );
    }

    // Get job post by id
    public function show(JobPost $jobPost)
    {
        $jobPost->load('employer:id,name');

        return $this->successResponse(
            new JobPostResource($jobPost),
            'Job post retrieved successfully.',
            200
        );
    }
}
