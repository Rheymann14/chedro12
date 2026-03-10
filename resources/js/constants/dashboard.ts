/**
 * Dashboard Constants
 * 
 * Configuration constants for dashboard functionality
 * Centralizes magic numbers and configuration values
 * 
 * @fileoverview Dashboard configuration and constants
 * @author Your Name
 * @created 2024
 */

/**
 * Carousel Configuration
 * Settings for the image carousel component
 */
export const CAROUSEL_CONFIG = {
    delay: 3000,
    stopOnInteraction: true,
} as const;

/**
 * Search Configuration
 * Settings for search functionality
 */
export const SEARCH_CONFIG = {
    debounceDelay: 300,
} as const;

/**
 * Dashboard Page Identifiers
 * Used for views tracking and analytics
 */
export const DASHBOARD_PAGES = {
    PUBLIC: 'dashboard',
    USER: 'user-dashboard',
    ADMIN: 'admin-dashboard',
} as const;

/**
 * API Endpoints
 * Centralized API endpoint definitions
 */
export const API_ENDPOINTS = {
    VIEWS_TRACK: '/views/track',
    VIEWS_COUNT: '/views/count',
    POSTINGS_SEARCH: '/postings/search',
    CAREER_POST_SEARCH: '/careerPost/search',
    AWARDS_COMMENDATION_SEARCH: '/awardsCommendation/search',
} as const;

/**
 * Image Configuration
 * Settings for image handling and display
 */
export const IMAGE_CONFIG = {
    defaultHeight: 'h-30',
    carouselHeight: 'h-1000px',
    maxWidth: 'w-80',
} as const;
