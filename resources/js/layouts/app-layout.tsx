import AppLayoutTemplate from '@/layouts/app/app-header-layout';
//import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

export default ({ children, breadcrumbs, searchTerm, onSearchChange, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} searchTerm={searchTerm} onSearchChange={onSearchChange} {...props}>
        {children}
    </AppLayoutTemplate>
);
