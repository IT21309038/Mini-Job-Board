<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'location' => $this->location,
            'job_type' => $this->job_type,
            'employer' => [
                'id' => $this->employer_id,
                'name' => $this->whenLoaded('employer', fn () => $this->employer?->name),
            ],
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
