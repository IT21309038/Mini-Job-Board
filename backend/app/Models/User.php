<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    // JWTSubject interface implementation
    public function getJWTIdentifier(): string
    {
        return (string) $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role->value,
            'email' => $this->email,
        ];
    }

    // Relationships define
    public function jobPosts()
    {
        // Jobs user created as an employer
        return $this->hasMany(JobPost::class, 'employer_id');
    }

    public function applications()
    {
        // Applications user submitted as a candidate
        return $this->hasMany(Application::class, 'candidate_id');
    }

    public function appliedJobs()
    {
        // Candidates applied for a job
        return $this->belongsToMany(JobPost::class, 'applications', 'candidate_id', 'job_id')->withTimestamps();
    }
}
