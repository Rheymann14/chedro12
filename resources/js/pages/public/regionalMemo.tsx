import AppFooter from '@/components/app-footer';
import { HeaderLogos, TotalViewsCounter } from '@/components/global-components/layout';
import CreateIssuanceCard from '@/components/issuances/create-issuance-card';
import EditIssuanceCard from '@/components/issuances/edit-issuance-card';
import { showToast } from '@/utils/toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { regionalMemo } from '@/routes';
import type { SharedData } from '@/types';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { BarChart3, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const getCsrfToken = () => (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Ched Memo',
        href: regionalMemo().url,
    },
];

interface IssuanceYear {
    id: number;
    year: number;
    documents: Array<{
        id: number;
        title: string;
        path: string;
    }>;
}

interface Issuance {
    id: number;
    issuance_type: string;
    view_type: 'public' | 'private';
    years: IssuanceYear[];
}

interface IssuancesPageProps {
    issuances: Record<string, Issuance[]>;
}

export default function ChedMemo() {
    const { auth, issuances } = usePage<SharedData & IssuancesPageProps>().props;
    const [views, setViews] = useState<number>(0);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingIssuance, setEditingIssuance] = useState<Issuance | null>(null);
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [issuancesData, setIssuancesData] = useState(issuances || {});

    // Helper function to group issuances by type
    const groupIssuancesByType = (issuancesList: Issuance[]): Record<string, Issuance[]> => {
        return issuancesList.reduce((grouped, issuance) => {
            if (!grouped[issuance.issuance_type]) {
                grouped[issuance.issuance_type] = [];
            }
            grouped[issuance.issuance_type].push(issuance);
            return grouped;
        }, {} as Record<string, Issuance[]>);
    };

    // Helper function to get all issuances as flat array
    const getAllIssuances = (): Issuance[] => {
        return Object.values(issuancesData).flat();
    };

    const issuanceTypes = Object.keys(issuancesData);
    const selectedIssuances = selectedType ? issuancesData[selectedType] || [] : [];
    const years = useMemo(() => {
        if (!selectedIssuances.length) return [];
        const allYears = new Set<number>();
        selectedIssuances.forEach((issuance) => {
            issuance.years.forEach((year) => allYears.add(year.year));
        });
        return Array.from(allYears).sort((a, b) => b - a);
    }, [selectedIssuances]);

    const yearDocuments = useMemo(() => {
        if (!selectedYear || !selectedIssuances.length) return [];
        return selectedIssuances.flatMap((issuance) =>
            issuance.years
                .filter((year) => year.year === selectedYear)
                .flatMap((year) => year.documents)
        );
    }, [selectedYear, selectedIssuances]);

    const handleEdit = (issuance: Issuance) => {
        setEditingIssuance(issuance);
        setIsEditOpen(true);
    };

    const handleCreateSuccess = (response: unknown) => {
        const data = response as { issuance: Issuance };
        const newIssuance = data.issuance;
        const allIssuances = getAllIssuances();
        allIssuances.push(newIssuance);
        setIssuancesData(groupIssuancesByType(allIssuances));

        // Auto-select the newly created issuance type
        setSelectedType(newIssuance.issuance_type);
        setSelectedYear(null);

        setIsCreateOpen(false);
    };

    const handleUpdateSuccess = (response: unknown) => {
        const data = response as { issuance: Issuance };
        const updatedIssuance = data.issuance;
        const allIssuances = getAllIssuances();
        const updatedIssuances = allIssuances.map((issuance) => (issuance.id === updatedIssuance.id ? updatedIssuance : issuance));
        setIssuancesData(groupIssuancesByType(updatedIssuances));

        // If the issuance type changed, update the selection
        if (selectedType && selectedType !== updatedIssuance.issuance_type) {
            setSelectedType(updatedIssuance.issuance_type);
            setSelectedYear(null);
        }

        setIsEditOpen(false);
        setEditingIssuance(null);
    };

    const handleDelete = async (issuanceId: number) => {
        try {
            await axios.delete(`/issuances/${issuanceId}`);

            // Update local state
            const allIssuances = getAllIssuances();
            const filteredIssuances = allIssuances.filter((issuance) => issuance.id !== issuanceId);
            setIssuancesData(groupIssuancesByType(filteredIssuances));

            // Clear selection if deleted issuance was selected
            if (selectedType) {
                const typeIssuances = issuancesData[selectedType] || [];
                if (typeIssuances.length === 1 && typeIssuances[0].id === issuanceId) {
                    setSelectedType('');
                    setSelectedYear(null);
                }
            }

            showToast('Issuance deleted successfully!', { variant: 'success' });
        } catch (error) {
            showToast('Failed to delete issuance. Please try again.', { variant: 'error' });
        }
    };

    useEffect(() => {
        fetch('/views/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
            },
            body: JSON.stringify({ page: 'chedmemo' }),
            credentials: 'same-origin',
        })
            .then(() => fetch('/views/count?page=chedmemo'))
            .then((r) => r.json())
            .then((j) => setViews(j.count ?? 0))
            .catch(() => {});
    }, []);
    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Regional Memorandum" />

                {/**Header*/}
                <div className="mx-w-5 container p-4">
                    <HeaderLogos />

                    <div className="mx-w-5 container">
                        <div className="flex items-center justify-between border-b border-gray-200 py-6">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">REGIONAL MEMORANDUMS</h1>
                                </div>
                            </div>
                            {auth?.user && (
                                <Button
                                    className="h-auto bg-blue-600 px-6 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
                                    onClick={() => setIsCreateOpen(true)}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create New Memorandum
                                </Button>
                            )}
                        </div>
                    </div>

                    {isCreateOpen && (
                        <CreateIssuanceCard
                            onCancel={() => setIsCreateOpen(false)}
                            onSaved={handleCreateSuccess}
                            onError={() => {
                                showToast('Failed to create issuance. Please try again.', { variant: 'error' });
                            }}
                        />
                    )}

                    {isEditOpen && editingIssuance ? (
                        <EditIssuanceCard
                            issuance={editingIssuance}
                            onCancel={() => {
                                setIsEditOpen(false);
                                setEditingIssuance(null);
                            }}
                            onSaved={handleUpdateSuccess}
                            onError={() => {
                                showToast('Failed to update issuance. Please try again.', { variant: 'error' });
                            }}
                        />
                    ) : null}

                    <div className="grid gap-4 pt-6 lg:grid-cols-4">
                        {/* Left: Issuance Types */}
                        <div className="lg:col-span-1">
                            <Card className="h-fit shadow-sm transition-shadow hover:shadow-md">
                                <CardHeader className="border-b pb-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold tracking-tight">Memorandum Types</h3>
                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                            {issuanceTypes.length} {issuanceTypes.length === 1 ? 'type' : 'types'}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    {issuanceTypes.length === 0 ? (
                                        <div className="py-10 text-center text-muted-foreground">
                                            <div className="mb-2 text-3xl">📄</div>
                                            <p className="text-sm">No memorandums available</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {issuanceTypes.map((type) => {
                                                const issuance = selectedIssuances.find((i) => i.issuance_type === type);

                                                return (
                                                    <div key={type}>
                                                        {/* Type button */}
                                                        <button
                                                            className={`w-full justify-start rounded-md bg-blue-600 p-2 font-medium text-white hover:bg-blue-700`}
                                                            onClick={() => {
                                                                setSelectedType(type);
                                                                setSelectedYear(null);
                                                            }}
                                                        >
                                                            {type}
                                                        </button>

                                                        {/* Edit/Delete actions below */}
                                                        {auth?.user && issuance && (
                                                            <div className="mt-2 flex justify-center gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEdit(issuance)}
                                                                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                                                                    title="Edit memorandum"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </button>

                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <button
                                                                            type="button"
                                                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                                                            title="Delete memorandum"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Delete Issuance</AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Are you sure you want to delete "{type}"? This action cannot be
                                                                                undone. All associated years and documents will be permanently
                                                                                removed.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() => handleDelete(issuance.id)}
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Delete
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Years and Documents */}
                        <div className="lg:col-span-3">
                            <Card className="h-fit">
                                <CardHeader className="">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">
                                            {selectedType ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="">{selectedType}</span>
                                                </span>
                                            ) : (
                                                'Select an memorandum type'
                                            )}
                                        </h3>
                                        {selectedType && (
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                                {years.length} {years.length === 1 ? 'year' : 'years'}
                                            </span>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {selectedType ? (
                                        <div className="space-y-6">
                                            {/* Years Grid */}
                                            <div>
                                                <h4 className="mb-3 text-sm font-medium text-gray-700">Available Years</h4>
                                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                                    {years.map((year) => (
                                                        <Button
                                                            key={year}
                                                            variant={selectedYear === year ? 'default' : 'outline'}
                                                            className={`h-12 transition-all duration-200 ${
                                                                selectedYear === year
                                                                    ? 'bg-blue-600 hover:bg-blue-700'
                                                                    : 'hover:border-blue-300 hover:bg-blue-50'
                                                            }`}
                                                            onClick={() => setSelectedYear(year)}
                                                        >
                                                            <span className="font-medium">{year}</span>
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Documents Section */}
                                            {selectedYear && (
                                                <div className="border-t pt-6">
                                                    <div className="mb-4 flex items-center justify-between">
                                                        <h4 className="text-lg font-semibold text-gray-800">Documents for {selectedYear}</h4>
                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                                                            {yearDocuments.length} {yearDocuments.length === 1 ? 'document' : 'documents'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {yearDocuments.length === 0 ? (
                                                            <div className="rounded-lg bg-gray-50 py-8 text-center">
                                                                <div className="mb-2 text-gray-400">📄</div>
                                                                <p className="text-sm text-gray-500">No documents available for this year</p>
                                                            </div>
                                                        ) : (
                                                            yearDocuments.map((doc) => (
                                                                <div
                                                                    key={doc.id}
                                                                    className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-blue-300 hover:shadow-sm"
                                                                    onClick={() => {
                                                                        const url = `/storage/${doc.path}`;
                                                                        window.open(url, '_blank', 'noopener,noreferrer');
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                                                            <span className="text-sm text-blue-600">📄</span>
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-gray-900 transition-colors group-hover:text-blue-600">
                                                                                {doc.title}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">Click to View Document</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <div className="mb-4 text-4xl text-gray-400">📋</div>
                                            <h4 className="mb-2 text-lg font-medium text-gray-600">No Memorandum Selected</h4>
                                            <p className="text-sm text-gray-500">
                                                Choose an memorandum type from the left panel to view available years and documents.
                                            </p>
                                        </div>
                                    )}

                                    {/* Views Counter */}
                                    <div className="mt-6 border-t pt-4">
                                        <div className="flex items-center justify-center rounded-lg bg-gray-50 py-3 text-sm text-gray-600">
                                            <BarChart3 className="mr-2 h-4 w-4 " />
                                            <span className="font-medium">Views:</span>
                                            <span className="ml-2 font-bold ">{views}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
                <TotalViewsCounter />
            </AppLayout>
            <AppFooter />
        </>
    );
}
