<!DOCTYPE html>
<html lang="en">
    <head>
        <base href="/tappit/" />
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="">
        <meta name="author" content="">
        <title>@yield('title')</title>
        <!-- Custom CSS -->
        <link rel="stylesheet" href="{{ URL::asset('resources/assets/css/style.css') }}">
        <link rel="stylesheet" href="{{ URL::asset('resources/assets/css/bootstrap.css') }}">
        <link rel="stylesheet" href="{{ URL::asset('resources/assets/css/baselayout.css') }}">
        @yield('headcontents')
    </head>
    <body ng-app="astro"  ng-controller="mainCtrl">
        <div class="intro-header">
            <div ng-if="alerts != null" class="messagePopup">
<!--                <uib-alert ng-repeat="alert in alerts" type="@{{alert.type}}" close="closeAlert($index)">@{{alert.msg}}</uib-alert>-->
            </div>
            <div class="container">
                @yield('content')
            </div><!--
            <!-- /.container -->
        </div>
        <!-- /.intro-header --> 
    </body>
</html>
