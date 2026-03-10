/**
 * Career Post Search Hook
 * 
 * Custom hook for searching career posts across multiple endpoints
 * Provides debounced search functionality with loading states
 * 
 * @fileoverview Search functionality for career posts
 * @author Your Name
 * @created 2024
 */

import { useEffect, useState } from 'react';
import { CareerPost } from '@/types/dashboard';
import { SEARCH_CONFIG, API_ENDPOINTS } from '@/constants/dashboard';

/**
 * Hook for searching career posts with debouncing
 * 
 * @param searchTerm - Search query string
 * @returns Object containing search results and loading state
 */
export const useCareerPostSearch = (searchTerm: string) => {
    const [searchResults, setSearchResults] = useState<CareerPost[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isSearching = searchTerm.trim().length > 0;

    useEffect(() => {
        const term = searchTerm.trim();
        
        // Clear results if no search term
        if (!term) {
            setSearchResults(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const controller = new AbortController();
        
        // Debounce the search request
        const timeoutId = setTimeout(() => {
            Promise.all([
                // Search in postings
                fetch(`${API_ENDPOINTS.POSTINGS_SEARCH}?q=${encodeURIComponent(term)}`, { 
                    signal: controller.signal 
                })
                    .then((response) => response.json())
                    .catch(() => ({ posts: [] })),
                
                // Search in career posts
                fetch(`${API_ENDPOINTS.CAREER_POST_SEARCH}?q=${encodeURIComponent(term)}`, { 
                    signal: controller.signal 
                })
                    .then((response) => response.json())
                    .catch(() => ({ posts: [] })),
            ])
                .then(([postingsRes, careerRes]) => {
                    // Combine results from both endpoints
                    const combined = [
                        ...(postingsRes.posts || []), 
                        ...(careerRes.posts || [])
                    ];
                    
                    // Remove duplicates by ID
                    const uniqueById = Array.from(
                        new Map(combined.map((post: any) => [post.id, post])).values()
                    );
                    
                    setSearchResults(uniqueById);
                    setIsLoading(false);
                })
                .catch(() => {
                    setSearchResults([]);
                    setIsLoading(false);
                });
        }, SEARCH_CONFIG.debounceDelay);

        // Cleanup function
        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    return { 
        searchResults, 
        isSearching, 
        isLoading 
    };
};
