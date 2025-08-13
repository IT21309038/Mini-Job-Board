<?php

namespace App\Http\Requests\Application;

use Illuminate\Foundation\Http\FormRequest;

class ApplicationStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'job_id' => ['required', 'integer', 'exists:job_posts,id'],
            'cover_letter' => ['nullable', 'string'],
            // PDF upto 5mb max
            'resume' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ];
    }
}
