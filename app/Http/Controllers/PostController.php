<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Careerpost;
use App\Models\Issuance;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use App\Helpers\MetaHelper;

class PostController extends Controller
{
    /**
     * Display the unified dashboard with role-based features
     */
    public function dashboard(Request $request)
    {
        $perPage = $request->get('per_page', 6); // Default 6 posts per page
        $user = auth()->user();
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::query();
        if (!$user) {
            $query->published();
        }
        $posts = $query->orderByDesc('posted_date')->paginate($perPage);

        $careerPostCount = Careerpost::careerPosts()->count();
        $postingsCount = Careerpost::postings()->count();
        $userCount = User::count();
        $headerMenuCount = $this->getHeaderMenuCount();
        
        // Get post dates for calendar highlighting (all for authenticated, published only for public)
        $dateQuery = Careerpost::query();
        if (!$user) {
            $dateQuery->published();
        }
        $allPostDates = $dateQuery
            ->select('posted_date')
            ->orderBy('posted_date', 'desc')
            ->get()
            ->pluck('posted_date')
            ->toArray();
        
        // Always render the unified dashboard component
        // The component will conditionally render features based on user role
        return Inertia::render('public/dashboard', [
            'posts' => $posts,
            'user' => $user, // Can be null for public users
            'allPostDates' => $allPostDates,
            'stats' => [
                'careerPosts' => $careerPostCount,
                'postings' => $postingsCount,
                'users' => $userCount,
                'headerMenu' => $headerMenuCount,
            ],
        ]);
    }

    /**
     * Display all career posts (public access)
     */
    public function careerPosts()
    {
        $user = auth()->user();
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::careerPosts();
        if (!$user) {
            $query->published();
        }
        $posts = $query->orderByDesc('posted_date')->get();
        
        $meta = MetaHelper::getCareerPostsMeta(request()->url());
        
        // Collect post dates for calendar highlighting (all for authenticated, published only for public)
        $dateQuery = Careerpost::careerPosts();
        if (!$user) {
            $dateQuery->published();
        }
        $allPostDates = $dateQuery
            ->select('posted_date')
            ->orderBy('posted_date', 'desc')
            ->get()
            ->pluck('posted_date')
            ->toArray();
        
        return Inertia::render('public/careerPost', [
            'posts' => $posts,
            'meta' => $meta,
            'allPostDates' => $allPostDates,
        ]);
    }

    /**
     * Display all postings (public access)
     */
    public function postings()
    {
        $user = auth()->user();
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::postings();
        if (!$user) {
            $query->published();
        }
        $posts = $query->orderByDesc('posted_date')->get();
        
        $meta = MetaHelper::getPostingsMeta(request()->url());
        
        // Collect post dates for calendar highlighting (all for authenticated, published only for public)
        $dateQuery = Careerpost::postings();
        if (!$user) {
            $dateQuery->published();
        }
        $allPostDates = $dateQuery
            ->select('posted_date')
            ->orderBy('posted_date', 'desc')
            ->get()
            ->pluck('posted_date')
            ->toArray();
        
        return Inertia::render('public/postings', [
            'posts' => $posts,
            'meta' => $meta,
            'allPostDates' => $allPostDates,
        ]);
    }

    /**
     * Display all awards commendations (public access)
     */
    public function awardsCommendation()
    {
        $user = auth()->user();
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::awardsCommendations();
        if (!$user) {
            $query->published();
        }
        $posts = $query->orderByDesc('posted_date')->get();
        
        $meta = MetaHelper::getAwardsCommendationsMeta(request()->url());
        
        // Collect post dates for calendar highlighting (all for authenticated, published only for public)
        $dateQuery = Careerpost::awardsCommendations();
        if (!$user) {
            $dateQuery->published();
        }
        $allPostDates = $dateQuery
            ->select('posted_date')
            ->orderBy('posted_date', 'desc')
            ->get()
            ->pluck('posted_date')
            ->toArray();
        
        return Inertia::render('public/awardsCommendation', [
            'posts' => $posts,
            'meta' => $meta,
            'allPostDates' => $allPostDates,
        ]);
    }

