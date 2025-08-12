<?php

namespace Database\Factories;

use App\Enums\JobType;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\\Models\\JobPost>
 */
class JobPostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = JobPost::class;

    public function definition(): array
    {
        return [
            'employer_id' => User::factory()->employer(),
            'title' => fake()->jobTitle(),
            'description' => fake()->paragraph(4),
            'location' => fake()->city(),
            'job_type' => fake()->randomElement(
                array_map(fn ($c) => $c->value, JobType::cases())
            ),
        ];
    }
}
