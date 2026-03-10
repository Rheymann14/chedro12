/**
 * Admin Navigation Component
 *
 * Navigation buttons for admin dashboard
 * Provides quick access to admin management functions
 *
 * @fileoverview Admin navigation buttons for dashboard
 * @author Your Name
 * @created 2024
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types/dashboard';
import { Link } from '@inertiajs/react';
import { Award, Edit, Menu, Users } from 'lucide-react';
import React from 'react';

/**
 * Props for AdminNavigation component
 */
interface AdminNavigationProps {
    /** User object containing role information */
    user: User;
}

/**
 * Admin Navigation Component
 *
 * Displays navigation buttons for admin functions
 * Responsive design with shorter labels on mobile
 *
 * @param user - User object with role information
 * @returns JSX element containing admin navigation buttons
 */
export const AdminNavigation: React.FC<AdminNavigationProps> = ({ user }) => {
    // Determine routes based on user role
    const isAdmin = user.role === 'admin';
    const careerPostRoute = isAdmin ? '/admin/careerPost' : '/user/careerPost';
    const postingsRoute = isAdmin ? '/admin/postings' : '/user/postings';
    const awardsCommendationRoute = isAdmin ? '/admin/awardsCommendation' : '/awardsCommendation';

    const [counts, setCounts] = React.useState<{
        careerPosts: number | null;
        postings: number | null;
        awardsCommendations: number | null;
        users: number | null;
        headerMenus: number | null;
    }>({ careerPosts: null, postings: null, awardsCommendations: null, users: null, headerMenus: null });

    React.useEffect(() => {
        let isMounted = true;

        async function fetchHeaderMenus() {
            try {
                const res = await fetch('/api/app-header-menu', { credentials: 'same-origin' });
                if (!res.ok) return;
                const json = await res.json();
                if (!isMounted) return;
                const items = Array.isArray(json.items) ? json.items : [];
                setCounts((c) => ({ ...c, headerMenus: items.length }));
            } catch {}
        }

        async function fetchDashboardCounts() {
            try {
                const res = await fetch('/api/dashboard-counts', { credentials: 'same-origin' });
                if (!res.ok) return;
                const json = await res.json();
                if (!isMounted) return;
                setCounts((c) => ({
                    ...c,
                    careerPosts: typeof json?.careerPosts === 'number' ? json.careerPosts : c.careerPosts,
                    postings: typeof json?.postings === 'number' ? json.postings : c.postings,
                    awardsCommendations: typeof json?.awardsCommendations === 'number' ? json.awardsCommendations : c.awardsCommendations,
                    users: typeof json?.users === 'number' ? json.users : c.users,
                }));
            } catch {}
        }

        fetchHeaderMenus();
        fetchDashboardCounts();
        return () => {
            isMounted = false;
        };
    }, []);

    const display = (value: number | null) => (value ?? 0);

    return (
        <div className="px-4 py-6  ">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Manage Career Posts Card */}
                <Link href={careerPostRoute}>
                    <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Edit className="h-4 w-4" />
                                Career Posts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{display(counts.careerPosts)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Click to manage</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Manage Postings Card */}
                <Link href={postingsRoute}>
                    <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Edit className="h-4 w-4" />
                                Postings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{display(counts.postings)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Click to manage</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Manage Awards & Commendations Card - Available to all authenticated users */}
                <Link href={awardsCommendationRoute}>
                    <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Award className="h-4 w-4" />
                                Awards & Commendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{display(counts.awardsCommendations)}</div>
                            <p className="mt-1 text-xs text-muted-foreground">Click to manage</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* User Management Card - Admin Only */}
                {user.role === 'admin' && (
                    <Link href="/admin/users">
                        <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{display(counts.users)}</div>
                                <p className="mt-1 text-xs text-muted-foreground">Click to manage</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}

                {/* Header Menu Management Card - Admin Only */}
                {user.role === 'admin' && (
                    <Link href="/admin/header-menu">
                        <Card className="cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Menu className="h-4 w-4" />
                                    Header Menu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{display(counts.headerMenus)}</div>
                                <p className="mt-1 text-xs text-muted-foreground">Click to manage</p>
                            </CardContent>
                        </Card>
                    </Link>
                )}
            </div>
        </div>
    );
};
