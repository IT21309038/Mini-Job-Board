<?php

namespace App\Providers;

use App\Models\Application;
use App\Models\JobPost;
use App\Policies\ApplicationPolicy;
use App\Policies\JobPostPolicy;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        JobPost::class => JobPostPolicy::class,
        Application::class => ApplicationPolicy::class,
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
