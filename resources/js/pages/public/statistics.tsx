import AppFooter from '@/components/app-footer';
import AppLayout from '@/layouts/app-layout';
import { statistics } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
const getCsrfToken = () => (document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Statistics',
        href: statistics().url,
    },
];

export default function AboutUs() {
    const [views, setViews] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('/views/track', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() }, body: JSON.stringify({ page: 'statistics' }), credentials: 'same-origin' })
            .then(() => fetch('/views/count?page=statistics'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Statistics" />

                <div className='mx-w-5 container p-4'>
                <HeaderLogos />
                <div className="mx-w-5 container flex min-h-[10px] items-center border-b dark:bg-blend-color">
                    <header className="mb-2">
                        <h1 className="text-2xl font-bold">STATISTICS</h1>
                    </header>
                </div>

                <p className='m-2'>
                    <a href="https://chedro12.com/statistics/data-analytics" target="_blank" rel="noopener noreferrer" className="text-blue-600">
                        Click this link to view full page.
                    </a>
                </p>

                <div className="w-full">
                    <div className="relative h-[1000px] w-full ">
                        {isLoading && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-black/40">
                                <div className="flex flex-col items-center gap-3">
                                    <svg className="size-8 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">Loading statistics…</span>
                                </div>
                            </div>
                        )}
                        <iframe
                            src="https://chedro12.com/statistics/data-analytics"
                            className="h-full w-full"
                            onLoad={() => setIsLoading(false)}
                        ></iframe>
                    </div>
                </div>

                {/* Views */}
                <div className="flex items-center text-sm text-gray-600 mt-4">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Views: <span className="ml-1 font-semibold">{views}</span>
                </div>

                <div className="mx-w-5 container flex min-h-[10px] items-center justify-center dark:bg-blend-color">
                        <TotalViewsCounter />
                    </div>
                </div>
            </AppLayout>
            <AppFooter />
        </>
    );
}
