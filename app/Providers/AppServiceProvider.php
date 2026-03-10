<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;
use App\Helpers\MetaHelper;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Authorization gate for managing career posts and postings
        Gate::define('manage-careerposts', function (User $user): bool {
            return in_array($user->role, ['admin', 'user'], true);
        });

        // Authorization gate for managing issuances (any authenticated user)
        Gate::define('manage-issuances', function (User $user): bool {
            return true; // Any authenticated user can manage issuances
        });
    }
}
