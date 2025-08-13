<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\JobPost;
use App\Models\User;

class JobPostPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // Any user can view job posts
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, JobPost $jobPost): bool
    {
        return true; // Any user can view a job post
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === UserRole::Employer; // Only employers can create job posts
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, JobPost $jobPost): bool
    {
        return $user->role === UserRole::Employer && $user->id === $jobPost->employer_id;
        // Only the employer who created the job post can update it
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, JobPost $jobPost): bool
    {
        return $user->role === UserRole::Employer && $user->id === $jobPost->employer_id;
        // Only the employer who created the job post can delete it
    }

    // View Applicants for a posting
    public function viewApplicants(User $user, JobPost $jobPost): bool
    {
        return $user->role === UserRole::Employer && $user->id === $jobPost->employer_id;
        // Only the employer who created the job post can view applicants
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, JobPost $jobPost): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, JobPost $jobPost): bool
    {
        return false;
    }
}
