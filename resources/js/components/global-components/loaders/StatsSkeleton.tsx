/**
 * Statistics Skeleton Loader Component
 * 
 * Reusable skeleton component for loading statistics
 * Provides consistent loading animation for data metrics
 * 
 * @fileoverview Global skeleton loader component for statistics
 * @author Your Name
 * @created 2024
 */

import React from 'react';

/**
 * Props for StatsSkeleton component
 */
interface StatsSkeletonProps {
    /** Number of skeleton items to display */
    count?: number;
    /** Optional custom styling class */
    className?: string;
}

/**
 * Statistics Skeleton Loader Component
 * 
 * Displays animated skeleton placeholders for statistics
 * Used during loading states for data metrics
 * 
 * @param count - Number of skeleton items to display (default: 4)
 * @param className - Optional CSS classes
 * @returns JSX element with skeleton loading animation
 */
export const StatsSkeleton: React.FC<StatsSkeletonProps> = ({ 
    count = 4, 
    className = "space-y-2 text-sm" 
}) => {
    return (
        <div className={className}>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center animate-pulse">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                    <div className="ml-1 h-4 w-8 rounded bg-gray-200"></div>
                </div>
            ))}
        </div>
    );
};
