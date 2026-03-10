import AppFooter from '@/components/app-footer';
import { PostingList } from '@/components/features/postings';
import { HeaderLogos, PostSkeleton, TotalViewsCounter } from '@/components/global-components';
import { Pagination } from '@/components/global-components/pagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAwardsCommendationSearch } from '@/hooks/useAwardsCommendationSearch';
import { useDateFilter } from '@/hooks/useDateFilter';
import AppLayout from '@/layouts/app-layout';
import { awardsCommendation } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Posting, PaginatedPostings } from '@/types/dashboard';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { BarChart3, CheckCircle, Edit } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { UserPostingForm } from '../user/postings/components/UserPostingForm';
const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Awards & Commendations',
        href: awardsCommendation().url,
    },
];

type CareerPost = {
    id: number;
    headline: string;
    description: string;
    posted_date: string;
    closing_date: string;
    career: string | null;
    Poster?: string[] | null;
    entry_type?: 'posting' | 'career_post' | 'awards_commendation';
};

type MetaData = {
    title: string;
    description: string;
    image: string;
    url: string;
};

export default function AwardsCommendation() {
    const page = usePage<{ posts: CareerPost[] | PaginatedPostings; meta?: MetaData; allPostDates?: string[] } & SharedData>();
    const { props } = page;
    const { auth } = page.props;
    
    // Handle both array and paginated responses
    const postsData = props.posts;
    const postsArray = Array.isArray(postsData) ? postsData : (postsData as PaginatedPostings)?.data || [];
    
    // Use page-specific meta if available, otherwise fall back to default
    const metaData = props.meta || {
        title: 'Awards & Commendations | CHED Portal',
        description: 'Browse all awards and commendations from the Commission on Higher Education',
        image: '/img/default-og-image.png',
        url: '',
    };
    const [posts, setPosts] = React.useState<CareerPost[]>(postsArray as CareerPost[]);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({ page: 'awards-commendation' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=awards-commendation'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);

    // Sync local state with props when page loads
    React.useEffect(() => {
        const newPosts = Array.isArray(postsData) ? postsData : (postsData as PaginatedPostings)?.data || [];
        setPosts(newPosts as CareerPost[]);
    }, [postsData]);

    // Handle initial loading state
    React.useEffect(() => {
        if (posts.length > 0) {
            setIsInitialLoading(false);
        }
    }, [posts]);

    // Check if user can manage posts (authenticated users can manage)
    const canManage = !!auth?.user;

    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<CareerPost | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [postToDelete, setPostToDelete] = React.useState<CareerPost | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const { searchResults, isSearching, isLoading } = useAwardsCommendationSearch(searchTerm);
    const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
    const [existingImages, setExistingImages] = React.useState<string[]>([]);
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const perPage = 6;
    
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

    const showSuccessMessage = (message: string) => {
        setSuccessMessage(message);
        setErrorMessage(null);
        setTimeout(() => setSuccessMessage(null), 5000);
    };

    const showErrorMessage = (message: string) => {
        setErrorMessage(message);
        setSuccessMessage(null);
        setTimeout(() => setErrorMessage(null), 5000);
    };

    const filteredPosts = React.useMemo(() => {
        // Start with date-filtered posts if date filter is active
        let basePosts = isDateFiltered ? (dateFilteredPosts as CareerPost[]) : posts;
        
        // Filter by entry_type (awards commendations only)
        basePosts = basePosts.filter((p) => p.entry_type === 'awards_commendation');
        
        // Then filter by search term if provided
        if (!searchTerm.trim()) {
            return basePosts;
        }
        
        const term = searchTerm.toLowerCase();
        return basePosts.filter((p) => 
            p.headline.toLowerCase().includes(term) || 
            p.description.toLowerCase().includes(term)
        );
    }, [posts, searchTerm, isDateFiltered, dateFilteredPosts]);

    const { data, setData, processing, reset } = useForm({
        headline: '',
        description: '',
        posted_date: '',
        closing_date: '',
        Poster: [] as File[],
        entry_type: 'awards_commendation' as const,
        Video: null as File | null,
    });

    const toggleExpand = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    // Use posted dates from date filter hook (which uses allPostDates from server)
    const postedDates = dateFilterPostedDates;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Validate required fields
        if (!data.headline || !data.posted_date) {
            showErrorMessage('Please fill in all required fields (Headline, Post Date)');
            setIsSubmitting(false);
            return;
        }

        const endpoint = auth?.user?.role === 'admin' ? '/admin/awardsCommendation' : '/awardsCommendation';

        if (editing) {
            const fd = new FormData();
            fd.append('headline', data.headline);
            fd.append('description', data.description);
            fd.append('posted_date', data.posted_date);
            if (data.closing_date) {
                fd.append('closing_date', data.closing_date);
            }
            fd.append('entry_type', 'awards_commendation');
            // Always send existing_images explicitly (even if empty) so backend knows to clear images
            if (existingImages.length > 0) {
                existingImages.forEach((image, index) => {
                    fd.append(`existing_images[${index}]`, image);
                });
            } else {
                fd.append('existing_images', '');
            }
            
            // Add new uploaded images
            if (data.Poster && data.Poster.length > 0) {
                data.Poster.forEach((image) => {
                    fd.append('Poster[]', image);
                });
            }
            if (data.Video) {
                fd.append('Video', data.Video);
            }
            fd.append('_method', 'PUT');

            const updateEndpoint = auth?.user?.role === 'admin' 
                ? `/admin/awardsCommendation/${editing.id}`
                : `/awardsCommendation/${editing.id}`;

            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsSubmitting(false);
                return;
            }

            axios
                .post(updateEndpoint, fd, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    const updatedPost = response.data.post;
                    setPosts(posts.map((post) => (post.id === editing.id ? updatedPost : post)));
                    reset();
                    setEditing(null);
                    setOpen(false);
                    showSuccessMessage(response.data.message || 'Post updated successfully!');
                })
                .catch((error) => {
                    const errorMsg = error?.response?.data?.message || 
                                   (error?.response?.data?.errors ? 
                                    Object.values(error.response.data.errors).flat().join(', ') : 
                                    'Failed to update post. Please try again.');
                    showErrorMessage(errorMsg);
                })
                .finally(() => setIsSubmitting(false));
        } else {
            const fd = new FormData();
            fd.append('headline', data.headline);
            fd.append('description', data.description);
            fd.append('posted_date', data.posted_date);
            if (data.closing_date) {
                fd.append('closing_date', data.closing_date);
            }
            fd.append('entry_type', 'awards_commendation');
            if (data.Poster && data.Poster.length > 0) {
                data.Poster.forEach((file) => fd.append('Poster[]', file));
            }
            if (data.Video) {
                fd.append('Video', data.Video);
            }
            
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsSubmitting(false);
                return;
            }

            axios
                .post(endpoint, fd, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    const newPost = response.data.post;
                    setPosts([newPost, ...posts]);
                    setData({ headline: '', description: '', posted_date: '', closing_date: '', Poster: [], entry_type: 'awards_commendation', Video: null });
                    setOpen(false);
                    showSuccessMessage(response.data.message || 'Post created successfully!');
                })
                .catch((error) => {
                    console.error('Error creating post:', error);
                    if (error.response?.status === 419) {
                        showErrorMessage('Session expired. Please refresh the page and try again.');
                    } else {
                        const errorMsg = error?.response?.data?.message || 
                                       (error?.response?.data?.errors ? 
                                        Object.values(error.response.data.errors).flat().join(', ') : 
                                        'Failed to create post. Please check the form and try again.');
                        showErrorMessage(errorMsg);
                    }
                })
                .finally(() => setIsSubmitting(false));
        }
    };

    const handleDeleteClick = (post: CareerPost) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (!postToDelete) return;
        setIsDeleting(true);
        const deleteEndpoint = auth?.user?.role === 'admin'
            ? `/admin/awardsCommendation/${postToDelete.id}`
            : `/awardsCommendation/${postToDelete.id}`;
        
        axios
            .delete(deleteEndpoint, {
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                withCredentials: true,
            })
            .then((response) => {
                setPosts(posts.filter((p) => p.id !== postToDelete.id));
                setDeleteDialogOpen(false);
                setPostToDelete(null);
                showSuccessMessage(response.data.message);
            })
            .catch((error) => {
                const errorMsg = error?.response?.data?.message || 'Failed to delete post. Please try again.';
                showErrorMessage(errorMsg);
            })
            .finally(() => setIsDeleting(false));
    };

    const openCreate = () => {
        setEditing(null);
        setData({ headline: '', description: '', posted_date: '', closing_date: '', Poster: [], entry_type: 'awards_commendation', Video: null });
        setOpen(true);
    };

    const openEdit = (p: CareerPost) => {
        setEditing(p);
        setExistingImages(p.Poster || []);
        setData({
            headline: p.headline,
            description: p.description,
            posted_date: p.posted_date,
            closing_date: p.closing_date,
            Poster: [],
            entry_type: 'awards_commendation',
        });
        setOpen(true);
    };

    const handleReadMore = (postId: number, postName: string) => {
        const asciiName = postName.replace(/[^\x00-\x7F]/g, '');
        const slug = asciiName
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 60);
        router.visit(`/post/${postId}?p=${slug}`);
    };

    // Pagination helpers
    const displayedSource: Posting[] = React.useMemo(() => {
        return isSearching ? ((searchResults as Posting[] | null) ?? []) : (filteredPosts as unknown as Posting[]);
    }, [isSearching, searchResults, filteredPosts]);

    const lastPage = Math.max(1, Math.ceil(displayedSource.length / perPage));
    const safeCurrentPage = Math.min(currentPage, lastPage);
    const startIndex = (safeCurrentPage - 1) * perPage;
    const endIndex = startIndex + perPage;
    const displayedPage = displayedSource.slice(startIndex, endIndex);

    const paginationData = React.useMemo(() => {
        const total = displayedSource.length;
        const from = total === 0 ? 0 : startIndex + 1;
        const to = Math.min(total, endIndex);
        const links = Array.from({ length: lastPage }).map((_, i) => {
            const pageNum = i + 1;
            return { url: `?page=${pageNum}`, label: String(pageNum), active: pageNum === safeCurrentPage };
        });
        return {
            data: [],
            current_page: safeCurrentPage,
            last_page: lastPage,
            per_page: perPage,
            total,
            from,
            to,
            links: [
                { url: safeCurrentPage > 1 ? `?page=${safeCurrentPage - 1}` : null, label: '&laquo; Previous', active: false },
                ...links,
                { url: safeCurrentPage < lastPage ? `?page=${safeCurrentPage + 1}` : null, label: 'Next &raquo;', active: false },
            ],
        } as any;
    }, [displayedSource.length, endIndex, lastPage, perPage, safeCurrentPage, startIndex]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Use displayedPosts which combines date filter, then apply search if active
    const displayed: Posting[] = isSearching 
        ? ((searchResults as Posting[] | null) ?? []) 
        : (displayedPage as Posting[]);

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
                            <h1 className="text-2xl font-bold">AWARDS & COMMENDATIONS</h1>
                        </header>
                        {auth?.user && (
                            <div className="flex gap-2">
                                {canManage && (
                                    <Button className="bg-blue-700 text-white" onClick={openCreate}>
                                        Create Posts
                                    </Button>
                                )}
                               
                            </div>
                        )}
                    </div>

                    {successMessage && canManage && (
                        <div className="mx-w-5 container mt-4">
                            <Alert className="border-green-200 bg-green-50 text-green-800">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        </div>
                    )}
                    {errorMessage && canManage && (
                        <div className="mx-w-5 container mt-4">
                            <Alert className="border-red-200 bg-red-50 text-red-800">
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <div className="mx-w-5 container mt-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Left Column */}
                            <div className="space-y-4 md:col-span-2">
                                {(searchTerm || isDateFiltered) && (
                                    <div className="mb-1 text-sm text-gray-600">
                                        {displayed.length} of {posts.length} posts 
                                        {searchTerm && ` match "${searchTerm}"`}
                                        {isDateFiltered && selectedDate && ` on ${selectedDate.toLocaleDateString()}`}
                                    </div>
                                )}
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            {isLoading || isInitialLoading ? (
                                                <PostSkeleton count={3} />
                                            ) : displayed.length === 0 && posts.length === 0 ? (
                                                <div className="rounded-md border p-4 text-sm text-gray-600">No posts found.</div>
                                            ) : displayed.length === 0 && posts.length > 0 ? (
                                                <div className="rounded-md border p-4 text-sm text-gray-600">
                                                    {isSearching ? (
                                                        <p>No posts found matching "{searchTerm}"</p>
                                                    ) : (
                                                        <p>No posts found matching your search.</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <PostingList
                                                    postings={displayed}
                                                    onReadMore={handleReadMore}
                                                    renderActions={canManage ? (p) => (
                                                        <>
                                                            <Button variant="outline" onClick={() => openEdit(p as any)}>
                                                                Edit
                                                            </Button>
                                                            <Button variant="destructive" onClick={() => handleDeleteClick(p as any)}>
                                                                Delete
                                                            </Button>
                                                        </>
                                                    ) : undefined}
                                                />
                                            )}
                                        </div>
                                        {/* Pagination */}
                                        {displayedSource.length > perPage && (
                                            <Pagination postsData={paginationData} onPageChange={handlePageChange} isSearching={isSearching} />
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Views */}
                                <div className="flex items-center text-sm text-gray-600">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Views: <span className="ml-1 font-semibold">{views}</span>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                {/* Admin Navigation - only for admins */}
                                {auth?.user?.role === 'admin' && (
                                    <Card>
                                        <CardContent className="p-4">
                                            <h3 className="mb-3 font-semibold">Admin Panel</h3>
                                            <div className="space-y-2">
                                                <Link href="/admin/careerPost" className="block text-sm text-blue-600 hover:underline">
                                                    Career Post Management
                                                </Link>
                                                <Link href="/admin/postings" className="block text-sm text-blue-600 hover:underline">
                                                    Postings Management
                                                </Link>
                                                <Link href="/awardsCommendation" className="block text-sm text-blue-600 hover:underline">
                                                    Awards & Commendations Management
                                                </Link>
                                                <Link href="/admin/users" className="block text-sm text-blue-600 hover:underline">
                                                    User Management
                                                </Link>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

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
                                                className="mt-3"
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

                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-center dark:bg-blend-color">
                        <TotalViewsCounter />
                    </div>
                </div>
            </AppLayout>

            {/* Create/Edit Dialog - only shown if user can manage */}
            {canManage && (
                <>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent className="h-[85vh] w-full max-w-[1000px] overflow-y-auto" style={{ maxWidth: '1000px' }}>
                            <DialogHeader>
                                <DialogTitle>{editing ? 'Edit Awards & Commendation' : 'Create Awards & Commendation'}</DialogTitle>
                                <DialogDescription className="sr-only">{editing ? 'Edit an existing awards & commendation' : 'Create a new awards & commendation'}</DialogDescription>
                            </DialogHeader>
                            <UserPostingForm
                                editing={editing as any}
                                data={data as any}
                                setData={(key: any, value: any) => {
                                    if (typeof key === 'string') {
                                        setData(key as any, value);
                                    } else {
                                        setData(key);
                                    }
                                }}
                                existingImages={existingImages}
                                setExistingImages={setExistingImages}
                                isSubmitting={isSubmitting}
                                processing={processing}
                                onSubmit={submit}
                                onClose={() => setOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>

                    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone. This will permanently delete this post.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
            )}

            <AppFooter />
        </>
    );
}
