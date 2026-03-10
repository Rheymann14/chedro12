/**
 * Total Views Counter Component
 * 
 * Displays the total view count across all pages
 * Uses the useTotalViews hook internally to fetch aggregated data
 * 
 * @fileoverview Total views counter display component
 * @author Your Name
 * @created 2024
 */

import React from 'react';
import { UsersRound } from 'lucide-react';
import { useTotalViews } from '@/hooks/useViews';

/**
 * Props for TotalViewsCounter component
 */
interface TotalViewsCounterProps {
    /** Optional custom styling class */
    className?: string;
    /** Optional custom text prefix */
    textPrefix?: string;
}

/**
 * Total Views Counter Component
 * 
 * Displays the total view count across all tracked pages with an icon
 * Automatically fetches and displays aggregated view data
 * 
 * @param className - Optional CSS classes
 * @param textPrefix - Optional text prefix (defaults to "Total Views")
 * @returns JSX element displaying the total view count
 */
export const TotalViewsCounter: React.FC<TotalViewsCounterProps> = ({ 
    className = "flex items-center justify-center text-xs text-gray-600 sm:text-sm",
    textPrefix = "Total Views"
}) => {
    const totalViews = useTotalViews();

    return (
        <div className={className}>
            <UsersRound className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {textPrefix}: <span className="ml-1 font-semibold">{totalViews}</span>
        </div>
    );
};
