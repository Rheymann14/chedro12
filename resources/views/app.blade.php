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

        <title inertia>{{ $page['props']['meta']['title'] ?? 'CHED Portal' }}</title>
        <meta name="description" content="{{ $page['props']['meta']['description'] ?? 'Commission on Higher Education Regional Office XII portal and online services.' }}">
        <meta property="og:site_name" content="CHED Portal">
        <meta property="og:title" content="{{ $page['props']['meta']['title'] ?? 'CHED Portal' }}">
        <meta property="og:description" content="{{ $page['props']['meta']['description'] ?? 'Commission on Higher Education Regional Office XII portal and online services.' }}">
        <meta property="og:image" content="{{ $page['props']['meta']['image'] ?? url('/ched%20logo.png') }}">
        <meta property="og:url" content="{{ $page['props']['meta']['url'] ?? url()->current() }}">
        <meta property="og:type" content="website">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ $page['props']['meta']['url'] ?? url()->current() }}" />
        <meta name="twitter:title" content="{{ $page['props']['meta']['title'] ?? 'CHED Portal' }}" />
        <meta name="twitter:description" content="{{ $page['props']['meta']['description'] ?? 'Commission on Higher Education Regional Office XII portal and online services.' }}" />
        <meta name="twitter:image" content="{{ $page['props']['meta']['image'] ?? url('/ched%20logo.png') }}" />

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
