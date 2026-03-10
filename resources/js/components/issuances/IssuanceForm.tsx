import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { AlertCircle, Calendar, CheckCircle2, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { showToast } from '@/utils/toast';

export type ViewType = 'public' | 'private';

export interface TitleFilePair {
	id: string;
	title: string;
	file?: File;
	existingPath?: string;
	documentId?: number;
}

export interface YearData {
	id: string;
	year: string;
	titleFilePairs: TitleFilePair[];
}

export interface IssuanceRecord {
	id: number;
	issuance_type: string;
	view_type: ViewType;
	years: Array<{
		id: number;
		year: number;
		documents: Array<{ id: number; title: string; path: string }>;
	}>;
}

export interface IssuanceFormProps {
	mode: 'create' | 'edit';
	issuanceId?: number; // required in edit
	initial?: IssuanceRecord; // for edit, used to prefill
	onCancel: () => void;
	onSaved?: (payload: unknown) => void;
	onError?: (error: unknown) => void;
}

export default function IssuanceForm({ mode, issuanceId, initial, onCancel, onSaved, onError }: IssuanceFormProps) {
	const currentYear = new Date().getFullYear();
	const yearOptions = useMemo(() => Array.from({ length: 10 }).map((_, i) => String(currentYear - i)), [currentYear]);

	const [issuanceType, setIssuanceType] = useState<string>(initial?.issuance_type ?? '');
	const [viewType, setViewType] = useState<ViewType>(initial?.view_type ?? 'public');
	const [years, setYears] = useState<YearData[]>([]);
	const yearCardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

	useEffect(() => {
		if (mode === 'edit' && initial) {
			const initialYears: YearData[] = initial.years.map((y) => ({
				id: `year-${y.id}`,
				year: String(y.year),
				titleFilePairs: y.documents.map((doc) => ({
					id: `doc-${doc.id}`,
					title: doc.title,
					existingPath: doc.path,
					documentId: doc.id,
				})),
			}));
			setYears(initialYears);
		}
	}, [mode, initial]);

	// Get the first available year that hasn't been selected
	const getFirstAvailableYear = () => {
		const selectedYears = new Set(years.map((y) => y.year));
		return yearOptions.find((y) => !selectedYears.has(y)) || yearOptions[0];
	};

	// Actions for years and pairs
	const addYear = () => {
		const availableYear = getFirstAvailableYear();
		const newYear: YearData = {
			id: crypto.randomUUID(),
			year: availableYear,
			titleFilePairs: [
				{
					id: crypto.randomUUID(),
					title: '',
					file: undefined,
				},
			],
		};
		setYears([...years, newYear]);
		
		// Scroll to the new card after it's rendered
		setTimeout(() => {
			const cardElement = yearCardRefs.current[newYear.id];
			if (cardElement) {
				cardElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}
		}, 100);
	};

	const removeYear = (yearId: string) => {
		setYears(years.filter((y) => y.id !== yearId));
	};

	const addTitleFilePair = (yearId: string) => {
		setYears(
			years.map((y) =>
				y.id === yearId
					? { ...y, titleFilePairs: [...y.titleFilePairs, { id: crypto.randomUUID(), title: '', file: undefined }] }
					: y,
			),
		);
	};

	const removeTitleFilePair = (yearId: string, pairId: string) => {
		setYears(
			years.map((y) => (y.id === yearId ? { ...y, titleFilePairs: y.titleFilePairs.filter((p) => p.id !== pairId) } : y)),
		);
	};

	const updateTitle = (yearId: string, pairId: string, title: string) => {
		setYears(
			years.map((y) =>
				y.id === yearId
					? { ...y, titleFilePairs: y.titleFilePairs.map((p) => (p.id === pairId ? { ...p, title } : p)) }
					: y,
			),
		);
	};

	const updateFile = (yearId: string, pairId: string, file?: File) => {
		setYears(
			years.map((y) =>
				y.id === yearId
					? { ...y, titleFilePairs: y.titleFilePairs.map((p) => (p.id === pairId ? { ...p, file } : p)) }
					: y,
			),
		);
	};

	const updateYear = (yearId: string, year: string) => {
		// Prevent selecting a year that's already selected by another card
		const isYearAlreadySelected = years.some((y) => y.id !== yearId && y.year === year);
		if (isYearAlreadySelected) {
			showToast('This year is already selected in another publication year card', { variant: 'error' });
			return;
		}
		setYears(years.map((y) => (y.id === yearId ? { ...y, year } : y)));
	};

	// Get available years for a specific year card
	// Always includes the current card's year, but excludes years selected by other cards
	const getAvailableYears = (currentYearId: string, currentYearValue: string) => {
		const selectedYearsByOthers = new Set(
			years.filter((y) => y.id !== currentYearId).map((y) => y.year)
		);
		return yearOptions.filter((y) => y === currentYearValue || !selectedYearsByOthers.has(y));
	};

	// Completion checks
	const step1Complete = issuanceType.trim() !== '';
	const step2Complete = useMemo(() => {
		if (years.length === 0) return false;
		return years.every((y) =>
			y.titleFilePairs.length > 0 &&
				(mode === 'create'
					? y.titleFilePairs.every((p) => p.title.trim() !== '' && p.file != null)
					: y.titleFilePairs.every((p) => p.title.trim() !== '' && (p.file != null || p.existingPath))),
		);
	}, [years, mode]);

	const canSave = step1Complete && step2Complete;

	const handleSave = async () => {
		const form = new FormData();
		form.append('issuanceType', issuanceType);
		form.append('viewType', viewType);
		if (mode === 'edit') form.append('_method', 'PUT');

		years.forEach((yearData, yearIdx) => {
			yearData.titleFilePairs.forEach((pair, pairIdx) => {
				form.append(`years[${yearIdx}][year]`, yearData.year);
				form.append(`years[${yearIdx}][titleFilePairs][${pairIdx}][title]`, pair.title);
				if (pair.file) {
					form.append(`years[${yearIdx}][titleFilePairs][${pairIdx}][file]`, pair.file);
				}
				if (pair.existingPath) {
					form.append(`years[${yearIdx}][titleFilePairs][${pairIdx}][existingPath]`, pair.existingPath);
				}
				if (pair.documentId != null) {
					form.append(`years[${yearIdx}][titleFilePairs][${pairIdx}][documentId]`, String(pair.documentId));
				}
			});
		});

		try {
			const url = mode === 'create' ? '/issuances' : `/issuances/${issuanceId}`;
			const response = await axios.post(url, form, { headers: { 'Content-Type': 'multipart/form-data' } });
			showToast(mode === 'create' ? 'Issuance created successfully' : 'Issuance updated successfully', { variant: 'success' });
			onSaved?.(response.data);
			if (!onSaved) {
				setTimeout(() => window.location.reload(), 350);
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				// eslint-disable-next-line no-console
				console.error('Failed to save issuance:', error.response?.data?.message || error.message);
				showToast(error.response?.data?.message || 'Failed to save issuance', { variant: 'error' });
			} else {
				console.error('Failed to save issuance:', error);
				showToast('Failed to save issuance', { variant: 'error' });
			}
			onError?.(error);
		}
	};

	return (
		<div className="mx-auto mt-5 max-w-7xl">
			{/* Step 1: Basic Information */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Step 1: Basic Information
							</CardTitle>
							<CardDescription className="mt-1">
								{mode === 'create' ? 'Define the issuance type and who can view these documents' : 'Update the issuance type and who can view these documents'}
							</CardDescription>
						</div>
						{step1Complete && (
							<Badge variant="default" className="gap-1 bg-green-500">
								<CheckCircle2 className="h-3 w-3" />
								Complete
							</Badge>
						)}
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="issuanceType" className="text-base">
								Memorandum Type *
							</Label>
							<Input
								id="issuanceType"
								placeholder="e.g., Office Memorandum, Circular, Notice"
								value={issuanceType}
								onChange={(e) => setIssuanceType(e.target.value)}
								className="h-11"
							/>
						</div>

						<div className="space-y-2">
							<Label className="text-base">Document Visibility *</Label>
							<div className="flex flex-col gap-3 pt-2">
								<label className="group flex cursor-pointer items-center gap-3">
									<input
										type="radio"
										name="viewType"
										value="public"
										checked={viewType === 'public'}
										onChange={() => setViewType('public')}
										className="h-4 w-4"
									/>
									<div className="flex-1">
										<p className="text-sm font-medium transition-colors group-hover:text-primary">📢 Public Access</p>
										<p className="text-xs text-muted-foreground">Anyone can view these documents</p>
									</div>
								</label>
								<label className="group flex cursor-pointer items-center gap-3">
									<input
										type="radio"
										name="viewType"
										value="private"
										checked={viewType === 'private'}
										onChange={() => setViewType('private')}
										className="h-4 w-4"
									/>
									<div className="flex-1">
										<p className="text-sm font-medium transition-colors group-hover:text-primary">🔒 CHED Personnel Only</p>
										<p className="text-xs text-muted-foreground">Restricted to authorized staff</p>
									</div>
								</label>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Step 2: Documents */}
			<Card className="mb-6">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Step 2: Add Publication Years and corresponding documents
							</CardTitle>
							<CardDescription className="mt-1">Organize your documents by publication year. Each document needs a title{mode === 'create' ? ' and file' : ''}.</CardDescription>
						</div>
						<div className="grid grid-cols-1 gap-2">
							{step2Complete && (
								<Badge variant="default" className="gap-1 bg-green-500">
									<CheckCircle2 className="h-3 w-3" />
									Complete
								</Badge>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{years.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 py-12 text-center">
							<Calendar className="mb-3 h-12 w-12 text-muted-foreground" />
							<p className="mb-1 text-sm font-medium">No years added yet</p>
							<p className="mb-4 text-xs text-muted-foreground">Click "Add Publication Year" to start organizing your documents</p>
							<Button type="button" onClick={addYear} variant="outline" size="sm">
								<Plus className="mr-2 h-4 w-4" />
								Add Your First Publication Year
							</Button>
						</div>
					) : (
						<div className="space-y-4">
							<div className=" flex justify-end">
								<Button type="button" onClick={addYear} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
									<Plus className="h-4 w-4" />
									Add Publication Year
								</Button>
							</div>
							{years.map((yearData, yearIndex) => (
								<div
									key={yearData.id}
									ref={(el) => {
										yearCardRefs.current[yearData.id] = el;
									}}
								>
								<Card className="border-2 bg-gray-100">
									<CardHeader className="bg-muted/30 pb-3">
										<div className="flex items-center justify-between">
											<div className="flex items-center ">
												<Badge variant="secondary" className="py-1 text-base">
													Select Publication Year:
												</Badge>
												<select
													value={yearData.year}
													onChange={(e) => updateYear(yearData.id, e.target.value)}
													className="h-9 rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
												>
													{getAvailableYears(yearData.id, yearData.year).map((y) => (
														<option key={y} value={y}>
															{y}
														</option>
													))}
												</select>
											</div>
											<div className="flex items-center gap-2">
												<Badge variant="outline">
													{yearData.titleFilePairs.length} {yearData.titleFilePairs.length === 1 ? 'Document' : 'Documents'}
												</Badge>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeYear(yearData.id)}
													className="hover:bg-destructive hover:text-white"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent className="pt-4">
										<div className="space-y-3">
											{yearData.titleFilePairs.map((pair, pairIndex) => (
												<div key={pair.id} className="rounded-lg border bg-card p-4 shadow-sm">
													<div className="mb-3 flex items-start justify-between">
														<div className="flex items-center gap-2">
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
																{pairIndex + 1}
															</div>
															<span className="text-sm font-medium">Document #{pairIndex + 1}</span>
														</div>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeTitleFilePair(yearData.id, pair.id)}
															className="-mt-1 -mr-2 hover:bg-destructive hover:text-white"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>

													<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
														<div className="space-y-2">
															<Label className="flex items-center gap-2 text-sm">
																<FileText className="h-3.5 w-3.5" />
																Document Title *
															</Label>
															<Input
																placeholder="e.g., Budget Allocation 2024"
																value={pair.title}
																onChange={(e) => updateTitle(yearData.id, pair.id, e.target.value)}
																className="h-10"
															/>
														</div>
														<div className="space-y-2">
															<Label className="flex items-center gap-2 text-sm">
																<Upload className="h-3.5 w-3.5" />
																{mode === 'create' ? 'Upload File *' : 'Upload New File (optional)'}
															</Label>
															<Input
																type="file"
																onChange={(e) => updateFile(yearData.id, pair.id, e.target.files?.[0])}
																className="h-10"
															/>
															{pair.existingPath && !pair.file && (
																<div className="mt-1 text-xs text-muted-foreground">Current: {pair.existingPath.split('/').pop()}</div>
															)}
															{pair.file && (
																<div className="mt-2 flex items-center gap-2 rounded border border-green-200 bg-green-50 p-2">
																	<CheckCircle2 className="h-4 w-4 text-green-600" />
																	<span className="text-xs font-medium text-green-700">
																		{pair.file.name} ({(pair.file.size / 1024).toFixed(2)} KB)
																	</span>
																</div>
															)}
														</div>
													</div>

													{(mode === 'create' ? (!pair.title || !pair.file) : (!pair.title)) && (
														<div className="mt-3 flex items-center gap-2 rounded border border-amber-200 bg-amber-50 p-2">
															<AlertCircle className="h-4 w-4 text-amber-600" />
															<span className="text-xs text-amber-700">Please complete the required fields</span>
														</div>
													)}
												</div>
										))}

										<Button type="button" variant="outline" onClick={() => addTitleFilePair(yearData.id)} className="w-full gap-2 border-dashed">
											<Plus className="h-4 w-4" />
											Add Another Document to {yearData.year}
										</Button>
									</div>
								</CardContent>
								
							</Card>
							</div>
							))}
						</div>
						
					)}
				</CardContent>
					{/* Action Buttons */}
			<div className="flex justify-end gap-3 pt-4 pb-8 p-6">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={handleSave} disabled={!canSave} className="min-w-[140px] gap-2 bg-green-500 hover:bg-green-700">
					<CheckCircle2 className="h-4 w-4" />
					{mode === 'create' ? 'Save Issuance' : 'Update'}
				</Button>
			</div>
			</Card>
		</div>
	);
}
