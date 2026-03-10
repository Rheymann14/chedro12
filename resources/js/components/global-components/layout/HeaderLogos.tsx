/**
 * Header Logos Component
 * 
 * Displays CHED and BP logos in the dashboard header
 * Responsive component that adapts to different screen sizes
 * 
 * @fileoverview Header logo display for all dashboard pages
 * @author Your Name
 * @created 2024
 */

import React from 'react';

/**
 * Header Logos Component
 * 
 * Displays the CHED logo on the left and BP logo on the right
 * Responsive design that stacks vertically on mobile and horizontally on larger screens
 * 
 * @returns JSX element containing the header logos
 */
export const HeaderLogos: React.FC = () => {
    return (
        <div className="mx-w-5 container mb-2 flex min-h-[50px] items-center p-2 dark:bg-blend-color">
            <div className="flex w-full flex-col gap-4 sm:flex-row">
                {/* CHED Logo - Left side */}
                <div className="flex items-center justify-center sm:justify-start">
                    <img 
                        src="/chedlogo.png" 
                        alt="CHED Logo" 
                        className="h-20 w-auto sm:h-30" 
                    />
                </div>
                
                {/* BP Logo - Right side */}
                <div className="flex flex-1 items-center justify-center sm:justify-end">
                    <img 
                        src="/BP-LOGO-1.png" 
                        alt="BP Logo" 
                        className="h-20 w-auto sm:h-30" 
                    />
                </div>
            </div>
        </div>
    );
};
