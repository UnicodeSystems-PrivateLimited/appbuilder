<?php

namespace App\Exceptions;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Config;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that should not be reported.
     *
     * @var array
     */
    protected $dontReport = [
        AuthorizationException::class,
        HttpException::class,
        ModelNotFoundException::class,
        ValidationException::class,
    ];

    /**
     * Report or log an exception.
     *
     * This is a great spot to send exceptions to Sentry, Bugsnag, etc.
     *
     * @param  \Exception $e
     * @return void
     */
    public function report(Exception $e) {
        parent::report($e);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  \Exception $e
     * @return \Illuminate\Http\Response | \Illuminate\Http\JsonResponse
     */
    public function render($request, Exception $e) {
        if ($e instanceof QueryException) {
            return response()->json(Controller::getErrorResponse(Config::get('constants.DB_ERROR_MSG')));
        }
        if ($e instanceof Exception) {
            $message = $e->getMessage();
            $message = $message ? $message : get_class($e);
            return response()->json(Controller::getErrorResponse($message));
        }
        return parent::render($request, $e);
    }

}
