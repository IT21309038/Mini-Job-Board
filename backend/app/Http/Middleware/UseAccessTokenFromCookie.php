<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UseAccessTokenFromCookie
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->bearerToken()) {
            $token = $request->cookie('access_token');
            if ($token) {
                $request->headers->set('Authorization', 'Bearer '.$token);
            }
        }

        return $next($request);
    }
}
