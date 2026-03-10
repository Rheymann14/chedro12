import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { visionMission } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vision and Mission',
        href: visionMission().url,
    },
];

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

export default function VisionMission() {
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: 'visionMission' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=visionMission'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Vision and Mission" />

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />
                    <div className="mx-w-5 container flex min-h-[10px] items-center border-b p-2 dark:bg-blend-color">
                        <header className="">
                            <h1 className="text-2xl font-bold">VISION AND MISION</h1>
                        </header>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-2 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-4 md:col-span-2">
                            <Card className="max-w-5xl border-none shadow-none">
                                <CardContent className="max-h-[600px] overflow-y-auto p-2">
                                    <h1 className="text-2xl font-bold">VISION</h1>

                                    <p className="mt-2 text-justify not-italic">
                                        {
                                            'A Philippine Higher Education system that is accessible, equitable and produces locally responsive, innovative and global competitive graduates and lifelong learners.'
                                        }
                                    </p>
                                    <h1 className="mt-4 text-2xl font-bold">MISSION</h1>

                                    <p className="mt-2 text-justify not-italic">
                                        {
                                            'To promote equitable access and ensure quality and relevance of higher education institution and their program.'
                                        }
                                    </p>
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
                        </div>
                    </div>
                    <div>
                        <Card className="border-none shadow-none">
                            <CardContent className="flex h-100 justify-center p-4"></CardContent>
                        </Card>
                    </div>
                    <TotalViewsCounter />
                </div>
            </AppLayout>
            <AppFooter />
        </>
    );
}
