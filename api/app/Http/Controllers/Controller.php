<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesResources;

class Controller extends BaseController
{
    use AuthorizesRequests, AuthorizesResources, DispatchesJobs, ValidatesRequests;

    public static function getSuccessResponse(string $message = NULL, $data = []): array {
        $response = ['success' => TRUE];
        if ($message) {
            $response['message'] = $message;
        }
        if (!empty($data)) {
            $response['data'] = $data;
        }
        return $response;
    }

    public static function getErrorResponse(string $message = NULL, $errors = []): array {
        $response = ['success' => FALSE];
        if ($message) {
            $response['message'] = $message;
        }
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        return $response;
    }

}
