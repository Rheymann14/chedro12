/**
 * Dashboard Utility Functions
 * 
 * Shared utility functions for dashboard functionality
 * Includes date helpers, image helpers, and common operations
 * 
 * @fileoverview Utility functions for dashboard components
 * @author Your Name
 * @created 2024
 */

import * as React from 'react';
import { CareerPost } from '@/types/dashboard';
import DOMPurify from 'dompurify';

/**
 * Get CSRF Token from Meta Tag
 * Retrieves CSRF token for API requests
 */
export const getCsrfToken = (): string => {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
};

/**
 * Convert Date to YYYY-MM-DD Format
 * Converts a Date object to local YYYY-MM-DD string format
 * 
 * @param date - Date object to convert
 * @returns Formatted date string (YYYY-MM-DD)
 */
export const toYmdLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Parse Post Date to YYYY-MM-DD Format
 * Parses various date formats and converts to YYYY-MM-DD
 * 
 * @param value - Date string to parse
 * @returns Formatted date string or null if invalid
 */
export const parsePostDateYmd = (value: string): string | null => {
    const raw = (value || '').split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : toYmdLocal(date);
};

/**
 * Resolve stored media values to a browser-safe URL.
 * Supports raw storage paths, `/storage/...`, `storage/...`, and full URLs.
 */
export const resolveStorageUrl = (value: string | null | undefined): string | null => {
    const raw = value?.trim();

    if (!raw) return null;

    if (/^https?:\/\//i.test(raw)) {
        try {
            const url = new URL(raw);

            if (url.pathname.startsWith('/storage/')) {
                return `${url.pathname}${url.search}${url.hash}`;
            }
        } catch {
            return raw;
        }

        return raw;
    }

    if (raw.startsWith('/storage/')) {
        return raw;
    }

    if (raw.startsWith('storage/')) {
        return `/${raw}`;
    }

    return `/storage/${raw.replace(/^\/+/, '')}`;
};

/**
 * Get Carousel Images from Posts
 * Extracts first image from each post for carousel display
 * 
 * @param posts - Array of career posts
 * @returns Array of image URLs for carousel
 */
export const getCarouselImages = (posts: CareerPost[]): string[] => {
    return posts
        .map((post) => resolveStorageUrl(post.Poster?.[0]))
        .filter((image): image is string => Boolean(image));
};

/**
 * Extract the first YouTube thumbnail URL from HTML content
 * Supports urls like:
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://youtu.be/VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 * Returns an HQ thumbnail: https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg
 */
export const getYouTubeThumbnailFromHtml = (html: string | null | undefined): string | null => {
    if (!html) return null;
    // Quick bail if no youtube string
    if (!/youtu\.?be/.test(html)) return null;

    // Match common YouTube URL patterns and capture the video id
    const patterns: RegExp[] = [
        /https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g,
        /https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\b|\/|\?)/g,
        /https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/g,
    ];

    for (const re of patterns) {
        const match = re.exec(html);
        if (match && match[1]) {
            const id = match[1];
            return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }
    }

    // As a fallback, try to find v= param even if other params exist
    const vParamMatch = /[?&]v=([a-zA-Z0-9_-]{11})/.exec(html);
    if (vParamMatch && vParamMatch[1]) {
        return `https://i.ytimg.com/vi/${vParamMatch[1]}/hqdefault.jpg`;
    }

    return null;
};

/**
 * Sanitize HTML and ensure links open in a new tab safely
 * - Adds target="_blank" and rel="noopener noreferrer" to all anchor tags
 */
export const sanitizeHtmlForDisplay = (html: string | null | undefined): string => {
    const safe = DOMPurify.sanitize(html || '');
    const container = document.createElement('div');
    container.innerHTML = safe;
    const anchors = container.querySelectorAll('a[href]');
    anchors.forEach((a) => {
        const href = a.getAttribute('href') || '';
        // Only modify http/https links
        if (/^https?:\/\//i.test(href)) {
            a.setAttribute('target', '_blank');
            a.setAttribute('rel', 'noopener noreferrer');
        }
    });
    return container.innerHTML;
};

/**
 * Handle Image Load Event
 * Updates image status when image loads successfully
 * 
 * @param key - Unique key for the image
 * @param setImageStatus - State setter function
 */
export const handleImageLoad = (
    key: string,
    setImageStatus: React.Dispatch<React.SetStateAction<Record<string, 'loading' | 'loaded' | 'error'>>>
) => {
    setImageStatus((prev) => ({ ...prev, [key]: 'loaded' }));
};

/**
 * Handle Image Error Event
 * Updates image status when image fails to load
 * 
 * @param key - Unique key for the image
 * @param setImageStatus - State setter function
 */
export const handleImageError = (
    key: string,
    setImageStatus: React.Dispatch<React.SetStateAction<Record<string, 'loading' | 'loaded' | 'error'>>>
) => {
    setImageStatus((prev) => ({ ...prev, [key]: 'error' }));
};

/**
 * Initialize Image Status
 * Sets up initial loading state for carousel images
 * 
 * @param carouselImages - Array of image URLs
 * @param imageStatus - Current image status state
 * @returns Initialized image status object
 */
export const initializeImageStatus = (
    carouselImages: string[],
    imageStatus: Record<string, 'loading' | 'loaded' | 'error'>
): Record<string, 'loading' | 'loaded' | 'error'> => {
    const initStatus: Record<string, 'loading' | 'loaded' | 'error'> = {};
    carouselImages.forEach((src, index) => {
        const key = `${src}-${index}`;
        initStatus[key] = imageStatus[key] ?? 'loading';
    });
    return initStatus;
};
