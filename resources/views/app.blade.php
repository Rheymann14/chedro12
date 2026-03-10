<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Force light mode - ignore system dark mode preference --}}
        <script>
            (function() {
                // Always force light mode, regardless of system preference
                document.documentElement.classList.remove('dark');
                document.documentElement.style.colorScheme = 'light';
            })();
        </script>

        {{-- Inline style to set the HTML background color to light mode only --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }
            /* Remove dark mode styles - force light mode only */
            html.dark {
                background-color: oklch(1 0 0) !important;
            }
        </style>

        <title inertia>CHED Portal</title>
        <meta property="og:title" content="{{ $page['props']['meta']['title'] ?? 'My App' }}">
    <meta property="og:description" content="{{ $page['props']['meta']['description'] ?? '' }}">
    <meta property="og:image" content="{{ $page['props']['meta']['image'] ?? asset('img/default-og-image.png') }}">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:type" content="website">
    
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="{{ url()->current() }}" />
    <meta name="twitter:title" content="{{ $page['props']['meta']['title'] ?? 'My App' }}" />
    <meta name="twitter:description" content="{{ $page['props']['meta']['description'] ?? '' }}" />
    <meta name="twitter:image" content="{{ $page['props']['meta']['image'] ?? asset('default-og.jpg') }}" /> 

        <link rel="icon" href="/favicon.ico?v={{ time() }}" type="image/x-icon">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
