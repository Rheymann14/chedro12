import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { contactUs } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BarChart3, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'contact us',
        href: contactUs().url,
    },
];

type ContactSettings = {
    official_email: string;
    facebook_page: string;
    office_address: string;
    director_name: string;
    director_position: string;
    director_office: string;
    director_address: string;
};

type ContactUsPageProps = SharedData & {
    contactSettings: ContactSettings;
};

export default function ContactUs() {
    const [views, setViews] = useState<number>(0);
    const { auth, contactSettings } = usePage<ContactUsPageProps>().props;
    const canManageContactSettings = auth?.user?.role === 'admin';

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

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-between border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-2xl font-bold">CONTACT US</h1>
                        </header>
                        {canManageContactSettings && (
                            <Button asChild className="mb-4 bg-blue-700 text-white hover:bg-blue-800">
                                <Link href="/admin/contact-settings">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit Contact Details
                                </Link>
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="mt-2 md:col-span-2">
                            <p>If you have any questions or concerns, here's how you may contact us:</p>
                            <br />
                            <p>
                                <strong>Official Email Address:</strong> {contactSettings.official_email}
                            </p>
                            <p>
                                <strong>Facebook Page:</strong> {contactSettings.facebook_page}
                            </p>
                            <p>
                                <strong>Address:</strong> {contactSettings.office_address}
                            </p>
                            <br />
                            <p>For all communications, you may address it to our regional director:</p>
                            <br />
                            <p>
                                <strong>{contactSettings.director_name}</strong>
                            </p>
                            <p>{contactSettings.director_position}</p>
                            <p>{contactSettings.director_office}</p>
                            <p>{contactSettings.director_address}</p>

                            <div className="flex items-center pt-4 text-sm text-gray-600">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Views: <span className="ml-1 font-semibold">{views}</span>
                            </div>
                        </div>

                        <div className="space-y-6 pt-2">
                            <Card>
                                <CardContent className="flex items-center justify-center p-4">
                                    <img src="/img/transparency-seal.png" alt="Transparency Seal" className="mx-2 h-28" />
                                    <img src="/FIP.png" alt="/build/FIP.png" className="mx-2 h-31" />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="flex justify-center p-4">
                                    <div className="w-full max-w-xs">
                                        <Calendar mode="single" className="mx-auto w-full" />
                                    </div>
                                </CardContent>
                            </Card>

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
