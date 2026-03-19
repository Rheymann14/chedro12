<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Page Not Found | CHED Portal</title>
    <meta name="robots" content="noindex">
    <style>
        :root {
            color-scheme: light;
            --page-bg: #f4f7fb;
            --card-bg: #ffffff;
            --text: #12315b;
            --muted: #5b6b82;
            --border: #d8e2f0;
            --primary: #0b57d0;
            --primary-dark: #0845a4;
            --shadow: 0 22px 60px rgba(13, 42, 84, 0.12);
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
            background:
                radial-gradient(circle at top left, rgba(11, 87, 208, 0.08), transparent 32%),
                radial-gradient(circle at bottom right, rgba(255, 206, 61, 0.18), transparent 28%),
                var(--page-bg);
            color: var(--text);
        }

        .shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }

        .card {
            width: min(100%, 680px);
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 24px;
            box-shadow: var(--shadow);
            padding: 40px 32px;
            text-align: center;
        }

        .logo {
            width: 88px;
            height: 88px;
            object-fit: contain;
            margin-bottom: 20px;
        }

        .eyebrow {
            display: inline-block;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--primary);
            margin-bottom: 12px;
        }

        h1 {
            margin: 0;
            font-size: clamp(32px, 6vw, 54px);
            line-height: 1;
        }

        h2 {
            margin: 14px 0 10px;
            font-size: clamp(20px, 3vw, 28px);
            line-height: 1.2;
        }

        p {
            margin: 0 auto;
            max-width: 520px;
            font-size: 16px;
            line-height: 1.7;
            color: var(--muted);
        }

        .actions {
            margin-top: 28px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 172px;
            padding: 12px 18px;
            border-radius: 999px;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .button-primary {
            background: var(--primary);
            color: #fff;
            border: 1px solid var(--primary);
        }

        .button-primary:hover {
            background: var(--primary-dark);
            border-color: var(--primary-dark);
            transform: translateY(-1px);
        }

        .button-secondary {
            background: #fff;
            color: var(--text);
            border: 1px solid var(--border);
        }

        .button-secondary:hover {
            border-color: #b8c7db;
            transform: translateY(-1px);
        }

        .footer-note {
            margin-top: 20px;
            font-size: 14px;
            color: #75849a;
        }

        @media (max-width: 640px) {
            .card {
                padding: 32px 22px;
                border-radius: 20px;
            }

            .logo {
                width: 76px;
                height: 76px;
            }

            .actions {
                flex-direction: column;
            }

            .button {
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <main class="shell">
        <section class="card" aria-labelledby="error-title">
            <img class="logo" src="{{ asset('chedlogo.png') }}" alt="CHED logo">
            <div class="eyebrow">CHED Portal</div>
            <h1>404</h1>
            <h2 id="error-title">Page not found</h2>
            <p>
                The page you requested is unavailable or may have been moved. Please return to the CHED Regional Office XII portal and continue from there.
            </p>

            <div class="actions">
                <a class="button button-primary" href="{{ url('/') }}">Go to homepage</a>
                <a class="button button-secondary" href="javascript:history.back()">Go back</a>
            </div>

            <div class="footer-note">Commission on Higher Education Regional Office XII</div>
        </section>
    </main>
</body>
</html>
