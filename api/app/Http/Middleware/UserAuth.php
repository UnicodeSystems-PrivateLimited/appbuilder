<?php

namespace App\Http\Middleware;

use App;
use Closure;

class UserAuth {

    protected $response;

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle($request, Closure $next, $guard = null) {
       $authentication = App::make('authenticator');
        $authentication->authenticate(array(
            "email" => 'akashn@gmail.com',
            "password" => 'tappit@123',
        ), 1);
        $user = $authentication->getLoggedUser();
        if (!$user || !$user->id) {
            $res = ['session' => false];
            return response()->json($res);
        }
        return $next($request);
    }

}
