/**
 * Views Tracking Hook
 * 
 * Custom hook for tracking page views across all dashboards
 * Handles both tracking and counting views for analytics
 * 
 * @fileoverview Views tracking functionality for dashboard pages
 * @author Your Name
 * @created 2024
 */

import { useEffect, useState } from 'react';
import { getCsrfToken } from '@/utils/dashboard';
import { API_ENDPOINTS } from '@/constants/dashboard';

/**
 * Hook for tracking and retrieving page views
 * 
 * @param pageName - Name of the page to track (e.g., 'dashboard', 'admin-dashboard')
 * @returns Current view count for the page
 */
export const useViews = (pageName: string): number => {
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        // Track the page view
        fetch(API_ENDPOINTS.VIEWS_TRACK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: pageName }),
            credentials: 'same-origin',
        })
            // Then fetch the current count
            .then(() => fetch(`${API_ENDPOINTS.VIEWS_COUNT}?page=${pageName}`))
            .then((response) => response.json())
            .then((data) => setViews(data.count ?? 0))
            .catch(() => {
                // Silently handle errors - views are not critical functionality
                console.warn(`Failed to track views for page: ${pageName}`);
            });
    }, [pageName]);

    return views;
};

/**
 * Hook to retrieve total views across all tracked pages
 * Aggregates counts for known dashboard pages
 */
export const useTotalViews = (): number => {
    const [total, setTotal] = useState<number>(0);

    useEffect(() => {
        fetch(API_ENDPOINTS.VIEWS_COUNT)
            .then((res) => res.json())
            .then((data) => setTotal(typeof data.count === 'number' ? data.count : 0))
            .catch(() => setTotal(0));
    }, []);

    return total;
};
