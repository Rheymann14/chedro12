import AppFooter from '@/components/app-footer';
import { CareerPostList } from '@/components/features/career-posts';
import { HeaderLogos, PostSkeleton, TotalViewsCounter } from '@/components/global-components';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { useDateFilter } from '@/hooks/useDateFilter';
import AppLayout from '@/layouts/app-layout';
import { careerPost } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { CareerPost as CareerPostType } from '@/types/dashboard';
import { Head, Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { addDays } from 'date-fns';
import { BarChart3, Edit } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Career Post',
        href: careerPost().url,
    },
];

type CareerPost = {
    id: number;
    headline: string;
    description: string;
    posted_date: string;
    closing_date: string;
    career: string;
    Poster?: string[] | null;
    entry_type?: 'posting' | 'career_post';
};

type MetaData = {
    title: string;
    description: string;
    image: string;
    url: string;
};

export default function CareerPosting() {
    const page = usePage<{ posts: CareerPost[]; meta?: MetaData; allPostDates?: string[] } & SharedData>();
    const { props } = page;
    
    // Use page-specific meta if available, otherwise fall back to default
    const metaData = props.meta || {
        title: 'Career Posts | CHED Portal',
        description: 'Browse all career opportunities and job postings from the Commission on Higher Education',
        image: '/img/default-og-image.png',
        url: '',
    };
    const [posts, setPosts] = React.useState<CareerPost[]>(props.posts ?? []);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    const { auth } = page.props;
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({ page: 'career-post' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=career-post'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);

    // Sync local state with props when page loads
    React.useEffect(() => {
        setPosts(props.posts ?? []);
    }, [props.posts]);

    // Handle initial loading state
    React.useEffect(() => {
        if (posts.length > 0) {
            setIsInitialLoading(false);
        }
    }, [posts]);

    const [searchTerm, setSearchTerm] = React.useState('');
    const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
    
    // Date filter hook
    const { 
        displayedPosts: dateFilteredPosts, 
        postedDates: dateFilterPostedDates, 
        selectedDate, 
        handleDateSelect, 
        clearDateFilter, 
        isDateFiltered,
    } = useDateFilter(
        posts as any,
        props.allPostDates,
    );

    // Server-side search: debounce calls to backend to get only career posts
    React.useEffect(() => {
        const term = searchTerm.trim();
        const controller = new AbortController();
        const id = setTimeout(() => {
            const url = term ? `/careerPost/search?q=${encodeURIComponent(term)}` : `/careerPost/search`;
            axios
                .get(url, { signal: controller.signal })
                .then((res) => {
                    if (res.data && Array.isArray(res.data.posts)) {
                        setPosts(res.data.posts);
                    }
                })
                .catch(() => {});
        }, 300);
        return () => {
            controller.abort();
            clearTimeout(id);
        };
    }, [searchTerm]);

    const toggleExpand = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    // Use posted dates from date filter hook (which uses allPostDates from server)
    const postedDates = dateFilterPostedDates;
    
    // Combine date filter with search results
    const displayedPosts = React.useMemo(() => {
        // Start with date-filtered posts if date filter is active
        let basePosts = isDateFiltered ? (dateFilteredPosts as CareerPost[]) : posts;
        
        // Filter by entry_type (career posts only)
        basePosts = basePosts.filter((p) => p.entry_type !== 'posting');
        
        return basePosts;
    }, [posts, isDateFiltered, dateFilteredPosts]);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs} searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Head title={metaData.title}>
                    <meta name="description" content={metaData.description} />
                    
                    {/* Open Graph / Facebook */}
                    <meta property="og:type" content="website" />
                    <meta property="og:url" content={metaData.url} />
                    <meta property="og:title" content={metaData.title} />
                    <meta property="og:description" content={metaData.description} />
                    <meta property="og:image" content={metaData.image} />
                    
                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:url" content={metaData.url} />
                    <meta name="twitter:title" content={metaData.title} />
                    <meta name="twitter:description" content={metaData.description} />
                    <meta name="twitter:image" content={metaData.image} />
                </Head>

                {/**Header*/}
                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-between border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-2xl font-bold">CAREER POST</h1>
                        </header>
                        {auth?.user && (
                            <div className="flex gap-2">
                                {auth.user?.role === 'admin' ? (
                                    <Link href="/admin/careerPost">
                                        <Button variant="outline" size="sm">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Manage Posts
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href="/user/careerPost">
                                        <Button variant="outline" size="sm">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Manage Posts
                                        </Button>
                                    </Link>
                                )}
                                {auth.user?.role === 'admin' && (
                                    <Link href="/admin/users">
                                        <Button variant="outline" size="sm">
                                            User Management
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="mx-w-5 container mt-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Left Column */}
                            <div className="space-y-4 md:col-span-2">
                                {(searchTerm || isDateFiltered) && (
                                    <div className="mb-1 text-sm text-gray-600 ">
                                        {displayedPosts.length} of {posts.length} posts 
                                        {searchTerm && ` match "${searchTerm}"`}
                                        {isDateFiltered && selectedDate && ` on ${selectedDate.toLocaleDateString()}`}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 gap-4">
                                    {isInitialLoading ? (
                                        <PostSkeleton count={3} />
                                    ) : displayedPosts.length === 0 ? (
                                        <div className="rounded-md border p-4 text-sm text-gray-600">No posts found.</div>
                                    ) : (
                                        <CareerPostList
                                            posts={displayedPosts as unknown as CareerPostType[]}
                                            onReadMore={(postId, postName) => {
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
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Views */}
                                <div className="flex items-center text-sm text-gray-600">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Views: <span className="ml-1 font-semibold">{views}</span>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Transparency + FOI Logos */}
                                <Card>
                                    <CardContent className="flex items-center justify-center p-4">
                                        <img src="/img/transparency-seal.png" alt="Transparency Seal" className="mx-2 h-28" />
                                        <img src="/FIP.png" alt="/build/FIP.png" className="mx-2 h-31" />
                                    </CardContent>
                                </Card>
                                {/* Calendar */}
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center p-4">
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
                                        {isDateFiltered && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={clearDateFilter}
                                                className="mt-3 b"
                                            >
                                                Clear Date Filter
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* extra border line */}
                                <Card className="border-none shadow-none">
                                    <CardContent className="flex h-100 justify-center p-4"></CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
                <TotalViewsCounter />
            </AppLayout>
            <AppFooter />
        </>
    );
}
