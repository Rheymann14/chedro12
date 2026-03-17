import { Breadcrumbs } from '@/components/breadcrumbs';
import { CareerPostSearch } from '@/components/career-post-search';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import {
    about,
    careerPost,
    cavApplication,
    resources,
    contactUs,
    dashboard,
    hemis,
    historicalBackground,
    login,
    mandate,
    onlineServices,
    policyStatement,
    postings,
    recognizedprograms,
    statistics,
    visionMission,
} from '@/routes';
import admin from '@/routes/admin';
import user from '@/routes/user';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowRightIcon, Contact2Icon, Folder, HandCoinsIcon, House, LayoutGrid, LogIn, LucideMessageCircleQuestion, Menu, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type HeaderMenuItem = {
    id: string;
    title: string;
    href: string;
    order: number;
};

// Default fallback items if API fails
const defaultNavItems: NavItem[] = [
    /*
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'About us',
        href: about(),
    },
    {
        title: 'Online Services',
        href: onlineServices(),
    },
    {
        title: 'HEMIS',
        href: hemis(),
    },
    {
        title: 'Resources',
        href: resources(),
    },
    {
        title: 'Career Postings',
        href: careerPost(),
    },
    {
        title: 'Contact us',
        href: contactUs(),
    },
    */
];

// Helper function to check if a URL is external
const isExternalUrl = (href: string | { url: string }): boolean => {
    const url = typeof href === 'string' ? href : href.url;
    if (!url) return false;
    try {
        const urlObj = new URL(url, window.location.origin);
        return urlObj.origin !== window.location.origin;
    } catch {
        // If URL parsing fails, assume it's internal if it starts with /
        return !url.startsWith('/');
    }
};

const normalizeUrlPath = (href: string): string => {
    if (!href) return '/';

    try {
        const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
        const url = new URL(href, base);
        const path = url.pathname.replace(/\/+$/, '') || '/';

        return path.toLowerCase().replace(/^\/public(?=\/|$)/, '') || '/';
    } catch {
        const path = href.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/';

        return path.toLowerCase().replace(/^\/public(?=\/|$)/, '') || '/';
    }
};

const isActiveNavItem = (currentPath: string, href: string): boolean => {
    const itemPath = normalizeUrlPath(href);

    if (itemPath === '/') {
        return currentPath === '/';
    }

    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
};

// Convert API menu items to NavItem format
const convertToNavItems = (apiItems: HeaderMenuItem[]): NavItem[] => {
    return apiItems
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => ({
            title: item.title,
            href: item.href,
        }));
};

// Navigation items for authenticated users (update routes for Postings and Career Postings)
const getAuthenticatedNavItems = (baseItems: NavItem[], userRole?: string): NavItem[] => {
    const items = [...baseItems];

    // Update Postings route for authenticated users (if it exists in menu)
    const postingsIndex = items.findIndex((item) => item.title === 'Postings');
    if (postingsIndex !== -1) {
        if (userRole === 'admin') {
            items[postingsIndex] = {
                title: 'Postings',
                href: admin.postings(),
            };
        } else {
            items[postingsIndex] = {
                title: 'Postings',
                href: user.postings(),
            };
        }
    }

    // Update Career Postings route for authenticated users
    const careerPostIndex = items.findIndex((item) => item.title === 'Career Postings');
    if (careerPostIndex !== -1) {
        if (userRole === 'admin') {
            items[careerPostIndex] = {
                title: 'Career Postings',
                href: admin.careerPost(),
            };
        } else {
            items[careerPostIndex] = {
                title: 'Career Postings',
                href: user.careerPost(),
            };
        }
    }

    return items;
};

const rightNavItems: NavItem[] = [

];

const activeItemStyles = 'bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

