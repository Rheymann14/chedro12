import AppFooter from '@/components/app-footer';
import { HeaderLogos, PostSkeleton, TotalViewsCounter } from '@/components/global-components';
import { Pagination } from '@/components/global-components/pagination';
import RichTextEditor from '@/components/RichTextEditor';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDateFilter } from '@/hooks/useDateFilter';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { getYouTubeThumbnailFromHtml, sanitizeHtmlForDisplay } from '@/utils/dashboard';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { addDays } from 'date-fns';
import { AlertCircle, BarChart3, CalendarIcon, CheckCircle, ImageIcon, X } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { compressImage, validateFileSize } from '@/utils/imageCompression';

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Career Post Management', href: '#' }];

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

export default function UserCareerPost() {
    const { props } = usePage<{ posts: CareerPost[]; allPostDates?: string[] }>();
    const [posts, setPosts] = React.useState<CareerPost[]>(props.posts ?? []);
    const [isInitialLoading, setIsInitialLoading] = React.useState(true);
    const [views, setViews] = useState<number>(0);

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
            body: JSON.stringify({ page: 'user-career-post' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=user-career-post'))
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
    const [existingImages, setExistingImages] = React.useState<string[]>([]);
    const [currentPage, setCurrentPage] = React.useState<number>(1);
    const [submitted, setSubmitted] = React.useState(false);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
    const [imageErrors, setImageErrors] = React.useState<string[]>([]);
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
        
        // Filter by entry_type (career posts only)
        basePosts = basePosts.filter((p) => p.entry_type === 'career_post');
        
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
        career: '',
        Poster: [] as File[],
        Video: null as File | null,
        entry_type: 'career_post' as const,
    });

    // Removed expand/collapse in favor of Read more navigation

    // Use posted dates from date filter hook (which uses allPostDates from server)
    const postedDates = dateFilterPostedDates;

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = existingImages.length + files.length;
        
        if (totalImages > 10) {
            setImageErrors([`Maximum 10 images allowed. You currently have ${existingImages.length} images.`]);
            return;
        }

        const errors: string[] = [];
        const compressedFiles: File[] = [];

        for (const file of files) {
            // Validate file size (10MB)
            if (!validateFileSize(file, 10)) {
                errors.push(`${file.name} exceeds 10MB limit. Please choose a smaller file.`);
                continue;
            }

            try {
                // Compress image to 2MB (backend limit)
                const compressedFile = await compressImage(file, 2, 0.8);
                compressedFiles.push(compressedFile);
            } catch (error) {
                errors.push(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        setImageErrors(errors);
        
        if (compressedFiles.length > 0) {
            setData('Poster', [...(data.Poster || []), ...compressedFiles] as any);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const errors: Record<string, string> = {};
        if (!data.headline || data.headline.trim() === '') {
            errors.headline = 'Headline is required';
        }
        if (!data.posted_date) {
            errors.posted_date = 'Post Date is required';
        }
        if (!data.career || data.career.trim() === '') {
            errors.career = 'Career is required';
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0 || imageErrors.length > 0) {
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);

        if (editing) {
            const fd = new FormData();
            fd.append('headline', data.headline);
            fd.append('description', data.description);
            fd.append('posted_date', data.posted_date);
            fd.append('closing_date', data.closing_date);
            fd.append('career', data.career);
            fd.append('entry_type', 'career_post');

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

            axios
                .post(`/careerPost/${editing.id}`, fd, {
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
                })
                .then((response) => {
                    const updatedPost = response.data.post;
                    setPosts(posts.map((post) => (post.id === editing.id ? updatedPost : post)));
                    reset();
                    setEditing(null);
                    setExistingImages([]);
                    setSubmitted(false);
                    setFieldErrors({});
                    setImageErrors([]);
                    setOpen(false);
                    showSuccessMessage(response.data.message || 'Post updated successfully!');
                })
                .catch((error) => {
                    const errorMsg =
                        error?.response?.data?.message ||
                        (error?.response?.data?.errors
                            ? Object.values(error.response.data.errors).flat().join(', ')
                            : 'Failed to update post. Please try again.');
                    showErrorMessage(errorMsg);
                })
                .finally(() => setIsSubmitting(false));
        } else {
            const fd = new FormData();
            fd.append('headline', data.headline);
            fd.append('description', data.description);
            fd.append('posted_date', data.posted_date);
            fd.append('closing_date', data.closing_date);
            fd.append('career', data.career);
            fd.append('entry_type', 'career_post');
            if (data.Poster && data.Poster.length > 0) {
                data.Poster.forEach((file, index) => fd.append(`Poster[${index}]`, file));
            }
            if (data.Video) {
                fd.append('Video', data.Video);
            }

            axios
                .post('/careerPost', fd, {
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                    },
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
                        Video: null,
                        entry_type: 'career_post',
                    });
                    setExistingImages([]);
                    setSubmitted(false);
                    setFieldErrors({});
                    setImageErrors([]);
                    setOpen(false);
                    showSuccessMessage(response.data.message || 'Post created successfully!');
                })
                .catch((error) => {
                    const errorMsg =
                        error?.response?.data?.message ||
                        (error?.response?.data?.errors
                            ? Object.values(error.response.data.errors).flat().join(', ')
                            : 'Failed to create post. Please check the form and try again.');
                    showErrorMessage(errorMsg);
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
        axios
            .delete(`/careerPost/${postToDelete.id}`)
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
        setData({ headline: '', description: '', posted_date: '', closing_date: '', career: '', Poster: [], Video: null, entry_type: 'career_post' });
        setExistingImages([]);
        setSubmitted(false);
        setFieldErrors({});
        setImageErrors([]);
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
            Video: null,
            entry_type: 'career_post',
        });
        setSubmitted(false);
        setFieldErrors({});
        setImageErrors([]);
        setOpen(true);
    };

    // Pagination helpers
    const displayedSource = React.useMemo(() => filteredPosts as unknown as CareerPost[], [filteredPosts]);
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

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs} searchTerm={searchTerm} onSearchChange={setSearchTerm}>
                <Head title="User - Career Post Management" />

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-between border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-2xl font-bold">CAREER POST MANAGEMENT</h1>
                        </header>
                        <Button className="bg-blue-700 text-white" onClick={openCreate}>
                            Create Postss
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
                                                <div className="rounded-md border p-4 text-sm text-gray-600">
                                                    No posts found matching your search.
                                                </div>
                                            ) : (
                                                displayedPage.map((p) => (
                                                    <div key={p.id} className="flex flex-col gap-4 rounded-xl bg-white p-4 sm:flex-row sm:gap-6">
                                                        {/* Post Image - Left side on desktop, top on mobile */}
                                                        <div className="group flex-shrink-0 overflow-hidden rounded-lg">
                                                            {p.Poster && p.Poster.length > 0 ? (
                                                                <img
                                                                    src={`/storage/${p.Poster[0]}`}
                                                                    alt="Poster"
                                                                    className="h-auto w-full max-w-sm rounded-lg object-contain transition-transform duration-300 ease-out group-hover:scale-105 sm:w-80"
                                                                />
                                                            ) : getYouTubeThumbnailFromHtml(p.description) ? (
                                                                <img
                                                                    src={getYouTubeThumbnailFromHtml(p.description) as string}
                                                                    alt="YouTube thumbnail"
                                                                    className="h-44 w-80 rounded-lg object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-lg bg-gray-200 sm:h-40 sm:w-60">
                                                                    <span className="text-xs text-gray-400">No Image</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Post Content - Right side on desktop, bottom on mobile */}
                                                        <div className="flex min-w-0 flex-1 flex-col">
                                                            <Link href={`/post/${p.id}`} className="block">
                                                                <h3 className="mb-2 cursor-pointer text-xl font-extrabold tracking-tight text-blue-700 uppercase transition-colors hover:text-blue-800 hover:underline sm:text-2xl md:text-3xl">
                                                                    {p.headline}
                                                                </h3>
                                                            </Link>
                                                            <div className="desc-html mb-4 text-sm leading-relaxed text-gray-700 sm:text-[15px]">
                                                                <div
                                                                    className="prose prose-sm line-clamp-3 max-w-none text-justify"
                                                                    dangerouslySetInnerHTML={{ __html: sanitizeHtmlForDisplay(p.description) }}
                                                                />
                                                            </div>

                                                            <div className="mb-2 p-2 text-xs text-gray-500">
                                                                <p>
                                                                    <span>Post: {p.posted_date}</span>
                                                                </p>
                                                                <p>
                                                                    <span>Close: {p.closing_date}</span>
                                                                </p>
                                                                <p>
                                                                    <span>Career: {p.career}</span>
                                                                </p>
                                                            </div>
                                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm text-white hover:bg-blue-800 sm:px-5"
                                                                    onClick={() => (window.location.href = `/post/${p.id}`)}
                                                                >
                                                                    Read More
                                                                </Button>
                                                                <div className="flex items-center gap-2">
                                                                    <Button variant="outline" onClick={() => openEdit(p)}>
                                                                        Edit
                                                                    </Button>
                                                                    <Button variant="destructive" onClick={() => handleDeleteClick(p)}>
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                                {/* Pagination */}
                                <Pagination postsData={paginationData} onPageChange={handlePageChange} isSearching={false} />

                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Views: <span className="ml-1 font-semibold">{views}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Card>
                                    <CardContent className="flex items-center justify-center p-4">
                                        <img src="/img/transparency-seal.png" alt="Transparency Seal" className="mx-2 h-28" />
                                        <img src="/FIP.png" alt="/build/FIP.png" className="mx-2 h-31" />
                                    </CardContent>
                                </Card>
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
                                <Card className="border-none shadow-none">
                                    <CardContent className="flex h-100 justify-center p-4"></CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-center dark:bg-blend-color">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                            <TotalViewsCounter />
                        </div>
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
                    <form key={editing ? `edit-${editing.id}` : 'create'} onSubmit={submit} className="space-y-6">
                        {/* Basic Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Basic Information</CardTitle>
                                <CardDescription>Enter the main details for this career post</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="headline">
                                        Headline * {fieldErrors.headline && <span className="text-destructive text-sm">({fieldErrors.headline})</span>}
                                    </Label>
                                    <Input
                                        id="headline"
                                        placeholder="Enter career post headline..."
                                        value={data.headline}
                                        onChange={(e) => {
                                            setData('headline', e.target.value);
                                            if (fieldErrors.headline) {
                                                setFieldErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.headline;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        className={fieldErrors.headline ? 'border-red-500' : ''}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <RichTextEditor
                                        value={data.description}
                                        onChange={(html) => setData('description', html)}
                                        placeholder="Type the career post details…"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="career">
                                        Career * {fieldErrors.career && <span className="text-destructive text-sm">({fieldErrors.career})</span>}
                                    </Label>
                                    <Input
                                        id="career"
                                        placeholder="e.g., Education, Finance"
                                        value={data.career}
                                        onChange={(e) => {
                                            setData('career', e.target.value);
                                            if (fieldErrors.career) {
                                                setFieldErrors((prev) => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.career;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        className={fieldErrors.career ? 'border-red-500' : ''}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="posted_date" className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            Post Date * {fieldErrors.posted_date && <span className="text-destructive text-sm">({fieldErrors.posted_date})</span>}
                                        </Label>
                                        <Input
                                            id="posted_date"
                                            type="date"
                                            value={data.posted_date}
                                            onChange={(e) => {
                                                setData('posted_date', e.target.value);
                                                if (fieldErrors.posted_date) {
                                                    setFieldErrors((prev) => {
                                                        const newErrors = { ...prev };
                                                        delete newErrors.posted_date;
                                                        return newErrors;
                                                    });
                                                }
                                            }}
                                            className={fieldErrors.posted_date ? 'border-red-500' : ''}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="closing_date" className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            Closing Date
                                        </Label>
                                        <Input
                                            id="closing_date"
                                            type="date"
                                            value={data.closing_date}
                                            onChange={(e) => setData('closing_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Media Section Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <ImageIcon className="h-5 w-5" />
                                    Media Assets
                                </CardTitle>
                                <CardDescription>Upload images for this career post</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Upload Button */}
                                <div className="space-y-2">
                                    <div className="flex w-full items-center justify-center">
                                        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                                                <p className="mb-1 text-sm text-muted-foreground">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB (will be compressed)</p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    </div>
                                    {imageErrors.length > 0 && (
                                        <div className="text-sm text-destructive">
                                            {imageErrors.map((error, index) => (
                                                <p key={index}>{error}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Images Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base">Poster Images</Label>
                                        <span className="text-xs text-muted-foreground">
                                            {existingImages.length + (data.Poster?.length || 0)} / 10 images
                                        </span>
                                    </div>

                                    {/* Existing Images */}
                                    {editing && existingImages.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">Current Images:</p>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                                                {existingImages.map((image, index) => (
                                                    <div key={`existing-${index}`} className="group relative">
                                                        <img
                                                            src={`/storage/${image}`}
                                                            alt={`Current ${index + 1}`}
                                                            className="h-24 w-full rounded-lg border object-cover transition-all group-hover:brightness-75"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                                                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:scale-110"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                        {index === 0 && (
                                                            <div className="absolute bottom-2 left-2 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-white shadow">
                                                                Primary
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* New Images Preview */}
                                    {data.Poster && data.Poster.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">New Images to Add:</p>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                                                {data.Poster.map((file, index) => (
                                                    <div key={`new-${index}`} className="group relative">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="h-24 w-full rounded-lg border object-cover transition-all group-hover:brightness-75"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setData('Poster', data.Poster.filter((_, i) => i !== index) as any)}
                                                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:scale-110"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing || isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing || isSubmitting}>
                                {isSubmitting ? 'Saving...' : editing ? 'Update Career Post' : 'Create Career Post'}
                            </Button>
                        </div>
                    </form>
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
