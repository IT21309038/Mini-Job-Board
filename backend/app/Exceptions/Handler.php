<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontReport = [

    ];

    public function register(): void
    {
        // Validation (422)
        $this->renderable(function (ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed.',
                    'errors' => $e->errors(),
                ], 422);
            }
        });

        // Unauthenticated (401)
        $this->renderable(function (AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
            }
        });

        // Forbidden (403)
        $this->renderable(function (AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['status' => 'error', 'message' => 'Forbidden.'], 403);
            }
        });

        // Not found (404)
        $this->renderable(function (NotFoundHttpException|ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['status' => 'error', 'message' => 'Not found.'], 404);
            }
        });

        // Method not allowed (405)
        $this->renderable(function (MethodNotAllowedHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['status' => 'error', 'message' => 'Method not allowed.'], 405);
            }
        });

        // Throttled (429)
        $this->renderable(function (TooManyRequestsHttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['status' => 'error', 'message' => 'Too many requests.'], 429);
            }
        });

        // Fallback (500)
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                // Optionally generate a request ID here and log it.
                return response()->json(['status' => 'error', 'message' => 'Server error.'], 500);
            }
        });
    }
}
