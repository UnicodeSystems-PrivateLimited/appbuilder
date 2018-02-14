@extends('layouts.user')
@section ('title')
    Password recovery
@stop
@section('content')
<div class="auth-main">
    <div class="header ">
        {{ HTML::image('resources/assets/images/logo.png') }}
    </div>
    <div class="login-box layout-align-center-center layout-column">
        <h3 class="up-case">Request received
            {{ HTML::image('resources/assets/images/hand.png') }}
        </h3>
        <p class="success-log">Password has been reset.</p>
        <p><a href="{!! URL::route('account.login') !!}"><i class="fa fa-arrow-left"></i> Back to login</a></p>
    </div>
</div>
@stop


