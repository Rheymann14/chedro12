import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cavApplication } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'CAV Application',
        href: cavApplication().url,
    },
];

export default function AboutUs() {
    const [views, setViews] = useState<number>(0);

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: 'cav-application' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=cav-application'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Online Services" />

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />
                    <div className="container mx-auto flex min-h-[10px] items-center border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">CAV APPLICATION</h1>
                        </header>
                    </div>

                    <div className="mt-2 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-4 lg:col-span-2">
                            <h3 className="text-lg font-bold sm:text-xl">STEP 1: ACCOUNT REGISTRATION</h3>
                            <ol className="ml-2 list-inside list-decimal text-sm text-black sm:text-base">
                                <li className="mb-2">
                                    Go to URL:{' '}
                                    <a
                                        href="https://ecav.ched.gov.ph/home"
                                        className="break-all text-blue-700 underline-offset-1 hover:underline sm:break-normal"
                                    >
                                        https://ecav.ched.gov.ph/home
                                    </a>
                                </li>
                                <li className="mb-2">
                                    Click the <span className="font-bold">"Apply for eCAV"</span> button.
                                </li>
                                <li className="mb-2">
                                    You will be redirected to the <span className="font-bold">CHED One Touch Login Page.</span>
                                </li>
                                <li className="mb-2">
                                    Click the <span className="font-bold">"Sign Up" </span>link below and fill in all required fields, and click the{' '}
                                    <span className="font-bold">"Sign up"</span> button.
                                </li>
                                <li className="mb-2">
                                    Click the eCAV <span className="font-bold">"Access" </span>button.
                                </li>
                                <li className="mb-2">
                                    Click the <span className="font-bold">"Authorize" </span> Button to proceed.
                                </li>
                                <li className="mb-2">You will need to complete the registration process by filling in the required fields.</li>
                                <li className="mb-2">
                                    Select <span className="font-bold">"Applicant/Graduate/Student" </span> as your user type.
                                </li>
                                <li className="mb-2">Once complete, click the Complete registration button.</li>
                            </ol>

                            {/* Image Grid - Responsive */}
                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-gray-200 p-2 sm:h-[300px] md:h-[350px] lg:h-[400px]">
                                    <img src="/img/img1.png" alt="Step 1 Image" className="h-auto max-h-full max-w-full object-contain" />
                                </div>
                                <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-gray-200 p-2 sm:h-[300px] md:h-[350px] lg:h-[400px]">
                                    <img src="/img/img2.png" alt="Step 2 Image" className="h-auto max-h-full max-w-full object-contain" />
                                </div>
                                <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-gray-200 p-2 sm:h-[300px] md:h-[350px] lg:h-[400px]">
                                    <img src="/img/img3.jpg" alt="Step 3 Image" className="h-auto max-h-full max-w-full object-contain" />
                                </div>
                                <div className="flex h-[250px] w-full items-center justify-center rounded-lg border border-gray-200 p-2 sm:h-[300px] md:h-[350px] lg:h-[400px]">
                                    <img src="/img/img4.jpg" alt="Step 4 Image" className="h-auto max-h-full max-w-full object-contain" />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold sm:text-xl">STEP 2: ECAV EVALUATION</h3>
                            <ol className="ml-2 list-inside list-decimal text-sm text-black sm:text-base">
                                <li className="mb-2">
                                    Click the <span className="font-bold">"My Applications"</span> tab.
                                </li>
                                <li className="mb-2">
                                    Click the <span className="font-bold">"New Application"</span> button.
                                </li>
                                <li className="mb-2">Read the reminders/guidelines, and click checkbox.</li>
                                <li className="mb-2">
                                    Click the <span className="font-bold">"Continue" </span>button.
                                </li>
                                <li className="mb-2">Fill in all the required fields..</li>
                                <li className="mb-2">Review the application before submitting it.</li>
                            </ol>

                            <div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-gray-200 p-2 sm:h-[250px] md:h-[300px]">
                                <img src="/img/ecav2.png" alt="Step 2 Image" className="h-auto max-h-full max-w-full object-contain" />
                            </div>

                            <h3 className="text-lg font-bold sm:text-xl">STEP 3: PAYMENT</h3>
                            <ol className="ml-2 list-inside list-decimal text-sm text-black sm:text-base">
                                <li className="mb-2">
                                    Select the <span className="font-bold">"Landbank"</span> to proceed.
                                </li>
                                <li className="mb-2">
                                    Click the <span className="font-bold">"Pay now"</span> button.
                                </li>
                                <li className="mb-2">
                                    You will be redirected to the <span className="font-bold">"Link.BizPortal"</span> to complete the payment..
                                </li>
                                <li className="mb-2">Select your payment mode(Landbank, ATM, Gcash, ShopeePay, etc.).</li>
                                <li className="mb-2">Authorize the transaction using ATM PIN, One-Time Password (OTP) or MPIN.</li>
                                <li className="mb-2">View/Print Payment Confirmation Receipt or EOR.</li>
                            </ol>
                            <div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-gray-200 p-2 sm:h-[250px] md:h-[300px] lg:h-[350px]">
                                <img src="/img/pay1.png" alt="Step 3 Image" className="h-auto max-h-full max-w-full object-contain" />
                            </div>

                            {/* Views */}
                            <div className="flex items-center text-sm text-gray-600">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Views: <span className="ml-1 font-semibold">{views}</span>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4 lg:space-y-6">
                            {/* Transparency + FOI Logos */}
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center p-4 sm:flex-row">
                                    <img src="/img/transparency-seal.png" alt="Transparency Seal" className="mx-2 h-20 w-auto sm:h-24 lg:h-28" />
                                    <img src="/FIP.png" alt="FIP Logo" className="mx-2 h-20 w-auto sm:h-24 lg:h-28" />
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
                                <CardContent className="flex h-20 justify-center p-4 lg:h-24"></CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="container mx-auto flex min-h-[10px] items-center justify-center dark:bg-blend-color">
                        <TotalViewsCounter />
                    </div>
                </div>
            </AppLayout>
            <AppFooter />
        </>
    );
}
