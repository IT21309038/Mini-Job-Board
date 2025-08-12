<?php

namespace App\Models;

use App\Enums\JobType;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPost extends Model
{
    use HasFactory;

    protected $table = 'job_posts';

    protected $fillable = [
        'employer_id',
        'title',
        'description',
        'location',
        'job_type',
    ];

    protected $casts = [
        'job_type' => JobType::class,
    ];

    // Relations define

    public function employer()
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'job_id');
    }

    public function candidates()
    {
        return $this->belongsToMany(User::class, 'applications', 'job_id', 'candidate_id')
            ->withTimestamps();
    }

    // Replace job type attribute mutator - into _
    protected function jobType(): Attribute
    {
        return Attribute::make(
            set: function ($value) {
                if ($value instanceof JobType) {
                    return $value->value;
                }
                $norm = str_replace('-', '_', strtolower((string) $value));

                // Will throw if not a valid enum, which is good.
                return JobType::from($norm)->value;
            }
        );
    }
}
