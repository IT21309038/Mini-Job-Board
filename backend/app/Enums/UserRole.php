<?php

namespace App\Enums;

enum UserRole: string
{
    case Employer = 'employer';
    case Candidate = 'candidate';
}
