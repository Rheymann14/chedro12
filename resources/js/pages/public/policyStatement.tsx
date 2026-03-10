import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { policyStatement } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quality Policy Statement',
        href: policyStatement().url,
    },
];

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

export default function PolicyStatement() {
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: 'policyStatement' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=policyStatement'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Quality Policy Statement" />

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />
                    <div className="mx-w-5 container flex min-h-[10px] items-center border-b p-2 dark:bg-blend-color">
                        <header className="">
                            <h1 className="text-2xl font-bold">QUALITY POLICY STATEMENT</h1>
                        </header>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-2 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-4 md:col-span-2">
                            <Card className="max-w-5xl border-none shadow-none">
                                <CardContent className="max-h-[600px] overflow-y-auto p-2">
                                    <p>
                                        {'We, at the Commission on Higher Education (CHED), shall lead the  Philippine higher education sector to:'}
                                    </p>
                                    <br />
                                    <ul className="list-disc pl-6">
                                        <li className="ps-2 text-justify not-italic">
                                            <strong>C</strong>
                                            {
                                                'ultivate an equitable and sustainable higher education landscape that produces locally responsive, innovative, globally competitive graduates, and life long learners;'
                                            }
                                        </li>
                                        <li className="ps-2 text-justify not-italic">
                                            <strong>H</strong>
                                            {
                                                'armonize mandates to promote inclusive access to higher education, ensure sustainable quality assurance of programs, and assert relevance of institutions;'
                                            }
                                        </li>
                                        <li className="ps-2 text-justify not-italic">
                                            <strong>E</strong>
                                            {
                                                'xemplify resilience and humility in service, integrity, excellence, and development-driven mindset; and,'
                                            }
                                        </li>
                                        <li className="ps-2 text-justify not-italic">
                                            <strong>D</strong>
                                            {
                                                'emonstrate commitment to fulfill statutory and regulatory requirements to maintain and achieve continual improvement in our Quality Management System to achieve our vision.'
                                            }
                                        </li>
                                    </ul>
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
                                    <img src="/FIP.png" alt="/build/FIP.png" className="mx-2 h-31" />
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
