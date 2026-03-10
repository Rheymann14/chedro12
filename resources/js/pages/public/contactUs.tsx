import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { contactUs } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
const getCsrfToken = () => (document.querySelector('meta[name=\"csrf-token\"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'contact us',
        href: contactUs().url,
    },
];

export default function ContactUs() {
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': getCsrfToken() },
            body: JSON.stringify({ page: 'contact-us' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=contact-us'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Contact Us" />

                {/**Header*/}
                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    <div className="mx-w-5 container flex min-h-[10px] items-center border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-2xl font-bold">CONTACT US</h1>
                        </header>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {/* Left Column */}
                        <div className="mt-2 md:col-span-2">
                            <p>If you have any questions or concerns, here’s    how you may contact us:</p>
                            <br />
                            <p>
                                <strong>Official Email Address:</strong> chedro12@ched.gov.ph
                            </p>
                            <p>
                                <strong>Facebook Page:</strong> N/A
                            </p>
                            <p>
                                <strong>Address:</strong>Regional Center, Brgy. Carpenter Hill, Koronadal, Philippines
                            </p>
                            <br />
                            <p>For all communications, you may address it to our regional director:</p>
                            <br />
                            <p>
                                <strong>Rody P. Garcia, MDM, JD, EdD</strong>
                            </p>
                            <p>Regional Director</p>
                            <p>CHED Region XII</p>
                            <p>Regional Center, Brgy. Carpenter Hill, Koronadal, Philippines</p>

                            {/* Views */}
                            <div className="flex items-center pt-4 text-sm text-gray-600">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Views: <span className="ml-1 font-semibold">{views}</span>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 pt-2">
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

                            {/*extra border line*/}
                            <Card className="border-none shadow-none">
                                <CardContent className="flex h-100 justify-center p-4"></CardContent>
                            </Card>
                        </div>
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
