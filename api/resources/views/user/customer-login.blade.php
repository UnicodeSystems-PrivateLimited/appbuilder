@extends('layouts.user')
@section('title')
User login
@stop
@section('content')
<div class="auth-main update c-" style="background-image:url(<?php echo $login_bg_image ?>);background-color:<?php echo $login_bg_color ?>; background-repeat:<?php echo $login_bg_repeat ?>;background-size:<?php echo $bgsize ?>">
   
    <div class="header ">
        <!--<img src="../../assets/img/logo.png"/>-->
       {{ HTML::image($login_logo,'a picture', array('class' => 'mylabel','style'=>'max-width:100%;max-height:100%')) }}
        
    </div>
    <div class="login-box layout-align-center-center layout-column">
         {!! Form::open(array('url' => URL::route("account.customer.login.post"), 'method' => 'post','class' => 'layout-column layout-align-center-center') ) !!}
        
         <h3 style="text-align:center;color:<?php echo $text_color_login ?>">Login to CMS
                 <!--<img src="../../assets/img/hand.png"/> -->
            <!--{{ HTML::image($login_bg_image) }}-->
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
               {!! Form::text('email', '', ['id' => 'email', 'class' => 'form-control with-primary-addon', 'placeholder' => 'Email address/User Name', 'required', 'autocomplete' => 'off']) !!}
              
            </div>
            <div class="input-group">
                 <span><i class="fa fa-lock" aria-hidden="true"></i></span>
                  {!! Form::password('password', ['id' => 'password', 'class' => 'form-control with-primary-addon', 'placeholder' => 'Password', 'required', 'autocomplete' => 'off']) !!}
                
            </div>
            <div class="rem-block" style="color:<?php echo $text_color_login ?>">
                  {!! Form::checkbox('remember')!!}
               {!! Form::label('remember','Remember me', array('class' => 'mylabel','style'=>'color:'.$text_color_login))!!}
              
            </div>
            <button value="Login" type="submit"><span style="color:<?php echo $text_color_login ?>">Log In</span></button>
             {!! Form::close() !!} 
       
        <!--{!! link_to_route('account.recovery-password','Forgot password?') !!}-->
    </div>
</div>
@stop



