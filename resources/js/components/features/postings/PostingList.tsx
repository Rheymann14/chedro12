/**
 * Posting List Component
 */

import React from 'react';
import { Posting } from '@/types/dashboard';
import { PostingCard } from './PostingCard';

interface PostingListProps {
    postings: Posting[];
    onReadMore: (postId: number, postName: string) => void;
    renderActions?: (posting: Posting) => React.ReactNode;
}

export const PostingList: React.FC<PostingListProps> = ({ postings, onReadMore, renderActions }) => {
    if (!postings || postings.length === 0) {
        return <p className="py-4 text-center text-gray-500">No postings available.</p>;
    }

    return (
        <div className="space-y-4">
            {postings.map((posting) => (
                <PostingCard key={posting.id} posting={posting} onReadMore={onReadMore} actions={renderActions?.(posting)} />
            ))}
        </div>
    );
};


