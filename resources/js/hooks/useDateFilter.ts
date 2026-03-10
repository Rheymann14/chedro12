/**
 * Date Filter Hook
 * 
 * Custom hook for filtering career posts by date
 * Provides date selection, filtering logic, and calendar highlighting
 * 
 * @fileoverview Date filtering functionality for dashboard posts
 * @author Your Name
 * @created 2024
 */

import { useState, useMemo, useCallback } from 'react';
import { CareerPost, PostsByDateResponse } from '@/types/dashboard';
import { toYmdLocal, parsePostDateYmd } from '@/utils/dashboard';
import axios from 'axios';

/**
 * Hook for date filtering functionality
 * 
 * @param posts - Array of career posts to filter
 * @param allPostDates - Array of all post dates for calendar highlighting
 * @returns Object containing date filter state and filtered posts
 */
export const useDateFilter = (posts: CareerPost[], allPostDates?: string[]) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDateFiltered, setIsDateFiltered] = useState(false);
    const [dateFilteredPosts, setDateFilteredPosts] = useState<CareerPost[]>([]);
    const [dateFilteredPagination, setDateFilteredPagination] = useState<PostsByDateResponse['pagination'] | null>(null);
    const [currentDatePage, setCurrentDatePage] = useState<number>(1);
    const [isLoadingDatePosts, setIsLoadingDatePosts] = useState(false);

    /**
     * Filter posts based on selected date
     */
    const displayedPosts = useMemo(() => {
        if (!isDateFiltered || !selectedDate) return posts;
        
        // If we have date-filtered posts from API, use those
        if (dateFilteredPosts.length > 0) {
            return dateFilteredPosts;
        }
        
        // Fallback to local filtering
        const target = toYmdLocal(selectedDate);
        return posts.filter((post) => {
            const postDate = parsePostDateYmd(post.posted_date);
            return postDate === target;
        });
    }, [posts, isDateFiltered, selectedDate, dateFilteredPosts]);

    /**
     * Get active filter date in YYYY-MM-DD format
     */
    const activeFilterYmd = useMemo(() => {
        return isDateFiltered && selectedDate ? toYmdLocal(selectedDate) : null;
    }, [isDateFiltered, selectedDate]);

    /**
     * Extract dates with posts for calendar highlighting
     * Use allPostDates if available, otherwise fallback to current posts
     */
    const postedDates = useMemo(() => {
        const result: Date[] = [];
        
        // Use allPostDates if available for complete calendar highlighting
        if (allPostDates && allPostDates.length > 0) {
            allPostDates.forEach((dateStr) => {
                const ymd = parsePostDateYmd(dateStr);
                if (!ymd) return;
                
                const [year, month, day] = ymd.split('-').map((n) => parseInt(n, 10));
                result.push(new Date(year, month - 1, day));
            });
        } else {
            // Fallback to current posts
            posts.forEach((post) => {
                const ymd = parsePostDateYmd(post.posted_date);
                if (!ymd) return;
                
                const [year, month, day] = ymd.split('-').map((n) => parseInt(n, 10));
                result.push(new Date(year, month - 1, day));
            });
        }
        
        return result;
    }, [posts, allPostDates]);

    /**
     * Clear the current date filter
     */
    const clearDateFilter = () => {
        setIsDateFiltered(false);
        setSelectedDate(null);
        setDateFilteredPosts([]);
        setDateFilteredPagination(null);
        setCurrentDatePage(1);
    };

    /**
     * Fetch posts for a specific date from API
     */
    const fetchPostsByDate = useCallback(async (date: Date, page: number = 1) => {
        const target = toYmdLocal(date);
        setIsLoadingDatePosts(true);
        
        try {
            const response = await axios.get<PostsByDateResponse>('/api/posts/by-date', {
                params: { 
                    date: target,
                    page: page,
                    per_page: 6
                }
            });
            
            setDateFilteredPosts(response.data.posts);
            setDateFilteredPagination(response.data.pagination || null);
            setCurrentDatePage(page);
        } catch (error) {
            console.error('Error fetching posts by date:', error);
            setDateFilteredPosts([]);
            setDateFilteredPagination(null);
        } finally {
            setIsLoadingDatePosts(false);
        }
    }, []);

    /**
     * Handle page change for date-filtered posts
     */
    const handleDatePageChange = useCallback((page: number) => {
        if (selectedDate && isDateFiltered) {
            fetchPostsByDate(selectedDate, page);
        }
    }, [selectedDate, isDateFiltered, fetchPostsByDate]);

    /**
     * Handle date selection from calendar
     */
    const handleDateSelect = async (date: Date | undefined) => {
        if (!date) return;
        
        const target = toYmdLocal(date);
        const alreadySelected = selectedDate && toYmdLocal(selectedDate) === target && isDateFiltered;
        
        // Toggle filter if same date is clicked
        if (alreadySelected) {
            clearDateFilter();
            return;
        }
        
        // Check if there are posts for this date (using allPostDates if available)
        const hasPosts = allPostDates 
            ? allPostDates.some(dateStr => parsePostDateYmd(dateStr) === target)
            : posts.some((post) => {
                const postDate = parsePostDateYmd(post.posted_date);
                return postDate === target;
            });
        
        if (!hasPosts) return;
        
        setSelectedDate(date);
        setIsDateFiltered(true);
        
        // Fetch all posts for this date from API
        await fetchPostsByDate(date);
    };

    return {
        selectedDate,
        setSelectedDate,
        isDateFiltered,
        setIsDateFiltered,
        displayedPosts,
        activeFilterYmd,
        postedDates,
        clearDateFilter,
        handleDateSelect,
        isLoadingDatePosts,
        dateFilteredPagination,
        handleDatePageChange,
        currentDatePage,
    };
};
