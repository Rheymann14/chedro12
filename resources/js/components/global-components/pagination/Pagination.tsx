/**
 * Pagination Component
 * 
 * Reusable pagination component for career posts
 * Handles page navigation with previous/next buttons and page numbers
 * 
 * @fileoverview Pagination component for dashboard lists
 * @author Your Name
 * @created 2024
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { PaginatedPosts } from '@/types/dashboard';

/**
 * Props for Pagination component
 */
interface PaginationProps {
    /** Pagination data from API response */
    postsData: PaginatedPosts;
    /** Callback function when page changes */
    onPageChange: (page: number) => void;
    /** Whether search is active (hides pagination during search) */
    isSearching: boolean;
}

/**
 * Pagination Component
 * 
 * Displays pagination controls with page numbers and navigation buttons
 * Hidden during search operations to avoid confusion
 * 
 * @param postsData - Pagination metadata from API
 * @param onPageChange - Callback function for page changes
 * @param isSearching - Whether search is currently active
 * @returns JSX element containing pagination controls or null
 */
export const Pagination: React.FC<PaginationProps> = ({ 
    postsData, 
    onPageChange, 
    isSearching 
}) => {
    // Don't show pagination during search or if only one page
    if (isSearching || !postsData || postsData.last_page <= 1) {
        return null;
    }

    return (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
            {/* Results Info */}
            <div className="text-xs text-gray-700 sm:text-sm">
                Showing {postsData.from} to {postsData.to} of {postsData.total} results
            </div>
            
            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:space-x-2 sm:justify-end">
                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={postsData.current_page === 1}
                    onClick={() => onPageChange(postsData.current_page - 1)}
                >
                    Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                    {postsData.links.map((link, index) => {
                        // Skip previous/next labels (handled by buttons)
                        if (link.label === '&laquo; Previous' || link.label === 'Next &raquo;') {
                            return null;
                        }

                        const pageNumber = link.label;
                        const isActive = link.active;
                        const isNumeric = !isNaN(Number(pageNumber));

                        // Skip non-numeric labels except ellipsis
                        if (!isNumeric && pageNumber !== '...') {
                            return null;
                        }

                        return (
                            <Button
                                key={index}
                                variant={isActive ? "default" : "outline"}
                                size="sm"
                                className={isActive ? "bg-blue-600 text-white" : ""}
                                disabled={!link.url}
                                onClick={() => {
                                    if (link.url) {
                                        const url = new URL(link.url, window.location.origin);
                                        const page = url.searchParams.get('page');
                                        if (page) {
                                            onPageChange(Number(page));
                                        }
                                    }
                                }}
                            >
                                {pageNumber}
                            </Button>
                        );
                    })}
                </div>

                {/* Next Button */}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={postsData.current_page === postsData.last_page}
                    onClick={() => onPageChange(postsData.current_page + 1)}
                >
                    Next
                </Button>
            </div>
        </div>
    );
};
