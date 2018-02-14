@extends('layouts.user')
@section ('title')
    Password recovery
@stop
@section('content')

<div class="auth-main">
    <div class="header ">
        <!--<img src="../../assets/img/logo.png"/>-->
        {{ HTML::image('resources/assets/images/logo.png') }}
    </div>
    <div class="login-box layout-align-center-center layout-column">
        
          {!! Form::open(array('url' => URL::route("account.reminder"), 'method' => 'post','class' => 'layout-column layout-align-center-center') ) !!}
        
            <h3>Password recovery
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
             
                    {!! Form::email('email', '', ['id' => 'email', 'class' => 'form-control with-primary-addon', 'placeholder' => 'Your account email', 'required', 'autocomplete' => 'off']) !!}
            </div>
         
          
            <button value="Recover" type="submit">Recover</button>
           {!! Form::close() !!}
       
         <a href="{!! URL::route('account.login') !!}"><i class="fa fa-arrow-left"></i> Back to login</a>
    </div>
</div>

@stop


