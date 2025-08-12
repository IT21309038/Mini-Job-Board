<?php

namespace Database\Factories;

use App\Models\Application;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\\Models\\Application>
 */
class ApplicationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'candidate_id' => User::factory()->candidate(),
            'job_id' => JobPost::factory(),
            'cover_letter' => fake()->optional()->paragraph(4),
            'resume_path' => null,
            'resume_original_name' => null,
        ];
    }
}
