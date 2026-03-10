<?php

namespace App\Helpers;

class MetaHelper
{
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
        $appName = config('app.name', 'CHED Portal');
        $appUrl = config('app.url', 'http://localhost');
        
        return [
            'title' => $title ?? $appName,
            'description' => $description ?? 'CHED Portal - Commission on Higher Education',
            'image' => $image ?? $appUrl . '/img/default-og-image.png',
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
            $image = $baseUrl . '/img/default-og-image.png';
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
            'image' => $baseUrl . '/img/default-og-image.png',
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
            'image' => $baseUrl . '/img/default-og-image.png',
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
            'image' => $baseUrl . '/img/default-og-image.png',
            'url' => $url ?? $baseUrl . '/awardsCommendation',
        ];
    }
}

