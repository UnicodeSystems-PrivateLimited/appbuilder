@extends('layouts.user')
@section ('title')
    Register
@stop
@section('content')

<div class="auth-main">
    <div class="header ">
        {{ HTML::image('resources/assets/images/logo.png') }}
    </div>
    <div class="login-box layout-align-center-center layout-column">
        
          {!! Form::open(array('url' => URL::route("member.save"), 'method' => 'post','class' => 'layout-column layout-align-center-center') ) !!}

            <h3>Register User
                 <!--<img src="../../assets/img/hand.png"/> -->
            {{ HTML::image('resources/assets/images/hand.png') }}
            </h3>
            @if($errors && ! $errors->isEmpty() )
            @foreach($errors->all() as $error)
            <div class="alert alert-danger">{{$error}}</div>
            @endforeach
            @endif
            <div class="input-group">
                 <span><i class="fa fa-envelope" aria-hidden="true"></i></span>             
                    <input id="username" class="form-control with-primary-addon" placeholder="UserName" required="required" autocomplete="off" name="user_name" type="text" value="{{ old('user_name') }}">                    
            </div>
            <div class="input-group">
                 <span><i class="fa fa-envelope" aria-hidden="true"></i></span>             
                 <input id="email" class="form-control with-primary-addon" placeholder="Email" required="required" autocomplete="off" name="email" type="text" value="{{$email}}" readonly="true">                
            </div>
            <div class="input-group">
                 <span><i class="fa fa-envelope" aria-hidden="true"></i></span>             
                    <input id="password" class="form-control with-primary-addon" placeholder="Password" required="required" autocomplete="off" name="password" type="password" value="{{ old('password') }}">                    
            </div>
            <div class="input-group">
                 <span><i class="fa fa-envelope" aria-hidden="true"></i></span>             
                    <input id="confirmPassword" class="form-control with-primary-addon" placeholder="Confirm Password" required="required" autocomplete="off" name="password_confirmation" type="password" value="">                    
            </div>
            
            <button value="Recover" type="submit">Save</button>
           {!! Form::close() !!}
    </div>
</div>

@stop


