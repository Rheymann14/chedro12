import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

interface AppHeaderLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

export default function AppHeaderLayout({ children, breadcrumbs, searchTerm, onSearchChange }: AppHeaderLayoutProps) {
    return (
        <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} searchTerm={searchTerm} onSearchChange={onSearchChange} />
            <AppContent>{children}</AppContent>
        </AppShell>
    );
}
