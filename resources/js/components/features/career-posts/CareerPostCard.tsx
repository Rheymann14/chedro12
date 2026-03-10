/**
 * Career Post Card Component
 *
 * Individual career post display card
 * Shows post image, headline, description, and read more button
 *
 * @fileoverview Career post card component for dashboard
 * @author Your Name
 * @created 2024
 */

import { Button } from '@/components/ui/button';
import { CareerPost } from '@/types/dashboard';
import { getYouTubeThumbnailFromHtml, sanitizeHtmlForDisplay } from '@/utils/dashboard';
import React, { useMemo } from 'react';

/**
 * Props for CareerPostCard component
 */
interface CareerPostCardProps {
    /** Career post data to display */
    post: CareerPost;
    /** Callback function when read more is clicked */
    onReadMore: (postId: number, postName: string) => void;
    
    /** Optional actions (e.g., Edit/Delete) rendered on the right */
    actions?: React.ReactNode;
}

/**
 * Career Post Card Component
 *
 * Displays a single career post with image, headline, description, and action button
 * Responsive design that stacks vertically on mobile and horizontally on larger screens
 *
 * @param post - Career post data
 * @param onReadMore - Callback function for read more action
 * @returns JSX element containing the career post card
 */
export const CareerPostCard: React.FC<CareerPostCardProps> = ({ post, onReadMore, actions }) => {
    const fallbackThumb = useMemo(() => getYouTubeThumbnailFromHtml(post.description), [post.description]);
    const [imageError, setImageError] = React.useState(false);
    
    return (
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 sm:flex-row sm:gap-6">
            {/* Post Media - Left side on desktop, top on mobile */}
            <div className="group relative flex-shrink-0 overflow-hidden rounded-lg">
                {(!post.Poster || post.Poster.length === 0) && post.Video ? (
                    <div className="relative">
                        <img
                            src={fallbackThumb || '/img/ched-banner.png'}
                            alt="Video thumbnail"
                            className="h-auto w-full max-w-sm rounded-lg object-cover sm:w-80"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/img/ched-banner.png';
                            }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-black/60 p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ) : post.Poster && post.Poster.length > 0 && !imageError ? (
                    <img
                        src={`/storage/${post.Poster[0]}`}
                        alt={post.headline}
                        className="h-auto w-full max-w-sm rounded-lg object-contain transition-transform duration-300 ease-out group-hover:scale-105 sm:w-80"
                        style={{ willChange: 'transform' }}
                        onError={() => setImageError(true)}
                    />
                ) : fallbackThumb ? (
                    <img
                        src={fallbackThumb}
                        alt="YouTube thumbnail"
                        className="h-44 w-80 rounded-lg object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                        style={{ willChange: 'transform' }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/img/ched-banner.png';
                        }}
                    />
                ) : (
                    <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-lg bg-gray-200 sm:h-40 sm:w-60">
                        <span className="text-xs text-gray-400">No Image</span>
                    </div>
                )}
            </div>

            {/* Post Content - Right side on desktop, bottom on mobile */}
            <div className="flex min-w-0 flex-1 flex-col">
                {/* Post Headline */}
                <h3
                    className="mb-2 cursor-pointer text-xl font-extrabold tracking-tight text-blue-700 uppercase transition-colors hover:text-blue-800 hover:underline sm:text-2xl md:text-3xl"
                    onClick={() => onReadMore(post.id, post.headline)}
                >
                    {post.headline}
                </h3>

                {/* Post Description */}
                <div className="desc-html mb-4 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
                    <div
                        className="prose prose-sm line-clamp-3 max-w-none text-justify"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtmlForDisplay(post.description) }}
                    />
                </div>

                {/* Read More Button */}
                <div className="mt-2 flex items-center justify-between gap-2">
                    <Button
                        onClick={() => onReadMore(post.id, post.headline)}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 sm:px-5"
                        size="sm">
                        Read More
                    </Button>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </div>
        </div>
    );
};
