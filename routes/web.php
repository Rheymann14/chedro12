<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\Admin\ContactSettingsController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RecognizedProgramController;
use App\Http\Controllers\ViewController;
use App\Http\Controllers\IssuanceController;
use App\Http\Controllers\Api\MenuItemController as ApiMenuItemController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Artisan;

// --- Temporary route for storage:link ---
// REMOVE or comment out after using for security!
Route::get('/run', function () {
    Artisan::call('storage:link');
    return 'Storage link created!';
});
// --- End storage:link route ---

// Public routes - accessible to everyone
Route::get('/', [PostController::class, 'dashboard'])->name('home');

// Recognized Programs routes
Route::get('/recognized-programs', [RecognizedProgramController::class, 'index'])
    ->name('recognized-programs.index');
Route::get('/recognized-programs/export/pdf', [RecognizedProgramController::class, 'exportPdf'])
    ->name('recognized-programs.export.pdf');
Route::get('/recognized-programs/export/xlsx', [RecognizedProgramController::class, 'exportXlsx'])
    ->name('recognized-programs.export.xlsx');

// Lightweight view tracking
Route::post('/views/track', [ViewController::class, 'track'])->name('views.track');
Route::get('/views/count', [ViewController::class, 'count'])->name('views.count');

Route::get('/dashboard', [PostController::class, 'dashboard'])->name('dashboard');
Route::get('/careerPost', [PostController::class, 'careerPosts'])->name('careerPost');
Route::get('/postings', [PostController::class, 'postings'])->name('postings');
Route::get('/awardsCommendation', [PostController::class, 'awardsCommendation'])->name('awardsCommendation');
Route::get('/postings/search', [PostController::class, 'searchPostings'])->name('postings.search');
Route::get('/careerPost/search', [PostController::class, 'searchCareerPosts'])->name('careerPost.search');
Route::get('/awardsCommendation/search', [PostController::class, 'searchAwardsCommendations'])->name('awardsCommendation.search');
Route::get('/post/{careerPost}', [PostController::class, 'show'])->name('post.show');
Route::get('/api/posts/by-date', [PostController::class, 'getPostsByDate'])->name('posts.by-date');

// Static pages (public)
Route::get('/about', [PostController::class, 'about'])->name('about');
Route::get('/onlineServices', [PostController::class, 'onlineServices'])->name('onlineServices');
Route::get('/hemis', [PostController::class, 'hemis'])->name('hemis');
Route::get('/contactUs', [PostController::class, 'contactUs'])->name('contactUs');
Route::get('/historicalBackground', [PostController::class, 'historicalBackground'])->name('historicalBackground');
Route::get('/mandate', [PostController::class, 'mandate'])->name('mandate');
Route::get('/visionMission', [PostController::class, 'visionMission'])->name('visionMission');
Route::get('/policyStatement', [PostController::class, 'policyStatement'])->name('policyStatement');
Route::get('/cavApplication', [PostController::class, 'cavApplication'])->name('cavApplication');
Route::get('/statistics', [PostController::class, 'statistics'])->name('statistics');
Route::get('/recognizedprograms', [PostController::class, 'recognizedPrograms'])->name('recognizedprograms');
Route::get('/regionalMemo', [PostController::class, 'regionalMemo'])->name('regionalMemo');
Route::get('/resources', [PostController::class, 'resources'])->name('resources');

// Simple API endpoints (mounted under web for this app)
Route::prefix('api')->group(function () {
    Route::get('/menu-items', [ApiMenuItemController::class, 'index']);
    Route::post('/menu-items', [ApiMenuItemController::class, 'store']);
    Route::put('/menu-items/{id}', [ApiMenuItemController::class, 'update']);
    Route::delete('/menu-items/{id}', [ApiMenuItemController::class, 'destroy']);

    // Namespaced per-page datasets so lists don't merge
    Route::get('/menu-items/{key}', [ApiMenuItemController::class, 'indexKey']);
    Route::post('/menu-items/{key}', [ApiMenuItemController::class, 'storeKey']);
    Route::put('/menu-items/{key}/{id}', [ApiMenuItemController::class, 'updateKey']);
    Route::delete('/menu-items/{key}/{id}', [ApiMenuItemController::class, 'destroyKey']);

    // App Header Menu - public read, admin write
    Route::get('/app-header-menu', [ApiMenuItemController::class, 'indexAppHeader']);
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/app-header-menu', [ApiMenuItemController::class, 'storeAppHeader']);
        Route::put('/app-header-menu/{id}', [ApiMenuItemController::class, 'updateAppHeader']);
        Route::delete('/app-header-menu/{id}', [ApiMenuItemController::class, 'destroyAppHeader']);
        Route::post('/app-header-menu/reorder', [ApiMenuItemController::class, 'reorderAppHeader']);
    });

    Route::middleware(['auth'])->get('/dashboard-counts', [StatsController::class, 'dashboard']);
});

