import AppFooter from '@/components/app-footer';
import { CareerPostList } from '@/components/features/career-posts';
import { HeaderLogos, PostSkeleton, TotalViewsCounter } from '@/components/global-components';
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
import { useDateFilter } from '@/hooks/useDateFilter';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { CareerPost as CareerPostType } from '@/types/dashboard';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { addDays } from 'date-fns';
import { BarChart3, CheckCircle } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { AdminCareerPostForm } from './careerPost/components/AdminCareerPostForm';
const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Career Post Management',
        href: '#',
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

export default function AdminCareerPost() {
    const { props } = usePage<{ posts: CareerPost[]; allPostDates?: string[] }>();
    const [posts, setPosts] = React.useState<CareerPost[]>(props.posts ?? []);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    const [views, setViews] = useState<number>(0);

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

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({ page: 'admin-career-post' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=admin-career-post'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);

    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState<CareerPost | null>(null);
    const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [postToDelete, setPostToDelete] = React.useState<CareerPost | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [expanded, setExpanded] = React.useState<Record<number, boolean>>({});
    const [existingImages, setExistingImages] = React.useState<string[]>([]);
    
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

    // Filter posts based on search term and date filter
    const filteredPosts = React.useMemo(() => {
        // Start with date-filtered posts if date filter is active
        let basePosts = isDateFiltered ? (dateFilteredPosts as CareerPost[]) : posts;
        
        // Filter by entry_type (career posts only, not postings)
        basePosts = basePosts.filter((p) => p.entry_type !== 'posting');
        
        // Then filter by search term if provided
        if (!searchTerm.trim()) {
            return basePosts;
        }

        const term = searchTerm.toLowerCase();
        return basePosts.filter(
            (post) =>
                post.headline.toLowerCase().includes(term) ||
                post.description.toLowerCase().includes(term) ||
                (post.career && post.career.toLowerCase().includes(term)),
        );
    }, [posts, searchTerm, isDateFiltered, dateFilteredPosts]);

    const { data, setData, post, processing, reset, errors } = useForm({
        headline: '',
        description: '',
        posted_date: '',
        closing_date: '',
        career: '',
        Poster: [] as File[],
    });

    const toggleExpand = (id: number) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    // Use posted dates from date filter hook (which uses allPostDates from server)
    const postedDates = dateFilterPostedDates;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editing) {
            const fd = new FormData();
            fd.append('headline', data.headline);
            fd.append('description', data.description);
            fd.append('posted_date', data.posted_date);
            fd.append('closing_date', data.closing_date);
            fd.append('career', data.career);
            // Always send existing_images explicitly (even if empty) so backend knows to clear images
            if (existingImages.length > 0) {
                existingImages.forEach((image, index) => {
                    fd.append(`existing_images[${index}]`, image);
                });
            } else {
                // Send empty array indicator so backend knows to clear all images
                fd.append('existing_images', '');
            }
            
            // Add new uploaded images
            if (data.Poster && data.Poster.length > 0) {
                data.Poster.forEach((image, index) => {
                    fd.append(`Poster[${index}]`, image);
                });
            }
            fd.append('_method', 'PUT');

            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsSubmitting(false);
                return;
            }

            axios
                .post(`/admin/careerPost/${editing.id}`, fd, {
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
                    console.error('Update failed:', error);
                    let errorMsg = 'Failed to update post. Please try again.';
                    
                    if (error?.response?.status === 419) {
                        errorMsg = 'Session expired. Please refresh the page and try again.';
                    } else if (error?.response?.data?.message) {
                        errorMsg = error.response.data.message;
                    } else if (error?.response?.data?.errors) {
                        errorMsg = Object.values(error.response.data.errors).flat().join(', ');
                    }
                    
                    showErrorMessage(errorMsg);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        } else {
            const fd = new FormData();
            fd.append('headline', data.headline);
            fd.append('description', data.description);
            fd.append('posted_date', data.posted_date);
            fd.append('closing_date', data.closing_date);
            fd.append('career', data.career);
            fd.append('entry_type', 'career_post');
            if (data.Poster && data.Poster.length > 0) {
                data.Poster.forEach((file, index) => {
                    fd.append(`Poster[${index}]`, file);
                });
            }

            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsSubmitting(false);
                return;
            }

            axios
                .post('/admin/careerPost', fd, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    const newPost = response.data.post;
                    setPosts([newPost, ...posts]);
                    setData({
                        headline: '',
                        description: '',
                        posted_date: '',
                        closing_date: '',
                        career: '',
                        Poster: [],
                    });
                    setOpen(false);
                    showSuccessMessage(response.data.message || 'Post created successfully!');
                })
                .catch((error) => {
                    console.error('Create failed:', error);
                    let errorMsg = 'Failed to create post. Please check the form and try again.';
                    
                    if (error?.response?.status === 419) {
                        errorMsg = 'Session expired. Please refresh the page and try again.';
                    } else if (error?.response?.data?.message) {
                        errorMsg = error.response.data.message;
                    } else if (error?.response?.data?.errors) {
                        errorMsg = Object.values(error.response.data.errors).flat().join(', ');
                    }
                    
                    showErrorMessage(errorMsg);
                })
                .finally(() => {
                    setIsSubmitting(false);
                });
        }
    };

    const handleDeleteClick = (post: CareerPost) => {
        setPostToDelete(post);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (postToDelete) {
            setIsDeleting(true);
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                showErrorMessage('CSRF token not found. Please refresh the page and try again.');
                setIsDeleting(false);
                return;
            }

            axios
                .delete(`/admin/careerPost/${postToDelete.id}`, {
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                    },
                    withCredentials: true,
                })
                .then((response) => {
                    setPosts(posts.filter((post) => post.id !== postToDelete.id));
                    setDeleteDialogOpen(false);
                    setPostToDelete(null);
                    showSuccessMessage(response.data.message);
                })
                .catch((error) => {
                    console.error('Delete failed:', error);
                    let errorMsg = 'Failed to delete post. Please try again.';
                    
                    if (error?.response?.status === 419) {
                        errorMsg = 'Session expired. Please refresh the page and try again.';
                    } else if (error?.response?.data?.message) {
                        errorMsg = error.response.data.message;
                    }
                    
                    showErrorMessage(errorMsg);
                })
                .finally(() => {
                    setIsDeleting(false);
                });
        }
    };

    const openCreate = () => {
        setEditing(null);
        setData({
            headline: '',
            description: '',
            posted_date: '',
            closing_date: '',
            career: '',
            Poster: [],
        });
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
            career: p.career,
            Poster: [],
        });
        setOpen(true);
    };

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs} searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Head title="Admin - Career Post Management" />

                <div className="mx-w-5 container p-4">
                <HeaderLogos />
                <div className="mx-w-5 container flex min-h-[10px] items-center justify-between border-b dark:bg-blend-color">
                    <header className="mb-4">
                        <h1 className="text-2xl font-bold">CAREER POST MANAGEMENT</h1>
                    </header>
                    <Button className="bg-blue-700 text-white" onClick={openCreate}>
                        Create Posts
                    </Button>
                </div>

                    {successMessage && (
                        <div className="mx-w-5 container mt-4">
                            <Alert className="border-green-200 bg-green-50 text-green-800">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        </div>
                    )}
                    {errorMessage && (
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
                                    {filteredPosts.length} of {posts.length} posts 
                                    {searchTerm && ` match "${searchTerm}"`}
                                    {isDateFiltered && selectedDate && ` on ${selectedDate.toLocaleDateString()}`}
                                </div>
                            )}
                            <Card>
                                <CardContent className="p-4">
                            <div className="grid grid-cols-1 gap-4">
                                {isInitialLoading ? (
                                    <PostSkeleton count={3} />
                                ) : filteredPosts.length === 0 && posts.length === 0 ? (
                                    <div className="rounded-md border p-4 text-sm text-gray-600">No posts yet.</div>
                                ) : filteredPosts.length === 0 && posts.length > 0 ? (
                                    <div className="rounded-md border p-4 text-sm text-gray-600">No posts found matching your search.</div>
                                ) : filteredPosts.length > 0 ? (
                                    <CareerPostList
                                        posts={filteredPosts as unknown as CareerPostType[]}
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
                                        renderActions={(p) => (
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" onClick={() => openEdit(p as any)}>
                                                    Edit
                                                </Button>
                                                <Button variant="destructive" onClick={() => handleDeleteClick(p as any)}>
                                                    Delete
                                                </Button>
                                            </div>
                                        )}
                                    />
                                ) : null}
                            </div>
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
                            {/* Admin Navigation */}
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
                                        <Link href="/admin/users" className="block text-sm text-blue-600 hover:underline">
                                            User Management
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>

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

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="h-[85vh] w-full max-w-[1000px] overflow-y-auto" style={{ maxWidth: '1000px' }}>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Career Post' : 'Create Career Post'}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {editing ? 'Edit an existing career post' : 'Create a new career post'}
                        </DialogDescription>
                    </DialogHeader>
                    <AdminCareerPostForm
                        editing={editing}
                        data={data as any}
                        setData={setData as any}
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
            <AppFooter />
        </>
    );
}
