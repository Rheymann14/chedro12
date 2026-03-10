/**
 * Posting Card Component
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Posting } from '@/types/dashboard';
import { getYouTubeThumbnailFromHtml, sanitizeHtmlForDisplay } from '@/utils/dashboard';

interface PostingCardProps {
    posting: Posting;
    onReadMore: (postId: number, postName: string) => void;
    actions?: React.ReactNode;
}

export const PostingCard: React.FC<PostingCardProps> = ({ posting, onReadMore, actions }) => {
    const fallbackThumb = getYouTubeThumbnailFromHtml(posting.description);
    return (
        <div className="flex flex-col gap-4 rounded-xl bg-white p-4 sm:flex-row sm:gap-6">
            <div className="group relative flex-shrink-0 overflow-hidden rounded-lg">
                {(!posting.Poster || posting.Poster.length === 0) && posting.Video ? (
                    <div className="relative">
                        <img
                            src={fallbackThumb || '/img/ched-banner.png'}
                            alt="Video thumbnail"
                            className="h-auto w-full max-w-sm rounded-lg object-cover sm:w-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="rounded-full bg-black/60 p-3">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-6 w-6">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ) : posting.Poster && posting.Poster.length > 0 ? (
                    <img
                        src={`/storage/${posting.Poster[0]}`}
                        alt={posting.headline}
                        className="h-auto w-full max-w-sm rounded-lg object-contain transition-transform duration-300 ease-out group-hover:scale-105 sm:w-80"
                    />
                ) : fallbackThumb ? (
                    <img
                        src={fallbackThumb}
                        alt="YouTube thumbnail"
                        className="h-45 w-80 rounded-lg object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-lg bg-gray-200 sm:h-40 sm:w-60">
                        <span className="text-xs text-gray-400">No Image</span>
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col">
                <h3
                    className="mb-2 cursor-pointer text-xl font-extrabold tracking-tight text-blue-700 uppercase transition-colors hover:text-blue-800 hover:underline sm:text-2xl md:text-3xl"
                    onClick={() => onReadMore(posting.id, posting.headline)}
                >
                    {posting.headline}
                </h3>
                <div className="mb-4 text-sm leading-relaxed text-gray-700 desc-html sm:text-[15px]">
                    <div
                        className="line-clamp-3 text-justify prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtmlForDisplay(posting.description) }}
                    />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                    <Button
                        onClick={() => onReadMore(posting.id, posting.headline)}
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 sm:px-5"
                        size="sm"
                    >
                        Read More
                    </Button>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            </div>
        </div>
    );
};


