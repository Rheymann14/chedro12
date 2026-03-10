import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { historicalBackground } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Historical Background',
        href: historicalBackground().url,
    },
];

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

export default function HistoricalBackground() {
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: 'historicalBackground' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=historicalBackground'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Historical Background" />

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />
                    <div className="mx-w-5 container flex min-h-[10px] items-center border-b p-2 dark:bg-blend-color">
                        <header className="">
                            <h1 className="text-2xl font-bold">HISTORICAL BACKGROUND</h1>
                        </header>
                    </div>

                    <div className="grid grid-cols-1 gap-6 p-2 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-4 md:col-span-2">
                            <Card className="max-w-5xl border-none shadow-none">
                                <CardContent className="max-h-[600px] overflow-y-auto p-2">
                                    <p className="text-justify not-italic">
                                        {'The Commission on Higher Education (CHED)  was created on May 18, 1994 through the passage of '}
                                        <a
                                            href="https://ched.gov.ph/wp-content/uploads/2017/05/Republic-Act-7722.pdf"
                                            className="text-justify text-blue-600"
                                        >
                                            {'Republic Act 7722'},
                                        </a>
                                        {
                                            ' or the Higher Education Act of 1994. CHED, an attached agency to the Office of the President for administrative purposes, is headed by a chairperson and four commissioners, each having a term of office of four years. The Commission En Banc  acts as a collegial body in formulating plans, policies and strategies relating to higher education and the operation of CHED.'
                                        }
                                    </p>
                                    <br />
                                    <p className="text-justify not-italic">
                                        {
                                            'The creation of CHED was part of a broad agenda of reforms on the country’s education system outlined by the Congressional Commission on Education (EDCOM) in 1992. Part of the reforms was the trifocalization of the education sector into three governing bodies: the CHED for tertiary and graduate education, the Department of Education (DepEd) for basic education and the Technical Education and Skills Development Authority (TESDA) for technical-vocational and middle-level education.'
                                        }
                                    </p>
                                    <br />
                                    <p className="text-justify">
                                        {'In 1997, '}
                                        <a
                                            href="https://ched.gov.ph/wp-content/uploads/2017/05/Republic-Act-No.-8292-The-Higher-Education-Modernization-Act-of-1997.pdf"
                                            className="text-justify text-blue-600"
                                        >
                                            {'Republic Act (RA) No. 8292,'}
                                        </a>
                                        {
                                            ' otherwise known as the “Higher Education Modernization Act of 1997” was passed to establish a complete, adequate and integrated system of higher education. The said law also modified and made uniform the composition of the Governing Boards of chartered state universities and colleges (SUCs) nationwide in order to:(a) achieve a more coordinated and integrated system of higher education;(b) render them more effective in the formulation and implementation of policies on higher education;(c) provide for more relevant direction in their governance; and (d) ensure the enjoyment of academic freedom as guaranteed by the Constitution.'
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
