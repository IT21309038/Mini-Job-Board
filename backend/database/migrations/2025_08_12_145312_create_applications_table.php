<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();

            // Candidate who applied for job
            $table->foreignId('candidate_id')->constrained('users')->cascadeOnDelete();

            // The job applied for
            $table->foreignId('job_id')->constrained('job_posts')->cascadeOnDelete();

            $table->text('cover_letter')->nullable();

            // Resumes saved in local storage
            // Name and path for retrival
            $table->string('resume_path')->nullable();
            $table->string('resume_original_name')->nullable();

            $table->timestamps();

            // Ensure a candidate can only apply to a job once
            $table->unique(['candidate_id', 'job_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