    /**
     * Get all posts for a specific date (for calendar filtering)
     */
    public function getPostsByDate(Request $request)
    {
        $date = $request->get('date');
        $page = $request->get('page', 1);
        $perPage = $request->get('per_page', 6);
        $user = auth()->user();
        
        if (!$date) {
            return response()->json(['error' => 'Date parameter is required'], 400);
        }
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::query();
        if (!$user) {
            $query->published();
        }
        $posts = $query->whereDate('posted_date', $date)
            ->orderByDesc('posted_date')
            ->paginate($perPage, ['*'], 'page', $page);
            
        return response()->json([
            'posts' => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
                'from' => $posts->firstItem(),
                'to' => $posts->lastItem(),
                'links' => $posts->linkCollection()->toArray(),
            ],
            'date' => $date,
            'count' => $posts->count()
        ]);
    }

    /**
     * Authenticated user career posts management page (CRUD via non-admin endpoints)
     */
    public function userCareerPosts()
    {
        $posts = Careerpost::careerPosts()->orderByDesc('posted_date')->get();
        
        // Collect all posted dates to highlight in the calendar
        $allPostDates = Careerpost::careerPosts()
            ->select('posted_date')
            ->orderBy('posted_date', 'desc')
            ->get()
            ->pluck('posted_date')
            ->toArray();
        
        return Inertia::render('user/careerPost', [
            'posts' => $posts,
            'allPostDates' => $allPostDates,
        ]);
    }

    /**
     * Authenticated user postings management page (CRUD via non-admin endpoints)
     */
    public function userPostings()
    {
        $posts = Careerpost::postings()->orderByDesc('posted_date')->get();
        
        // Collect all posted dates to highlight in the calendar
        $allPostDates = Careerpost::postings()
            ->select('posted_date')
            ->orderBy('posted_date', 'desc')
            ->get()
            ->pluck('posted_date')
            ->toArray();
        
        return Inertia::render('user/postings', [
            'posts' => $posts,
            'allPostDates' => $allPostDates,
        ]);
    }

    /**
     * Authenticated user awards commendations management page (CRUD via non-admin endpoints)
     * Now uses the same public page with role-based features
     */
    public function userAwardsCommendation()
    {
        $posts = Careerpost::awardsCommendations()->orderByDesc('posted_date')->get();
        $meta = MetaHelper::getAwardsCommendationsMeta(request()->url());
        
        // Collect all posted dates to highlight in the calendar
        $allPostDates = Careerpost::awardsCommendations()
            ->select('posted_date')
            ->orderBy('posted_date', 'desc')
            ->get()
            ->pluck('posted_date')
            ->toArray();
        
        return Inertia::render('public/awardsCommendation', [
            'posts' => $posts,
            'meta' => $meta,
            'allPostDates' => $allPostDates,
        ]);
    }

    /**
     * Display a single post (public access)
     */
    public function show(Careerpost $careerPost)
    {
        $user = auth()->user();
        
        // Check if post is published (posted_date <= today)
        // Authenticated users can view future-dated posts, public users cannot
        if (!$user && $careerPost->posted_date && $careerPost->posted_date > now()->toDateString()) {
            abort(404);
        }
        
        $meta = MetaHelper::getPostMeta($careerPost, request()->url());
        
        return Inertia::render('public/PostDetail', [
            'post' => $careerPost,
            'meta' => $meta,
        ]);
    }

    /**
     * Search postings (public access)
     */
    public function searchPostings(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $user = auth()->user();
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::postings();
        if (!$user) {
            $query->published();
        }
        $query->orderByDesc('posted_date');
        
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('headline', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('career', 'like', "%{$q}%");
            });
        }
        $posts = $query->get();
        return response()->json([
            'success' => true,
            'posts' => $posts,
        ]);
    }

    /**
     * Search career posts (public access)
     */
    public function searchCareerPosts(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $user = auth()->user();
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::careerPosts();
        if (!$user) {
            $query->published();
        }
        $query->orderByDesc('posted_date');
        
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('headline', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('career', 'like', "%{$q}%");
            });
        }
        $posts = $query->get();
        return response()->json([
            'success' => true,
            'posts' => $posts,
        ]);
    }

    /**
     * Search awards commendations (public access)
     */
    public function searchAwardsCommendations(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $user = auth()->user();
        
        // Authenticated users can see all posts (including future ones), public users only see published
        $query = Careerpost::awardsCommendations();
        if (!$user) {
            $query->published();
        }
        $query->orderByDesc('posted_date');
        
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('headline', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('career', 'like', "%{$q}%");
            });
        }
        $posts = $query->get();
        return response()->json([
            'success' => true,
            'posts' => $posts,
        ]);
    }

    /**
     * Display static pages (public access)
     */
    public function about()
    {
        return Inertia::render('public/about');
    }

    public function onlineServices()
    {
        return Inertia::render('public/onlineServices');
    }

    public function hemis()
    {
        return Inertia::render('public/hemis');
    }

    public function contactUs()
    {
        return Inertia::render('public/contactUs');
    }

    public function historicalBackground()
    {
        return Inertia::render('public/historicalBackground');
    }

    public function mandate()
    {
        return Inertia::render('public/mandate');
    }

    public function visionMission()
    {
        return Inertia::render('public/visionMission');
    }

    public function policyStatement()
    {
        return Inertia::render('public/policyStatement');
    }

    public function cavApplication()
    {
        return Inertia::render('public/cavApplication');
    }

    public function statistics()
    {
        return Inertia::render('public/statistics');
    }

    public function recognizedPrograms()
    {
        return Inertia::render('public/recognizedPrograms');
    }

    public function resources()
    {
        return Inertia::render('public/resources');
    }

    public function headerMenuAdmin()
    {
        return Inertia::render('admin/header-menu');
    }

    public function regionalMemo()
    {
        $query = Issuance::with(['years.documents'])
            ->orderBy('issuance_type');
        
        // Filter by view_type based on authentication
        if (auth()->check()) {
            // Authenticated users can see both public and private issuances
            $issuances = $query->get();
        } else {
            // Non-authenticated users can only see public issuances
            $issuances = $query->where('view_type', 'public')->get();
        }
        
        $groupedIssuances = $issuances->groupBy('issuance_type');
        
        return Inertia::render('public/regionalMemo', [
            'issuances' => $groupedIssuances,
        ]);
    }

    private function getHeaderMenuCount(): int
    {
        $file = 'data/appheadMenu.json';

        if (!Storage::exists($file)) {
            return self::DEFAULT_HEADER_MENU_COUNT;
        }

        $raw = Storage::get($file);
        $decoded = json_decode($raw, true);

        if (!is_array($decoded)) {
            return self::DEFAULT_HEADER_MENU_COUNT;
        }

        $items = $decoded['items'] ?? [];

        if (!is_array($items) || empty($items)) {
            return self::DEFAULT_HEADER_MENU_COUNT;
        }

        return count($items);
    }

    private const DEFAULT_HEADER_MENU_COUNT = 8;
}