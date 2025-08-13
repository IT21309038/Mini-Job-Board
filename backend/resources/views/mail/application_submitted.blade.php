@component('mail::message')
# New Application

**Job:** {{ $job->title }}
**Candidate:** {{ $candidate->name }} ({{ $candidate->email }})

**Cover Letter:**
{{ $application->cover_letter ?? '—' }}

@isset($resumeUrl)
@component('mail::button', ['url' => $resumeUrl])
Download Resume (temporary link)
@endcomponent
@endisset

Thanks,
{{ config('app.name') }}
@endcomponent