// Authenticated routes - require login
Route::middleware(['auth'])->group(function () {
    // User management pages (non-admin) - CRUD uses non-admin endpoints already defined below
    Route::get('/user/careerPost', [PostController::class, 'userCareerPosts'])->name('user.careerPost');
    Route::get('/user/postings', [PostController::class, 'userPostings'])->name('user.postings');
    Route::get('/user/awardsCommendation', [PostController::class, 'userAwardsCommendation'])->name('user.awardsCommendation');
    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/careerPost', [AdminPostController::class, 'index'])->name('admin.careerPost');
        Route::post('/admin/careerPost', [AdminPostController::class, 'store'])->name('admin.careerPost.store');
        Route::put('/admin/careerPost/{careerPost}', [AdminPostController::class, 'update'])->name('admin.careerPost.update');
        Route::delete('/admin/careerPost/{careerPost}', [AdminPostController::class, 'destroy'])->name('admin.careerPost.destroy');

        Route::get('/admin/postings', [AdminPostController::class, 'postings'])->name('admin.postings');
        Route::post('/admin/postings', [AdminPostController::class, 'store'])->name('admin.postings.store');
        Route::put('/admin/postings/{careerPost}', [AdminPostController::class, 'update'])->name('admin.postings.update');
        Route::delete('/admin/postings/{careerPost}', [AdminPostController::class, 'destroy'])->name('admin.postings.destroy');

        Route::get('/admin/awardsCommendation', [AdminPostController::class, 'awardsCommendation'])->name('admin.awardsCommendation');
        Route::post('/admin/awardsCommendation', [AdminPostController::class, 'store'])->name('admin.awardsCommendation.store');
        Route::put('/admin/awardsCommendation/{careerPost}', [AdminPostController::class, 'update'])->name('admin.awardsCommendation.update');
        Route::delete('/admin/awardsCommendation/{careerPost}', [AdminPostController::class, 'destroy'])->name('admin.awardsCommendation.destroy');

        Route::get('/admin/users', [AdminUserController::class, 'index'])->name('admin.users');
        Route::post('/admin/users', [AdminUserController::class, 'store'])->name('admin.users.store');
        Route::put('/admin/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
        Route::delete('/admin/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');

        Route::get('/admin/header-menu', [PostController::class, 'headerMenuAdmin'])->name('admin.header-menu');
        Route::get('/admin/contact-settings', [ContactSettingsController::class, 'edit'])->name('admin.contact-settings');
        Route::put('/admin/contact-settings', [ContactSettingsController::class, 'update'])->name('admin.contact-settings.update');
    });

    // User CRUD routes (for authenticated users) - require manage-careerposts permission
    Route::middleware(['can:manage-careerposts'])->group(function () {
        Route::post('/careerPost', [AdminPostController::class, 'store'])->name('careerPost.store');
        Route::put('/careerPost/{careerPost}', [AdminPostController::class, 'update'])->name('careerPost.update');
        Route::delete('/careerPost/{careerPost}', [AdminPostController::class, 'destroy'])->name('careerPost.destroy');

        Route::post('/postings', [AdminPostController::class, 'store'])->name('postings.store');
        Route::put('/postings/{careerPost}', [AdminPostController::class, 'update'])->name('postings.update');
        Route::delete('/postings/{careerPost}', [AdminPostController::class, 'destroy'])->name('postings.destroy');

        Route::post('/awardsCommendation', [AdminPostController::class, 'store'])->name('awardsCommendation.store');
        Route::put('/awardsCommendation/{careerPost}', [AdminPostController::class, 'update'])->name('awardsCommendation.update');
        Route::delete('/awardsCommendation/{careerPost}', [AdminPostController::class, 'destroy'])->name('awardsCommendation.destroy');

    });

    // Issuances routes - require manage-issuances permission (any authenticated user)
    Route::middleware(['can:manage-issuances'])->group(function () {
        Route::post('/issuances', [IssuanceController::class, 'store'])->name('issuances.store');
        Route::put('/issuances/{issuance}', [IssuanceController::class, 'update'])->name('issuances.update');
        Route::delete('/issuances/{issuance}', [IssuanceController::class, 'destroy'])->name('issuances.destroy');
    });

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
