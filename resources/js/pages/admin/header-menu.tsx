import { AppHeaderMenuAdmin } from '@/components/app-header-menu-admin';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function HeaderMenuAdmin() {
    return (
        <AppLayout>
            <Head title="Header Menu Management" />
            <div className="container mx-auto px-4 py-6">
                <Heading title="Header Menu Management" description="Manage the navigation menu items in the header. Drag and drop to reorder." />
                <div className="mt-6">
                    <AppHeaderMenuAdmin />
                </div>
            </div>
        </AppLayout>
    );
}

