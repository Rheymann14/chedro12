<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
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
<body class="min-h-screen overflow-x-hidden bg-slate-100 font-sans text-slate-900 antialiased">
    <main class="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.22),_transparent_26%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)]"></div>
        <div class="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl"></div>
        <div class="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl"></div>

        <section class="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.14)] backdrop-blur">
            <div class="grid items-center gap-0 lg:grid-cols-[0.95fr,1.05fr]">
                <div class="relative flex h-full items-center justify-center overflow-hidden bg-[linear-gradient(160deg,_rgba(30,64,175,0.98),_rgba(37,99,235,0.88)_60%,_rgba(251,191,36,0.58))] px-8 py-12 sm:px-10 sm:py-14">
                    <div class="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.28),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.25),_transparent_38%)]"></div>
                    <div class="relative flex max-w-sm flex-col items-center text-center text-white">
                        <div class="mb-6 flex h-28 w-28 items-center justify-center rounded-[28px] bg-white/16 ring-1 ring-white/30 backdrop-blur">
                            <img src="{{ asset('chedlogo.png') }}" alt="CHED logo" class="h-20 w-20 object-contain drop-shadow-lg">
                        </div>
                        <p class="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-blue-100">CHED Portal</p>
                        <h1 class="text-6xl font-semibold tracking-tight sm:text-7xl">404</h1>
                        <p class="mt-4 text-sm leading-7 text-blue-50/90 sm:text-base">
                            The page you were trying to open could not be found.
                        </p>
                    </div>
                </div>

                <div class="px-8 py-10 sm:px-10 sm:py-12 lg:px-12">
                    <div class="mx-auto max-w-xl text-center lg:text-left">
                        <span class="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                            Regional Office XII
                        </span>
                        <h2 class="mt-5 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                            Page not found
                        </h2>
                        <p class="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                            The link may be outdated, unavailable, or typed incorrectly. Return to the portal homepage or go back to the previous page and continue browsing.
                        </p>

                        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                            <a
                                href="{{ url('/') }}"
                                class="inline-flex min-w-44 items-center justify-center rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800"
                            >
                                Go to homepage
                            </a>
                            <a
                                href="javascript:history.back()"
                                class="inline-flex min-w-44 items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                Go back
                            </a>
                        </div>

                        <div class="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
                            <p class="font-semibold text-slate-800">Commission on Higher Education Regional Office XII</p>
                            <p>If you reached this page from a saved bookmark or shared link, the address may have changed.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
</body>
</html>
