import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, ImageIcon, X } from 'lucide-react';
import React from 'react';
import { compressImage, validateFileSize } from '@/utils/imageCompression';

type CareerPost = {
    id: number;
    headline: string;
    description: string;
    posted_date: string;
    closing_date: string;
    career: string;
    Poster?: string[] | null;
};

interface AdminCareerPostFormProps {
    editing: CareerPost | null;
    data: {
        headline: string;
        description: string;
        posted_date: string;
        closing_date: string;
        career: string;
        Poster: File[];
    };
    setData: (key: keyof AdminCareerPostFormProps['data'], value: any) => void;
    existingImages: string[];
    setExistingImages: (images: string[]) => void;
    isSubmitting: boolean;
    processing: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

export const AdminCareerPostForm: React.FC<AdminCareerPostFormProps> = ({
    editing,
    data,
    setData,
    existingImages,
    setExistingImages,
    isSubmitting,
    processing,
    onSubmit,
    onClose,
}) => {
    const [submitted, setSubmitted] = React.useState(false);
    const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
    const [imageErrors, setImageErrors] = React.useState<string[]>([]);

    const handleLocalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const errors: Record<string, string> = {};
        
        if (!data.headline || data.headline.trim() === '') {
            errors.headline = 'Headline is required';
        }
        if (!data.posted_date) {
            errors.posted_date = 'Post Date is required';
        }
        if (!data.career || data.career.trim() === '') {
            errors.career = 'Career is required';
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0 || imageErrors.length > 0) {
            return;
        }

        onSubmit(e);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const totalImages = existingImages.length + files.length;
        
        if (totalImages > 10) {
            setImageErrors([`Maximum 10 images allowed. You currently have ${existingImages.length} images.`]);
            return;
        }

        const errors: string[] = [];
        const compressedFiles: File[] = [];

        for (const file of files) {
            // Validate file size (10MB)
            if (!validateFileSize(file, 10)) {
                errors.push(`${file.name} exceeds 10MB limit. Please choose a smaller file.`);
                continue;
            }

            try {
                // Compress image
                // Compress image to 2MB (backend limit)
                const compressedFile = await compressImage(file, 2, 0.8);
                compressedFiles.push(compressedFile);
            } catch (error) {
                errors.push(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        setImageErrors(errors);
        
        if (compressedFiles.length > 0) {
            setData('Poster', [...(data.Poster || []), ...compressedFiles] as any);
        }
    };

    return (
        <form key={editing ? `edit-${editing.id}` : 'create'} onSubmit={handleLocalSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <CardDescription>Enter the main details for this career post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="headline">
                            Headline * {fieldErrors.headline && <span className="text-destructive text-sm">({fieldErrors.headline})</span>}
                        </Label>
                        <Input
                            id="headline"
                            placeholder="Enter career post headline..."
                            value={data.headline}
                            onChange={(e) => {
                                setData('headline', e.target.value);
                                if (fieldErrors.headline) {
                                    setFieldErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.headline;
                                        return newErrors;
                                    });
                                }
                            }}
                            className={fieldErrors.headline ? 'border-red-500' : ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <RichTextEditor
                            value={data.description}
                            onChange={(html) => setData('description', html)}
                            placeholder="Type the career post details…"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="career">
                            Career * {fieldErrors.career && <span className="text-destructive text-sm">({fieldErrors.career})</span>}
                        </Label>
                        <Input
                            id="career"
                            placeholder="Enter career type..."
                            value={data.career}
                            onChange={(e) => {
                                setData('career', e.target.value);
                                if (fieldErrors.career) {
                                    setFieldErrors((prev) => {
                                        const newErrors = { ...prev };
                                        delete newErrors.career;
                                        return newErrors;
                                    });
                                }
                            }}
                            className={fieldErrors.career ? 'border-red-500' : ''}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="posted_date" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Post Date * {fieldErrors.posted_date && <span className="text-destructive text-sm">({fieldErrors.posted_date})</span>}
                            </Label>
                            <Input
                                id="posted_date"
                                type="date"
                                value={data.posted_date}
                                onChange={(e) => {
                                    setData('posted_date', e.target.value);
                                    if (fieldErrors.posted_date) {
                                        setFieldErrors((prev) => {
                                            const newErrors = { ...prev };
                                            delete newErrors.posted_date;
                                            return newErrors;
                                        });
                                    }
                                }}
                                className={fieldErrors.posted_date ? 'border-red-500' : ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="closing_date" className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4" />
                                Closing Date
                            </Label>
                            <Input
                                id="closing_date"
                                type="date"
                                value={data.closing_date}
                                onChange={(e) => setData('closing_date', e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Media Section Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ImageIcon className="h-5 w-5" />
                        Media Assets
                    </CardTitle>
                    <CardDescription>Upload images for this career post</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Upload Button */}
                    <div className="space-y-2">
                        <div className="flex w-full items-center justify-center">
                            <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-colors hover:bg-muted">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="mb-1 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB (will be compressed to 2MB max)</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        {imageErrors.length > 0 && (
                            <div className="text-sm text-destructive">
                                {imageErrors.map((error, index) => (
                                    <p key={index}>{error}</p>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Images Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">Poster Images</Label>
                            <span className="text-xs text-muted-foreground">{existingImages.length + (data.Poster?.length || 0)} / 10 images</span>
                        </div>

                        {/* Existing Images */}
                        {editing && existingImages.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Current Images:</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                                    {existingImages.map((image, index) => (
                                        <div key={`existing-${index}`} className="group relative">
                                            <img
                                                src={`/storage/${image}`}
                                                alt={`Current ${index + 1}`}
                                                className="h-24 w-full rounded-lg border object-cover transition-all group-hover:brightness-75"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:scale-110"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-2 left-2 rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-white shadow">
                                                    Primary
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Images Preview */}
                        {data.Poster && data.Poster.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">New Images to Add:</p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                                    {data.Poster.map((file, index) => (
                                        <div key={`new-${index}`} className="group relative">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Preview ${index + 1}`}
                                                className="h-24 w-full rounded-lg border object-cover transition-all group-hover:brightness-75"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setData('Poster', data.Poster.filter((_, i) => i !== index) as any)}
                                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 hover:scale-110"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={processing || isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={processing || isSubmitting}>
                    {isSubmitting ? 'Saving...' : editing ? 'Update Career Post' : 'Create Career Post'}
                </Button>
            </div>
        </form>
    );
};
