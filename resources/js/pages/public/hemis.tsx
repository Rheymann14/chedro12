import AppFooter from '@/components/app-footer';
import DynamicMenuApi from '@/components/examples/DynamicMenuApi';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { hemis } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BarChart3, PieChart } from 'lucide-react';
import { useEffect, useState } from 'react';

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'HEMIS',
        href: hemis().url,
    },
];

// Dynamic menu will be API-backed per page; no local defaults

export default function HEMIS() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({ page: 'hemis' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=hemis'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="HEMIS" />

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    {/* Page Header */}
                    <div className="mx-w-5 container flex min-h-[10px] items-center border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-2xl font-bold">HEMIS</h1>
                        </header>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 gap-6 pt-2 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-4 md:col-span-2">
                            {/* API-backed Dynamic Menu scoped to 'hemis' */}
                            <DynamicMenuApi isAdmin={auth?.user?.role === 'admin'} namespaceKey="hemis" />

                            {/* Views Counter */}
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
                                    <img src="/FIP.png" alt="FIP Logo" className="mx-2 h-31" />
                                </CardContent>
                            </Card>

                            {/* Calendar */}
                            <Card>
                                <CardContent className="flex justify-center p-4">
                                    <div className="w-full max-w-xs">
                                        <Calendar mode="single" className="mx-auto w-full" />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Extra spacer */}
                            <Card className="border-none shadow-none">
                                <CardContent className="flex h-100 justify-center p-4"></CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Bottom View Counter */}
                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-center dark:bg-blend-color">
                        <TotalViewsCounter />
                    </div>
                </div>
            </AppLayout>
            <AppFooter />
        </>
    );
}
