<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class MetaHelper
{
    private static function appName(): string
    {
        $configuredName = trim((string) config('app.name', ''));

        if ($configuredName === '' || strcasecmp($configuredName, 'Laravel') === 0) {
            return 'CHED Portal';
        }

        return $configuredName;
    }

    private static function defaultDescription(): string
    {
        return 'Commission on Higher Education Regional Office XII portal and online services.';
    }

    private static function defaultImage(?string $appUrl = null): string
    {
        $baseUrl = rtrim($appUrl ?? config('app.url', 'http://localhost'), '/');

        return $baseUrl . '/ched%20logo.png';
    }

    public static function getRouteTitle(?string $routeName): string
    {
        $pageTitle = match ($routeName) {
            'home', 'dashboard' => 'CHED Portal',
            'careerPost' => 'Career Postings',
            'awardsCommendation' => 'Awards & Commendations',
            'contactUs' => 'Contact Us',
            'onlineServices' => 'Online Services',
            'historicalBackground' => 'Historical Background',
            'visionMission' => 'Vision and Mission',
            'policyStatement' => 'Quality Policy Statement',
            'recognizedprograms', 'recognized-programs.index' => 'Recognized Programs',
            'regionalMemo' => 'Regional Memorandum',
            default => $routeName ? Str::headline($routeName) : 'CHED Portal',
        };

        return str_contains($pageTitle, 'CHED Portal') ? $pageTitle : "{$pageTitle} | CHED Portal";
    }

    /**
     * Get default meta tags
     *
     * @param string|null $title
     * @param string|null $description
     * @param string|null $image
     * @param string|null $url
     * @return array
     */
    public static function getDefaultMeta(
        ?string $title = null,
        ?string $description = null,
        ?string $image = null,
        ?string $url = null
    ): array {
        $appName = self::appName();
        $appUrl = config('app.url', 'http://localhost');
        
        return [
            'title' => $title ?? $appName,
            'description' => $description ?? self::defaultDescription(),
            'image' => $image ?? self::defaultImage($appUrl),
            'url' => $url ?? $appUrl,
        ];
    }

    /**
     * Get meta tags for a post
     *
     * @param object $post
     * @param string|null $url
     * @return array
     */
    public static function getPostMeta($post, ?string $url = null): array
    {
        $appUrl = config('app.url', 'http://localhost');
        $baseUrl = rtrim($appUrl, '/');
        
        // Get the post URL
        $postUrl = $url ?? $baseUrl . '/post/' . $post->id;
        
        // Get the post title
        $title = $post->headline ?? 'Post';
        $postType = $post->entry_type === 'posting' ? 'Posting' : 'Career Post';
        $fullTitle = "{$title} - {$postType} | CHED Portal";
        
        // Get description - strip HTML tags and limit length
        $description = strip_tags($post->description ?? '');
        $description = preg_replace('/\s+/', ' ', $description); // Remove extra whitespace
        $description = mb_substr($description, 0, 160); // Limit to 160 characters
        if (mb_strlen($post->description ?? '') > 160) {
            $description .= '...';
        }
        
        // Get image - use first poster image if available, otherwise default
        $image = null;
        if (!empty($post->Poster) && is_array($post->Poster) && count($post->Poster) > 0) {
            $imagePath = $post->Poster[0];
            // Ensure absolute URL
            if (str_starts_with($imagePath, 'http')) {
                $image = $imagePath;
            } else {
                $image = $baseUrl . '/storage/' . ltrim($imagePath, '/');
            }
        } else {
            $image = self::defaultImage($baseUrl);
        }
        
        return [
            'title' => $fullTitle,
            'description' => $description ?: "View this {$postType} on CHED Portal",
            'image' => $image,
            'url' => $postUrl,
        ];
    }

    /**
     * Get meta tags for postings list page
     *
     * @param string|null $url
     * @return array
     */
    public static function getPostingsMeta(?string $url = null): array
    {
        $appUrl = config('app.url', 'http://localhost');
        $baseUrl = rtrim($appUrl, '/');
        
        return [
            'title' => 'Postings | CHED Portal',
            'description' => 'Browse all postings and announcements from the Commission on Higher Education',
            'image' => self::defaultImage($baseUrl),
            'url' => $url ?? $baseUrl . '/postings',
        ];
    }

    /**
     * Get meta tags for career posts list page
     *
     * @param string|null $url
     * @return array
     */
    public static function getCareerPostsMeta(?string $url = null): array
    {
        $appUrl = config('app.url', 'http://localhost');
        $baseUrl = rtrim($appUrl, '/');
        
        return [
            'title' => 'Career Posts | CHED Portal',
            'description' => 'Browse all career opportunities and job postings from the Commission on Higher Education',
            'image' => self::defaultImage($baseUrl),
            'url' => $url ?? $baseUrl . '/careerPost',
        ];
    }

    /**
     * Get meta tags for awards commendations list page
     *
     * @param string|null $url
     * @return array
     */
    public static function getAwardsCommendationsMeta(?string $url = null): array
    {
        $appUrl = config('app.url', 'http://localhost');
        $baseUrl = rtrim($appUrl, '/');
        
        return [
            'title' => 'Awards & Commendations | CHED Portal',
            'description' => 'Browse all awards and commendations from the Commission on Higher Education',
            'image' => self::defaultImage($baseUrl),
            'url' => $url ?? $baseUrl . '/awardsCommendation',
        ];
    }
}
