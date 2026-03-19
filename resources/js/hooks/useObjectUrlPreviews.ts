import * as React from 'react';

export function useObjectUrlPreviews(files: File[]): string[] {
    const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (!files.length) {
            setPreviewUrls([]);
            return;
        }

        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [files]);

    return previewUrls;
}

export function useObjectUrlPreview(file: File | null | undefined): string | null {
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(file);
        setPreviewUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [file]);

    return previewUrl;
}
