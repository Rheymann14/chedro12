import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { getYouTubeThumbnailFromHtml, sanitizeHtmlForDisplay } from '@/utils/dashboard';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

type CareerPost = {
    id: number;
    headline: string;
    description: string;
    posted_date: string;
    closing_date: string;
    career: string | null;
    Poster?: string[] | null;
    Video?: string | null;
    entry_type?: 'posting' | 'career_post' | 'awards_commendation';
};

type MetaData = {
    title: string;
    description: string;
    image: string;
    url: string;
};

export default function PostDetail() {
    const { props } = usePage<{ post: CareerPost; meta?: MetaData } & SharedData>();
    const post = props.post;
    const { auth } = props;
    
    // Use page-specific meta if available, otherwise fall back to default
    const getPostTypeLabel = () => {
        if (post.entry_type === 'posting') return 'Posting';
        if (post.entry_type === 'awards_commendation') return 'Awards & Commendation';
        return 'Career Post';
    };
    
    const metaData = props.meta || {
        title: `${post.headline} - ${getPostTypeLabel()} Detail`,
        description: post.description ? post.description.substring(0, 160) : 'View this post on CHED Portal',
        image: post.Poster && post.Poster.length > 0 ? `/storage/${post.Poster[0]}` : '/img/default-og-image.png',
        url: '',
    };
    const [views, setViews] = useState<number>(0);
    const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const openLightbox = (src: string) => {
        setLightboxSrc(src);
        setLightboxOpen(true);
    };
    const closeLightbox = () => {
        setLightboxOpen(false);
        setLightboxSrc(null);
    };

    // Parse posted_date safely (YYYY-MM-DD)
    const postedDate = (() => {
        const parts = (post?.posted_date || '').split('-').map((p) => parseInt(p, 10));
        if (parts.length === 3 && !parts.some(Number.isNaN)) {
            return new Date(parts[0], parts[1] - 1, parts[2]);
        }
        const d = post?.posted_date ? new Date(post.posted_date) : null;
        return d && !isNaN(d.getTime()) ? d : new Date();
    })();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Post Detail',
            href: '#',
        },
    ];

    const getManagePostUrl = () => {
        if (!auth?.user) return '#';
        
        // Awards & Commendations uses unified public page
        if (post.entry_type === 'awards_commendation') {
            return '/awardsCommendation';
        }
        
        const isAdmin = auth.user.role === 'admin';
        const isPosting = post.entry_type === 'posting';

        if (isAdmin) {
            return isPosting ? '/admin/postings' : '/admin/careerPost';
        } else {
            return isPosting ? '/user/postings' : '/user/careerPost';
        }
    };

    useEffect(() => {
        if (!post?.id) return;
        const pageKey = `post-${post.id}`;
        fetch('/views/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: pageKey }),
            credentials: 'same-origin',
        })
            .then(() => fetch(`/views/count?page=${encodeURIComponent(pageKey)}`))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, [post?.id]);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={metaData.title}>
                </Head>

                {/* Header */}
                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-between border-b dark:bg-blend-color">
                        <header className="">
                            <div className="flex items-center"></div>
                            <h2 className="mb-4 text-3xl font-bold text-black">{post.headline}</h2>
                        </header>
                        {auth?.user && (
                            <div className="mb-4">
                                <Link href={getManagePostUrl()}>
                                    <Button size="sm" variant="outline">
                                        <Settings className="mr-2 h-4 w-4" /> Manage Post
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="mx-w-5 container mt-2">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Left Column - Main Content */}
                            <div className="space-y-4 md:col-span-2">
                                <Card>
                                    <CardContent className="p-6 pt-2">
                                        <div className="space-y-6">
                                            {/* Post Header */}

                                            {/* Video */}
                                            {post.Video && (
                                                <div className="space-y-4">
                                                    <video
                                                        className="w-full rounded-lg"
                                                        controls
                                                        src={`/storage/${post.Video}`}
                                                    />
                                                </div>
                                            )}

                                            {/* Images */}
                                            {(post.Poster && post.Poster.length > 0) || getYouTubeThumbnailFromHtml(post.description) ? (
                                                <div className="space-y-4">
                                                    {/* Primary Image */}
                                                    {post.Poster && post.Poster.length > 0 ? (
                                                        <div className="group overflow-hidden rounded-lg">
                                                            <img
                                                                src={`/storage/${post.Poster[0]}`}
                                                                alt="Primary Poster"
                                                                className="h-auto w-full cursor-zoom-in rounded-lg object-contain transition-transform duration-300 ease-out group-hover:scale-105"
                                                                onClick={() => openLightbox(`/storage/${post.Poster?.[0]}`)}
                                                            />
                                                        </div>
                                                    ) : (
                                                        (() => {
                                                            const thumb = getYouTubeThumbnailFromHtml(post.description);
                                                            if (!thumb) return null;

                                                            // Extract YouTube video ID from the description with improved regex
                                                            const youtubeRegex =
                                                                /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                                                            const match = post.description.match(youtubeRegex);
                                                            const videoId = match ? match[1] : null;

                                                            return (
                                                                <div className="space-y-4">
                                                                    {/* YouTube iframe embed */}
                                                                    {videoId && (
                                                                        <div
                                                                            className="relative w-full overflow-hidden rounded-lg bg-gray-900"
                                                                            style={{ paddingBottom: '56.25%' }}
                                                                        >
                                                                            <iframe
                                                                                src={`https://www.youtube.com/embed/${videoId}`}
                                                                                title="YouTube video player"
                                                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                                                allowFullScreen
                                                                                className="absolute top-0 left-0 h-full w-full"
                                                                                loading="lazy"
                                                                                onError={(e) => {
                                                                                    console.error('YouTube iframe error:', e);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()
                                                    )}
                                                    {post.Poster && post.Poster.length > 1 && (
                                                        <div>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                {post.Poster.slice(1, 10).map((image, index) => (
                                                                    <div key={index} className="group overflow-hidden rounded-lg">
                                                                        <img
                                                                            src={`/storage/${image}`}
                                                                            alt={`Additional Image ${index + 2}`}
                                                                            className="h-32 w-full cursor-zoom-in rounded-lg object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                                                                            onClick={() => openLightbox(`/storage/${image}`)}
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div>
                                                        {/* Meta Information */}
                                                        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                                            <div>
                                                                <span className="font-medium">Posted:</span> {post.posted_date}
                                                            </div>
                                                            {post.entry_type === 'career_post' && post.closing_date && (
                                                                <div>
                                                                    <span className="font-medium">Closing Date:</span> {post.closing_date}
                                                                </div>
                                                            )}
                                                            {post.career && (
                                                                <div>
                                                                    <span className="font-medium">Career:</span> {post.career}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Additional Images Grid */}
                                                </div>
                                            ) : null}

                                            {/* Description */}
                                            <div>
                                                <h3 className="mb-3 text-xl font-semibold">Description</h3>
                                                <div
                                                    className="prose prose-lg desc-html max-w-none text-justify text-gray-700"
                                                    dangerouslySetInnerHTML={{ __html: sanitizeHtmlForDisplay(post.description) }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                <div className="flex items-center text-sm text-gray-600">
                                    <BarChart3 className="mr-2 h-4 w-4" />
                                    Views: <span className="ml-1 font-semibold">{views}</span>
                                </div>
                            </div>

                            {/* Right Column - Sidebar */}
                            <div className="space-y-6">
                                {/* Transparency + FOI Logos */}
                                <Card>
                                    <CardContent className="flex items-center justify-center p-4">
                                        <img src="/img/transparency-seal.png" alt="Transparency Seal" className="mx-2 h-28" />
                                        <img src="/FIP.png" alt="FIP" className="mx-2 h-31" />
                                    </CardContent>
                                </Card>

                                {/* Calendar */}
                                <Card>
                                    <CardContent className="flex justify-center p-4">
                                        <div className="w-full max-w-xs">
                                            <Calendar
                                                mode="single"
                                                className="mx-auto w-full"
                                                selected={postedDate}
                                                defaultMonth={postedDate}
                                                onSelect={() => {}}
                                                classNames={{ today: '' }}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                                {/* Extra space */}
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
            <AppFooter />

            {/* Lightbox Dialog */}
            <Dialog
                open={lightboxOpen}
                onOpenChange={(open) => {
                    if (!open) closeLightbox();
                }}
            >
                <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-[90vw]">
                    <DialogTitle className="sr-only">Full size image preview</DialogTitle>
                    <DialogDescription className="sr-only">Viewing full size image</DialogDescription>
                    {lightboxSrc && <img src={lightboxSrc} alt="Full Image Preview" className="mx-auto max-h-[90vh] w-auto rounded-lg" />}
                </DialogContent>
            </Dialog>
        </>
    );
}
