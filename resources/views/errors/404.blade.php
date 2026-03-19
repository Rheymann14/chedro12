<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Page Not Found | CHED Portal</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    @vite(['resources/css/app.css'])
</head>
<body class="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
    <main class="flex min-h-screen items-center justify-center px-4 py-8">
        <section class="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <img src="{{ asset('chedlogo.png') }}" alt="CHED logo" class="mx-auto h-20 w-20 object-contain">

            <p class="mt-5 text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">CHED Portal</p>
            <h1 class="mt-4 text-5xl font-semibold tracking-tight text-slate-900">404</h1>
            <h2 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Page not found</h2>

            <p class="mt-4 text-base leading-8 text-slate-600">
                The page you are looking for does not exist or may have been moved.
            </p>

            <div class="mt-8">
                <a
                    href="{{ url('/') }}"
                    class="inline-flex items-center justify-center rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                >
                    Go to homepage
                </a>
            </div>
        </section>
    </main>
</body>
</html>
