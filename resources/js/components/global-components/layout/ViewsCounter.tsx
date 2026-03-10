/**
 * Views Counter Component
 * 
 * Displays the current view count for a page
 * Reusable component used across all dashboard pages
 * 
 * @fileoverview Views counter display component
 * @author Your Name
 * @created 2024
 */

import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * Props for ViewsCounter component
 */
interface ViewsCounterProps {
    /** Current view count to display */
    views: number;
    /** Optional custom styling class */
    className?: string;
    /** Optional label text (defaults to "Views") */
    label?: string;
}

/**
 * Views Counter Component
 * 
 * Displays the current view count with an icon
 * Used in multiple locations across dashboard pages
 * 
 * @param views - Current view count
 * @param className - Optional CSS classes
 * @param label - Optional label text (defaults to "Views")
 * @returns JSX element displaying the view count
 */
export const ViewsCounter: React.FC<ViewsCounterProps> = ({ 
    views, 
    className = "flex items-center justify-center text-xs text-gray-600 sm:text-sm",
    label = "Views"
}) => {
    return (
        <div className={className}>
            <BarChart3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            {label}: <span className="ml-1 font-semibold">{views}</span>
        </div>
    );
};
