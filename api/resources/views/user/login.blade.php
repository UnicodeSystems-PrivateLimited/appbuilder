@extends('layouts.user')
@section('title')
User login
@stop
@section('content')
<div class="auth-main">
    <div class="header ">
        <!--<img src="../../assets/img/logo.png"/>-->
        {{ HTML::image('resources/assets/images/logo.png') }}
    </div>
    <div class="login-box layout-align-center-center layout-column">
         {!! Form::open(array('url' => URL::route("account.login.post"), 'method' => 'post','class' => 'layout-column layout-align-center-center') ) !!}
        
            <h3>Login to {!! Config::get('acl_base.app_name') !!}
                 <!--<img src="../../assets/img/hand.png"/> -->
            {{ HTML::image('resources/assets/images/hand.png') }}
            </h3>
             <?php $message = Session::get('message'); ?>
            @if( isset($message) )
            <div class="alert alert-success">{!! $message !!}</div>
            @endif
            @if($errors && ! $errors->isEmpty() )
            @foreach($errors->all() as $error)
            <div class="alert alert-danger">{!! $error !!}</div>
            @endforeach
            @endif
            <div class="input-group">
                 <span><i class="fa fa-envelope" aria-hidden="true"></i></span>
               {!! Form::email('email', '', ['id' => 'email', 'class' => 'form-control with-primary-addon', 'placeholder' => 'Email address', 'required', 'autocomplete' => 'off']) !!}
              
            </div>
            <div class="input-group">
                 <span><i class="fa fa-lock" aria-hidden="true"></i></span>
                  {!! Form::password('password', ['id' => 'password', 'class' => 'form-control with-primary-addon', 'placeholder' => 'Password', 'required', 'autocomplete' => 'off']) !!}
                
            </div>
            <div class="rem-block">
                  {!! Form::checkbox('remember')!!}
               {!! Form::label('remember','Remember me') !!}
              
            </div>
            <button value="Login" type="submit">Log In</button>
             {!! Form::close() !!} 
       
        {!! link_to_route('account.recovery-password','Forgot password?') !!}
    </div>
</div>
@stop