export function AppHeader({ breadcrumbs = [], searchTerm = '', onSearchChange = () => {} }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [headerMenuItems, setHeaderMenuItems] = useState<HeaderMenuItem[]>([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);

    // Fetch header menu items from API
    useEffect(() => {
        const fetchHeaderMenu = async () => {
            try {
                const res = await fetch('/api/app-header-menu', { credentials: 'same-origin' });
                const json = await res.json();
                if (Array.isArray(json.items) && json.items.length > 0) {
                    setHeaderMenuItems(json.items);
                } else {
                    // API should always return defaults, but fallback to empty if something goes wrong
                    setHeaderMenuItems([]);
                }
            } catch (error) {
                console.error('Error fetching header menu:', error);
                // On error, use fallback defaults
                setHeaderMenuItems([]);
            } finally {
                setIsLoadingMenu(false);
            }
        };

        fetchHeaderMenu();
    }, []);

    // Get base navigation items (from API, which now includes defaults, or fallback to hardcoded defaults)
    const baseNavItems = headerMenuItems.length > 0 ? convertToNavItems(headerMenuItems) : defaultNavItems;

    // Get navigation items based on authentication status
    const mainNavItems = auth?.user ? getAuthenticatedNavItems(baseNavItems, auth.user.role) : baseNavItems;

    const toUrl = (value: unknown): string => {
        if (typeof value === 'string') return value;
        if (value && typeof value === 'object' && 'url' in (value as Record<string, unknown>)) {
            const maybe = (value as { url?: unknown }).url;
            return typeof maybe === 'string' ? maybe : '';
        }
        return '';
    };

    const isCareerPostPage = [careerPost().url, toUrl(admin.careerPost()), toUrl(user.careerPost())]
        .filter(Boolean)
        .some((u) => page.url.startsWith(u));
    const isPostingsPage = [postings().url, toUrl(admin.postings()), toUrl(user.postings())].filter(Boolean).some((u) => page.url.startsWith(u));
    const isDashboardPage = page.url === '/' || page.url.startsWith(toUrl(dashboard()));
    const currentPath = normalizeUrlPath(page.url);
    return (
        <>
           
            <div className="sticky top-0 z-50 border-b border-sidebar-border/80 bg-white ">
            
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-10xl">
                
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetHeader className="flex justify-start text-left">
                                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                    <SheetDescription className="sr-only">Mobile navigation menu for site navigation</SheetDescription>
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => {
                                                const href = typeof item.href === 'string' ? item.href : item.href.url;
                                                const isExternal = isExternalUrl(item.href);
                                                const isActive = isActiveNavItem(currentPath, href);
                                                
                                                if (isExternal) {
                                                    return (
                                                        <a
                                                            key={item.title}
                                                            href={href}
                                                            className="flex items-center space-x-2 font-medium"
                                                        >
                                                            {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                            <span>{item.title}</span>
                                                        </a>
                                                    );
                                                }
                                                
                                                return (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className={cn(
                                                            'flex items-center space-x-2 rounded-md px-3 py-2 font-medium transition-colors',
                                                            isActive && activeItemStyles,
                                                        )}
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                );
                                            })} 
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={typeof item.href === 'string' ? item.href : item.href.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href={dashboard()} prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-2 hidden h-full flex-1 items-center lg:flex">
                        <NavigationMenu className="flex h-full flex-1 items-stretch justify-start">
                            <NavigationMenuList className="flex h-full items-stretch justify-start space-x-1">
                                {mainNavItems.map((item, index) => {
                                    const href = typeof item.href === 'string' ? item.href : item.href.url;
                                    const isExternal = isExternalUrl(item.href);
                                    const isActive = isActiveNavItem(currentPath, href);
                                    
                                    return (
                                        <NavigationMenuItem key={index} className="relative flex h-full items-center ">
                                            <>
                                                {isExternal ? (
                                                    <a
                                                        href={href}
                                                        className={cn(
                                                            navigationMenuTriggerStyle(),
                                                            'h-9 cursor-pointer px-2 text-sm',
                                                        )}
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                        {item.title}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className={cn(
                                                            navigationMenuTriggerStyle(),
                                                            isActive && activeItemStyles,
                                                            'h-9 cursor-pointer px-3 text-sm transition-colors',
                                                        )}
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                        {item.title}
                                                    </Link>
                                                )}
                                                {isActive && (
                                                    <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-blue-600 dark:bg-blue-300"></div>
                                                )}
                                            </>
                                        </NavigationMenuItem>
                                    );
                                })}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-2 flex shrink-0 items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            {isCareerPostPage || isPostingsPage || isDashboardPage ? (
                                <CareerPostSearch
                                    searchTerm={searchTerm}
                                    onSearchChange={onSearchChange}
                                    isVisible={isSearchVisible}
                                    onToggle={() => setIsSearchVisible((v) => !v)}
                                />
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="group h-9 w-9 cursor-pointer"
                                    onClick={() => setIsSearchVisible((v) => !v)}
                                >
                                    <Search className="!size-5 opacity-80 group-hover:opacity-100" />
                                </Button>
                            )}
                            <div className="hidden lg:flex">
                                {rightNavItems.map((item) => (
                                    <TooltipProvider key={item.title} delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <a
                                                    href={typeof item.href === 'string' ? item.href : item.href.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md bg-transparent p-0 text-sm font-medium text-accent-foreground ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                                                >
                                                    <span className="sr-only">{item.title}</span>
                                                    {item.icon && <Icon iconNode={item.icon} className="size-5 opacity-80 group-hover:opacity-100" />}
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{item.title}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ))}
                            </div>
                        </div>
                        {auth?.user && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="size-10 rounded-full p-1">
                                        <Avatar className="size-8 overflow-hidden rounded-full">
                                            <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                            <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                                {getInitials(auth.user?.name || '')}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    {!auth?.user && (
                            <Button onClick={() => router.visit(login().url)} className="flex items-center justify-center bg-white text-black hover:bg-gray-100">
                                <LogIn className="size-4" />
                                <span>Login</span>
                            </Button>
                        )}
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/70">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
