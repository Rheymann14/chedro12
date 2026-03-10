/**
 * Post Skeleton Loader Component
 * 
 * Reusable skeleton component for loading career posts
 * Provides consistent loading animation across all pages
 * 
 * @fileoverview Global skeleton loader component for posts
 * @author Your Name
 * @created 2024
 */

import React from 'react';

/**
 * Props for PostSkeleton component
 */
interface PostSkeletonProps {
    /** Number of skeleton items to display */
    count?: number;
    /** Optional custom styling class */
    className?: string;
}

/**
 * Post Skeleton Loader Component
 * 
 * Displays animated skeleton placeholders for career posts
 * Used during loading states for consistent UX
 * 
 * @param count - Number of skeleton items to display (default: 3)
 * @param className - Optional CSS classes
 * @returns JSX element with skeleton loading animation
 */
export const PostSkeleton: React.FC<PostSkeletonProps> = ({ 
    count = 3, 
    className = "space-y-4" 
}) => {
    return (
        <div className={className}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="animate-pulse">
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <div className="space-y-3">
                            {/* Title skeleton */}
                            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                            
                            {/* Content skeleton */}
                            <div className="space-y-2">
                                <div className="h-3 w-full rounded bg-gray-200"></div>
                                <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                                <div className="h-3 w-4/6 rounded bg-gray-200"></div>
                            </div>
                            
                            {/* Footer skeleton */}
                            <div className="flex items-center justify-between pt-2">
                                <div className="h-3 w-20 rounded bg-gray-200"></div>
                                <div className="h-6 w-16 rounded bg-gray-200"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
