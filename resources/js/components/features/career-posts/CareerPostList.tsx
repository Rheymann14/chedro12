/**
 * Career Post List Component
 */

import React from 'react';
import { CareerPost } from '@/types/dashboard';
import { CareerPostCard } from './CareerPostCard';

interface CareerPostListProps {
    posts: CareerPost[];
    onReadMore: (postId: number, postName: string) => void;
    renderActions?: (post: CareerPost) => React.ReactNode;
}

export const CareerPostList: React.FC<CareerPostListProps> = ({ posts, onReadMore, renderActions }) => {
    if (!posts || posts.length === 0) {
        return <p className="py-4 text-center text-gray-500">No career posts available.</p>;
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <CareerPostCard key={post.id} post={post} onReadMore={(id, name) => onReadMore(id, name)} actions={renderActions?.(post)} />
            ))}
        </div>
    );
};


