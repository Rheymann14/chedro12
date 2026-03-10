/**
 * Scroll Position Hook
 * 
 * Custom hook for preserving and restoring scroll position
 * Helps maintain user's scroll location during page loads and navigation
 * 
 * @fileoverview Scroll position management hook
 * @author Your Name
 * @created 2024
 */

import { useEffect, useRef } from 'react';

/**
 * Hook for preserving scroll position
 * 
 * @param key - Unique key for this scroll position (usually page name)
 * @param enabled - Whether to enable scroll position preservation (default: true)
 */
export const useScrollPosition = (key: string, enabled: boolean = true) => {
    const scrollPosition = useRef<number>(0);

    useEffect(() => {
        if (!enabled) return;

        // Restore scroll position on mount
        const savedPosition = sessionStorage.getItem(`scroll-${key}`);
        if (savedPosition) {
            const position = parseInt(savedPosition, 10);
            // Use multiple attempts to ensure DOM is ready and content is loaded
            const restoreScroll = () => {
                if (position > 0) {
                    window.scrollTo(0, position);
                }
            };
            
            // Try immediately
            restoreScroll();
            
            // Try again after a short delay to ensure content is loaded
            setTimeout(restoreScroll, 100);
            
            // Try again after content might be loaded (for skeleton loaders)
            setTimeout(restoreScroll, 1200);
        }

        // Save scroll position on unmount
        const handleBeforeUnload = () => {
            sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
        };

        const handleScroll = () => {
            scrollPosition.current = window.scrollY;
        };

        // Add event listeners
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup
        return () => {
            window.removeEventListener('scroll',handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            
            // Save current position
            sessionStorage.setItem(`scroll-${key}`, scrollPosition.current.toString());
        };
    }, [key, enabled]);

    // Function to manually save scroll position
    const saveScrollPosition = () => {
        if (enabled) {
            sessionStorage.setItem(`scroll-${key}`, window.scrollY.toString());
        }
    };

    // Function to clear saved scroll position
    const clearScrollPosition = () => {
        sessionStorage.removeItem(`scroll-${key}`);
    };

    return {
        saveScrollPosition,
        clearScrollPosition
    };
};




