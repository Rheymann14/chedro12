/**
 * Dashboard Types
 * 
 * Shared type definitions for all dashboard components (public, user, admin)
 * This eliminates code duplication across the three dashboard files.
 * 
 * @fileoverview Centralized type definitions for dashboard functionality
 * @author Your Name
 * @created 2024
 */

/**
 * Career Post Data Structure
 * Represents a single career posting with all its properties
 */
export interface CareerPost {
    id: number;
    headline: string;
    description: string;
    posted_date: string;
    closing_date: string;
    career: string;
    Poster?: string[] | null;
    placeholder_images?: string[] | null;
    blurhash?: string[] | null;
    Video?: string | null;
    entry_type?: 'posting' | 'career_post' | 'awards_commendation';
}

/**
 * Posting Data Structure
 * Represents a generic posting item (separate from CareerPost if API differs)
 */
export interface Posting {
    id: number;
    headline: string;
    description: string;
    posted_date: string;
    closing_date?: string;
    Poster?: string[] | null;
    placeholder_images?: string[] | null;
    blurhash?: string[] | null;
    Video?: string | null;
}

/**
 * Paginated Posts Response
 * Contains pagination metadata and array of career posts
 */
export interface PaginatedPosts {
    data: CareerPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

/**
 * Paginated Postings Response
 * Contains pagination metadata and array of postings
 */
export interface PaginatedPostings {
    data: Posting[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

/**
 * User Data Structure
 * Represents user information for authenticated users
 */
export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

/**
 * Dashboard Page Types
 * Enumeration of different dashboard page identifiers for views tracking
 */
export const DASHBOARD_PAGES = {
    PUBLIC: 'dashboard',
    USER: 'user-dashboard',
    ADMIN: 'admin-dashboard',
} as const;

export type DashboardPageType = typeof DASHBOARD_PAGES[keyof typeof DASHBOARD_PAGES];

/**
 * Image Status for Carousel
 * Tracks loading state of carousel images
 */
export type ImageStatus = 'loading' | 'loaded' | 'error';

/**
 * Date Filter State
 * Manages date filtering functionality across dashboards
 */
export interface DateFilterState {
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    isDateFiltered: boolean;
    setIsDateFiltered: (filtered: boolean) => void;
    displayedPosts: CareerPost[];
    activeFilterYmd: string | null;
    postedDates: Date[];
}

/**
 * Posts by Date Response
 * Response from API when fetching posts for a specific date
 */
export interface PostsByDateResponse {
    posts: CareerPost[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    date: string;
    count: number;
}