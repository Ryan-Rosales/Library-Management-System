<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Libraria') }}</title>
        <link rel="icon" type="image/png" href="/images/Libraria.png">
        <link rel="apple-touch-icon" href="/images/Libraria.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @php
            $pageEntry = file_exists(resource_path("js/pages/{$page['component']}.jsx"))
                ? "resources/js/pages/{$page['component']}.jsx"
                : "resources/js/pages/{$page['component']}.tsx";
        @endphp
        @viteReactRefresh
        @vite(['resources/js/app.jsx', $pageEntry])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
