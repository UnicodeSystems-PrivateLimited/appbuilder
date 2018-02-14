@extends('layouts.user')
@section ('title')
    Member Register Success
@stop
@section('content')
<div class="auth-main">
    <div class="header ">
        {{ HTML::image('resources/assets/images/logo.png') }}
    </div>
    <div class="login-box layout-align-center-center layout-column">
        <h3 class="up-case">
            {{ HTML::image('resources/assets/images/hand.png') }}
        </h3>
        <p class="success-log">Member registered successfully.</p>
    </div>
</div>
@stop


