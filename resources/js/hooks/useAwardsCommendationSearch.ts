/**
 * Awards Commendation Search Hook
 *
 * Custom hook for searching awards commendations across dedicated endpoints
 * Mirrors usePostingSearch for consistent behavior
 */

import { useEffect, useState } from 'react';
import { Posting } from '@/types/dashboard';
import { SEARCH_CONFIG, API_ENDPOINTS } from '@/constants/dashboard';

export const useAwardsCommendationSearch = (searchTerm: string) => {
    const [searchResults, setSearchResults] = useState<Posting[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isSearching = searchTerm.trim().length > 0;

    useEffect(() => {
        const term = searchTerm.trim();
        if (!term) {
            setSearchResults(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            fetch(`${API_ENDPOINTS.AWARDS_COMMENDATION_SEARCH}?q=${encodeURIComponent(term)}`, {
                signal: controller.signal,
            })
                .then((r) => r.json())
                .then((data) => {
                    setSearchResults((data.posts || []) as Posting[]);
                    setIsLoading(false);
                })
                .catch(() => {
                    setSearchResults([]);
                    setIsLoading(false);
                });
        }, SEARCH_CONFIG.debounceDelay);

        return () => {
            controller.abort();
            clearTimeout(timeoutId);
        };
    }, [searchTerm]);

    return { searchResults, isSearching, isLoading };
};


