/**
 * Unified Dashboard Page
 *
 * Main dashboard page for all users (public, authenticated, admin)
 * Displays career posts, carousel, and role-based navigation
 * Uses shared components and hooks for consistency
 *
 * @fileoverview Unified dashboard page with career posts and role-based features
 * @author Your Name
 * @created 2024
 */

import AppFooter from '@/components/app-footer';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import Autoplay from 'embla-carousel-autoplay';
import * as React from 'react';
import { useState } from 'react';

// Shared components and hooks
import { CareerPostCard } from '@/components/features/career-posts';
import { HeaderLogos, PostSkeleton, ViewsCounter } from '@/components/global-components';
import { AdminNavigation } from '@/components/global-components/admin';
import { TotalViewsCounter } from '@/components/global-components/layout';
import { Pagination } from '@/components/global-components/pagination';
import { CAROUSEL_CONFIG } from '@/constants/dashboard';
import { useCareerPostSearch } from '@/hooks/useCareerPostSearch';
import { useDateFilter } from '@/hooks/useDateFilter';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { useTotalViews, useViews } from '@/hooks/useViews';
import { DASHBOARD_PAGES, ImageStatus, PaginatedPosts, User } from '@/types/dashboard';
import { getCarouselImages, handleImageError, handleImageLoad, initializeImageStatus } from '@/utils/dashboard';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    const page = usePage<{ posts: PaginatedPosts; user?: User; allPostDates: string[] } & SharedData>();
    const { posts: postsData, user, auth, allPostDates } = page.props;
    const posts = postsData?.data ?? [];
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [imageStatus, setImageStatus] = useState<Record<string, ImageStatus>>({});
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Determine dashboard page type based on user role
    const dashboardPageType = React.useMemo(() => {
        if (!user) return DASHBOARD_PAGES.PUBLIC;
        if (user.role === 'admin') return DASHBOARD_PAGES.ADMIN;
        return DASHBOARD_PAGES.USER;
    }, [user]);

    // Custom hooks for shared functionality
    const totalViews = useTotalViews();
    const pageViews = useViews(dashboardPageType);
    const { searchResults, isSearching, isLoading } = useCareerPostSearch(searchTerm);
    const { 
        displayedPosts, 
        activeFilterYmd, 
        postedDates, 
        selectedDate, 
        handleDateSelect, 
        clearDateFilter, 
        isLoadingDatePosts,
        dateFilteredPagination,
        handleDatePageChange,
        isDateFiltered,
    } = useDateFilter(
        isSearching ? (searchResults ?? []) : posts,
        allPostDates,
    );

    // Carousel configuration
    const autoplay = React.useRef(
        Autoplay({
            delay: CAROUSEL_CONFIG.delay,
            stopOnInteraction: CAROUSEL_CONFIG.stopOnInteraction,
        }),
    );

    // Get carousel images
    const carouselImages = React.useMemo(() => getCarouselImages(posts), [posts]);

    // Initialize image status
    React.useEffect(() => {
        const initStatus = initializeImageStatus(carouselImages, imageStatus);
        setImageStatus(initStatus);
    }, [carouselImages]);

    // Handle initial loading state
    React.useEffect(() => {
        if (posts.length > 0) {
            setIsInitialLoading(false);
        }
    }, [posts]);

    // Scroll position preservation - use dynamic key based on user type
    useScrollPosition(dashboardPageType);

    // Event handlers
    const handleReadMore = (postId: number, postName: string) => {
        // 1️⃣ Remove ALL non-ASCII characters (like bold Unicode letters)
        const asciiName = postName.replace(/[^\x00-\x7F]/g, '');
        
        // 2️⃣ Convert to lowercase, clean symbols and extra spaces
        const slug = asciiName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // keep only safe chars
            .replace(/\s+/g, '-')          // spaces -> dashes
            .slice(0, 60);                 // limit length
        
        // 3️⃣ Safe URL (optional, but slug is already clean)
        router.visit(`/post/${postId}?p=${slug}`);
    };

    const handlePageChange = (page: number) => {
        // If date is filtered, use date pagination
        if (isDateFiltered && dateFilteredPagination) {
            handleDatePageChange(page);
            return;
        }
        
        // Otherwise use regular pagination
        router.get(
            dashboard().url,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs} searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Head title="Chedro12" />

                {/* Header Logos */}
                <HeaderLogos />
                {/* Admin Navigation for all authenticated users */}
                {user && <AdminNavigation user={user} />}

                <div className="mb-6 px-4 sm:px-6">
                    <div className="mx-auto w-full max-w-6xl">
                        {/* Carousel from shadcn */}
                        <Carousel
                            className="w-full"
                            plugins={[autoplay.current]}
                            onMouseEnter={autoplay.current.stop}
                            onMouseLeave={autoplay.current.reset}
                        >
                            <CarouselContent>
                                {carouselImages.length === 0 ? (
                                    <CarouselItem>
                                        <div className="p-1">
                                            <Card>
                                                <CardContent className="flex min-h-[180px] items-center justify-center p-4 sm:min-h-[220px] md:min-h-[260px]">
                                                    <p className="text-gray-500">No images available</p>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ) : (
                                    carouselImages.map((img, index) => {
                                        const key = `${img}-${index}`;
                                        const status = imageStatus[key] ?? 'loading';
                                        return (
                                            <CarouselItem key={key}>
                                                <div className="p-1">
                                                    <Card className="relative overflow-hidden rounded-xl">
                                                        {/* Background image with blur */}
                                                        <div
                                                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                                            style={{
                                                                backgroundImage: `url(${img})`,
                                                                filter: 'blur(8px)',
                                                                transform: 'scale(1.1)',
                                                            }}
                                                        />
                                                        {/* Blur overlay */}
                                                        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />

                                                        <CardContent className="relative flex min-h-[180px] items-center justify-center p-3 sm:min-h-[240px] sm:p-4 md:min-h-[320px] lg:min-h-[400px]">
                                                            {status === 'error' ? (
                                                                <div className="flex h-40 w-60 items-center justify-center rounded-lg bg-gray-200">
                                                                    <span className="text-xs text-gray-500">Image failed to load</span>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {status !== 'loaded' && (
                                                                        <div className="absolute inset-0 z-10 flex items-center justify-center">
                                                                            <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                                                                        </div>
                                                                    )}
                                                                    <img
                                                                        src={img}
                                                                        alt={`Posting ${index + 1}`}
                                                                        className="h-auto max-h-[42vh] w-auto max-w-full rounded shadow-lg object-contain sm:max-h-[50vh] md:max-h-[56vh]"
                                                                        onLoad={() => handleImageLoad(key, setImageStatus)}
                                                                        onError={() => handleImageError(key, setImageStatus)}
                                                                    />
                                                                </>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </CarouselItem>
                                        );
                                    })
                                )}
                            </CarouselContent>
                            <CarouselPrevious className="left-3 top-1/2 z-20 -translate-y-1/2 bg-white/90 shadow-sm hover:bg-white" />
                            <CarouselNext className="right-3 top-1/2 z-20 -translate-y-1/2 bg-white/90 shadow-sm hover:bg-white" />
                        </Carousel>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-3">
                    {/* Left Column */}

                    <div className="space-y-4 lg:col-span-2">
                        {/* Career Posts Section */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    {activeFilterYmd && (
                                        <div className="flex items-center justify-between rounded-md bg-blue-50 p-3 text-sm">
                                            <span className="text-blue-700">Showing posts for {activeFilterYmd}</span>
                                            <button type="button" className="text-blue-700 underline hover:text-blue-800" onClick={clearDateFilter}>
                                                Clear filter
                                            </button>
                                        </div>
                                    )}
                                    {/* Career Posts List */}
                                    {isLoading || isInitialLoading || isLoadingDatePosts ? (
                                        <PostSkeleton count={3} />
                                    ) : displayedPosts.length === 0 ? (
                                        <div className="py-4 text-center text-gray-500">
                                            {isSearching ? <p>No results found for "{searchTerm}"</p> : <p>No career posts available.</p>}
                                        </div>
                                    ) : (
                                        displayedPosts.map((post) => <CareerPostCard key={post.id} post={post} onReadMore={handleReadMore} />)
                                    )}
                                </div>

                                {/* Pagination */}
                                <Pagination 
                                    postsData={
                                        isDateFiltered && dateFilteredPagination
                                            ? {
                                                data: displayedPosts as any,
                                                current_page: dateFilteredPagination.current_page,
                                                last_page: dateFilteredPagination.last_page,
                                                per_page: dateFilteredPagination.per_page,
                                                total: dateFilteredPagination.total,
                                                from: dateFilteredPagination.from ?? 0,
                                                to: dateFilteredPagination.to ?? 0,
                                                links: dateFilteredPagination.links.map(link => ({
                                                    url: link.url,
                                                    label: link.label,
                                                    active: link.active,
                                                })),
                                            }
                                            : postsData
                                    } 
                                    onPageChange={handlePageChange} 
                                    isSearching={isSearching} 
                                />
                            </CardContent>
                        </Card>

                        {/* Views Counter - Show both total and page views */}
                        <div className="flex flex-col items-start justify-start gap-2">
                            <ViewsCounter views={pageViews} label="Page Views" />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Transparency + FOI Logos */}
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center p-4 sm:flex-row">
                                <img src="/img/transparency-seal.png" alt="Transparency Seal" className="mx-2 h-20 w-auto sm:h-28" />
                                <img src="/FIP.png" alt="FIP Logo" className="mx-2 h-20 w-auto sm:h-31" />
                            </CardContent>
                        </Card>

                        {/* Calendar */}
                        <Card>
                            <CardContent className="flex justify-center p-4">
                                <div className="w-full max-w-xs">
                                    <Calendar
                                        mode="single"
                                        className="mx-auto w-full"
                                        selected={selectedDate || undefined}
                                        onSelect={handleDateSelect}
                                        modifiers={{
                                            posted: postedDates,
                                        }}
                                        modifiersStyles={{
                                            posted: {
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                borderRadius: '8px',
                                            },
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Post Information Card */}

                        {/* Extra space */}
                        <Card className="border-none shadow-none">
                            <CardContent className="flex h-20 justify-center p-4 sm:h-100"></CardContent>
                        </Card>
                    </div>
                </div>
                {/* Bottom Views Counter */}
                <TotalViewsCounter />
            </AppLayout>
            <AppFooter />
        </>
    );
}
