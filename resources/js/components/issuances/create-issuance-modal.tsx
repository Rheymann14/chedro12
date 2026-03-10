import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SimpleDialog } from '@/components/ui/simple-dialog';
import { useState } from 'react';

type ViewType = 'public' | 'private';

interface DocumentItem {
    id: string;
    title: string;
    file?: File;
}

export interface CreateIssuancePayload {
    issuanceType: string;
    year: string;
    documents: Array<{ title: string; fileName?: string }>;
    viewType: ViewType;
}

export function CreateIssuanceModal({
    open,
    onOpenChange,
    onSave,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave?: (payload: CreateIssuancePayload) => void;
}) {
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 10 }).map((_, i) => String(currentYear - i));

    const [issuanceType, setIssuanceType] = useState('');
    const [year, setYear] = useState(String(currentYear));
    const [viewType, setViewType] = useState<ViewType>('public');
    const [documents, setDocuments] = useState<DocumentItem[]>([]);

    const addDocument = () => {
        setDocuments((prev) => [...prev, { id: crypto.randomUUID(), title: '', file: undefined }]);
    };

    const removeDocument = (id: string) => {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
    };

    const updateDocTitle = (id: string, title: string) => {
        setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, title } : d)));
    };

    const updateDocFile = (id: string, file?: File) => {
        setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, file } : d)));
    };

    const handleSave = () => {
        const payload: CreateIssuancePayload = {
            issuanceType,
            year,
            documents: documents.map((d) => ({ title: d.title, fileName: d.file?.name })),
            viewType,
        };
        onSave?.(payload);
        onOpenChange(false);
    };

    const canSave = issuanceType.trim() !== '' && documents.every((d) => d.title.trim() !== '');

    return (
        <SimpleDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Create Issuance"
            description="Fill in the issuance details and attach documents."
            width="7xl"
        >
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="issuanceType">Issuance Type</Label>
                        <Input
                            id="issuanceType"
                            placeholder="e.g., Office Memorandum"
                            value={issuanceType}
                            onChange={(e) => setIssuanceType(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <select
                            id="year"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        >
                            {yearOptions.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Upload Documents</Label>
                        <Button type="button" variant="outline" onClick={addDocument}>
                            Add Document
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {documents.length === 0 && <div className="text-sm text-muted-foreground">No documents added yet.</div>}
                        {documents.map((doc) => (
                            <div key={doc.id} className="rounded-md border p-3">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor={`title-${doc.id}`}>Title</Label>
                                        <Input
                                            id={`title-${doc.id}`}
                                            placeholder="Document title"
                                            value={doc.title}
                                            onChange={(e) => updateDocTitle(doc.id, e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`file-${doc.id}`}>File</Label>
                                        <Input id={`file-${doc.id}`} type="file" onChange={(e) => updateDocFile(doc.id, e.target.files?.[0])} />
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                    <div>{doc.file?.name ?? 'No file chosen'}</div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(doc.id)}>
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>View Type</Label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="radio"
                                name="viewType"
                                value="public"
                                checked={viewType === 'public'}
                                onChange={() => setViewType('public')}
                            />
                            Public
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="radio"
                                name="viewType"
                                value="private"
                                checked={viewType === 'private'}
                                onChange={() => setViewType('private')}
                            />
                            Private
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={!canSave}>
                        Save
                    </Button>
                </div>
            </div>
        </SimpleDialog>
    );
}
