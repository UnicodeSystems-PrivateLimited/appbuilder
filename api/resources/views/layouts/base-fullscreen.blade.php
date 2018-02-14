<!DOCTYPE html>
<head>
    <meta charset="utf-8">
    <title>@yield('title')</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="keywords" content="">
    <meta name="author" content="">
    <link rel="stylesheet" href="{{ URL::asset('resources/assets/css/style.css') }}">
    <link rel="stylesheet" href="{{ URL::asset('resources/assets/css/bootstrap.css') }}">
    <link rel="stylesheet" href="{{ URL::asset('resources/assets/css/baselayout.css') }}">
</head>
<body>
    <div class="container-full">
        @yield('content')
    </div>
</body>
</html>