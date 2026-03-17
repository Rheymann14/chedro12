import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '#',
    },
    {
        title: 'Contact Settings',
        href: '/admin/contact-settings',
    },
];

type ContactSettingsForm = {
    official_email: string;
    facebook_page: string;
    office_address: string;
    director_name: string;
    director_position: string;
    director_office: string;
    director_address: string;
};

export default function ContactSettingsAdmin({ contactSettings }: { contactSettings: ContactSettingsForm }) {
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm<ContactSettingsForm>(contactSettings);

    const submit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put('/admin/contact-settings');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contact Settings" />

            <div className="container mx-auto px-4 py-6">
                <Heading title="Contact Settings" description="Update the public contact information shown on the Contact Us page." />

                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="official_email">Official Email Address</Label>
                                <Input
                                    id="official_email"
                                    type="email"
                                    value={data.official_email}
                                    onChange={(e) => setData('official_email', e.target.value)}
                                />
                                <InputError message={errors.official_email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="facebook_page">Facebook Page</Label>
                                <Input
                                    id="facebook_page"
                                    value={data.facebook_page}
                                    onChange={(e) => setData('facebook_page', e.target.value)}
                                />
                                <InputError message={errors.facebook_page} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="office_address">Office Address</Label>
                                <Textarea
                                    id="office_address"
                                    value={data.office_address}
                                    onChange={(e) => setData('office_address', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.office_address} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="director_name">Director Name</Label>
                                <Input
                                    id="director_name"
                                    value={data.director_name}
                                    onChange={(e) => setData('director_name', e.target.value)}
                                />
                                <InputError message={errors.director_name} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="director_position">Director Position</Label>
                                    <Input
                                        id="director_position"
                                        value={data.director_position}
                                        onChange={(e) => setData('director_position', e.target.value)}
                                    />
                                    <InputError message={errors.director_position} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="director_office">Director Office</Label>
                                    <Input
                                        id="director_office"
                                        value={data.director_office}
                                        onChange={(e) => setData('director_office', e.target.value)}
                                    />
                                    <InputError message={errors.director_office} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="director_address">Director Address</Label>
                                <Textarea
                                    id="director_address"
                                    value={data.director_address}
                                    onChange={(e) => setData('director_address', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.director_address} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Contact Details'}
                                </Button>
                                {recentlySuccessful && <p className="text-sm text-neutral-600">Saved</p>}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
