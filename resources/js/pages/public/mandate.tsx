import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { mandate } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mandate',
        href: mandate().url,
    },
];

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

export default function Mandate() {
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: 'mandate' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=mandate'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Mandate" />
                <div className='mx-w-5 container p-4'>
                <HeaderLogos />
                
                <div className="mx-w-5 container flex min-h-[10px] items-center border-b p-2 dark:bg-blend-color">
                    <header className="">
                        <h1 className="text-2xl font-bold">MANDATE</h1>
                    </header>
                </div>

                <div className="grid grid-cols-1 gap-6 p-2 md:grid-cols-3">
                    {/* Left Column */}
                    <div className="space-y-4 md:col-span-2">
                        <Card className="max-w-5xl border-none shadow-none">
                            <CardContent className="max-h-[600px] overflow-y-auto p-2">
                                <p className="text-justify not-italic">
                                    {
                                        'Given the national government’s commitment to transformational leadership that puts education as the central strategy for investing in the Filipino people, reducing poverty, and building national competitiveness and pursuant to Republic Act 7722, CHED shall:'
                                    }
                                </p>
                                <br />
                                <ul className="list-disc pl-6">
                                    <li className="ps-4 text-justify not-italic">
                                        {
                                            'Promote relevant and quality higher education (i.e. higher education institutions and programs are at par with international standards and graduates and professionals are highly competent and recognized in the international arena);'
                                        }
                                    </li>
                                    <li className="ps-4 text-justify not-italic">
                                        {
                                            'Ensure that quality higher education is accessible to all who seek it particularly those who may not be able to afford it;'
                                        }
                                    </li>
                                    <li className="ps-4 text-justify not-italic">
                                        {
                                            'Guarantee and protect academic freedom for continuing intellectual growth, advancement of learning and research, development of responsible and effective leadership, education of high level professionals, and enrichment of historical and cultural heritages; and'
                                        }
                                    </li>
                                    <li>
                                        {
                                            'Commit to moral ascendancy that eradicates corrupt practices, institutionalizes transparency and accountability and encourages participatory governance in the Commission and the sub-sector.'
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
