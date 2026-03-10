import AppFooter from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type HEIData } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowUpDown, BarChart3, Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Recognized Programs',
        href: '/recognizedprograms',
    },
];

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

export default function RecognizedPrograms() {
    const [data, setData] = useState<HEIData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<keyof HEIData>('instName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState<string>('');
    const [views, setViews] = useState<number>(0);

    // Fetch HEI data from API
    function fetchHEIData() {
        setIsLoading(true);
        setErrorMessage(null);
        
        fetch('/recognized-programs', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
            .then(async (res) => {
                if (!res.ok) {
                    try {
                        const errorData = await res.json();
                        console.error('API Error Details:', errorData);
                        if (errorData.debug_error) {
                            // Throw the specific debug error so it shows in the UI/Console
                            throw new Error(errorData.debug_error);
                        }
                    } catch (e) {
                        // If parsing fails, just fall through to generic error
                    }
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((json) => {
                if (Array.isArray(json)) {
                    setData(json);
                } else {
                    setData([]);
                }
            })
            .catch((err) => {
                console.error('Error fetching recognized programs:', err);
                setData([]);
                setErrorMessage('Unable to load data. Please try again later.');
            })
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        fetchHEIData();
    }, []);

    // Track views
    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'X-CSRF-TOKEN': getCsrfToken(), 
                'Accept': 'application/json' 
            },
            body: JSON.stringify({ page: 'recognized-programs' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=recognized-programs', {
                headers: { 'Accept': 'application/json' },
            }))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => setViews(0));
    }, []);

    // Filter and sort data
    const filteredData = useMemo(() => {
        if (!search.trim()) {
            return data;
        }
        
        const query = search.toLowerCase();
        return data.filter((item) =>
            [item.instName, item.region, item.instType, item.province, item.municipality]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(query))
        );
    }, [data, search]);

    const sortedData = useMemo(() => {
        const copy = [...filteredData];
        copy.sort((a, b) => {
            const av = (a[sortKey] ?? '') as string;
            const bv = (b[sortKey] ?? '') as string;
            return sortDir === 'asc' 
                ? String(av).localeCompare(String(bv)) 
                : String(bv).localeCompare(String(av));
        });
        return copy;
    }, [filteredData, sortKey, sortDir]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    function toggleSort(key: keyof HEIData) {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    }

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Recognized Programs" />

                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    <div className="mx-w-5 container flex min-h-[10px] items-center justify-between border-b dark:bg-blend-color">
                        <header className="mb-4">
                            <h1 className="text-2xl font-bold">Recognized Programs Per Higher Education Institution in Region XII</h1>
                        </header>
                    </div>

                    {/* Controls */}
                    <div className="mx-w-5 container mt-4 flex flex-col gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search institution, province, type..."
                                    className="w-64 rounded border px-3 py-2 text-sm"
                                />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="inline-flex items-center gap-2">
                                            <Download className="h-4 w-4" /> Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-44">
                                        <DropdownMenuItem onClick={() => window.open('/recognized-programs/export/pdf', '_blank')}>
                                            Export as PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.open('/recognized-programs/export/xlsx', '_blank')}>
                                            Export as Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm">Rows:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="rounded border px-2 py-1 text-sm"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mx-w-5 container py-6">
                        {isLoading && (
                            <div className="mb-4 rounded border border-gray-200 bg-gray-50 px-3 py-8 text-center text-sm text-gray-700">
                                Loading data...
                            </div>
                        )}

                        {!isLoading && errorMessage && (
                            <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        {!isLoading && !errorMessage && data.length === 0 && (
                            <div className="mb-4 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                                No data available at the moment.
                            </div>
                        )}

                        {!isLoading && !errorMessage && data.length > 0 && (
                            <>
                                <div className="overflow-x-auto rounded-sm border">
                                    <Table className="rounded-sm">
                                        <TableCaption>A list of all HEIs in Region XII.</TableCaption>
                                        <TableHeader className="bg-blue-200 text-white">
                                            <TableRow>
                                                <TableHead>
                                                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort('instName')}>
                                                        Institution Name <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </TableHead>
                                                <TableHead>
                                                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort('region')}>
                                                        Region <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </TableHead>
                                                <TableHead>
                                                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort('instType')}>
                                                        Institution Type <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </TableHead>
                                                <TableHead>
                                                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort('province')}>
                                                        Province <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </TableHead>
                                                <TableHead>
                                                    <button className="inline-flex items-center gap-1" onClick={() => toggleSort('municipality')}>
                                                        Municipality <ArrowUpDown className="h-3 w-3" />
                                                    </button>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pageData.map((item, index) => (
                                                <TableRow key={`${item.instCode}-${index}`}>
                                                    <TableCell className="font-medium">{item.instName}</TableCell>
                                                    <TableCell>{item.region || 'N/A'}</TableCell>
                                                    <TableCell>{item.instType || 'N/A'}</TableCell>
                                                    <TableCell>{item.province || 'N/A'}</TableCell>
                                                    <TableCell>{item.municipality || 'N/A'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm">
                                        Page {currentPage} of {totalPages} • {sortedData.length} items
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" onClick={() => setPage(1)} disabled={currentPage === 1}>
                                            First
                                        </Button>
                                        <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                            Prev
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                        <Button variant="outline" onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>
                                            Last
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Views: <span className="ml-1 font-semibold">{views}</span>
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
