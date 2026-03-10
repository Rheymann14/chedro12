/**
 * Compresses an image file to reduce its size
 * @param file - The image file to compress
 * @param maxSizeMB - Maximum file size in MB (default: 10)
 * @param quality - Compression quality (0.1 to 1.0, default: 0.8)
 * @returns Promise<File> - The compressed image file
 */
export const compressImage = async (
    file: File,
    maxSizeMB: number = 2, // Backend limit is 2MB (2048KB)
    quality: number = 0.8
): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'));
            return;
        }

        // Check file size (in bytes)
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        // If file is already under the limit, return as is
        if (file.size <= maxSizeBytes) {
            resolve(file);
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions to fit within max size
                // We'll reduce dimensions if needed, maintaining aspect ratio
                const maxDimension = 1920; // Max width or height
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height / width) * maxDimension;
                        width = maxDimension;
                    } else {
                        width = (width / height) * maxDimension;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Recursive function to compress with decreasing quality until under limit
                const compressWithQuality = (currentQuality: number): void => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to compress image'));
                                return;
                            }

                            // If still too large, reduce quality further (minimum 0.1)
                            if (blob.size > maxSizeBytes && currentQuality > 0.1) {
                                compressWithQuality(Math.max(0.1, currentQuality - 0.1));
                            } else {
                                // If still too large at minimum quality, reject
                                if (blob.size > maxSizeBytes) {
                                    reject(new Error(`Image could not be compressed below ${maxSizeMB}MB. Please choose a smaller image.`));
                                    return;
                                }
                                
                                const compressedFile = new File(
                                    [blob],
                                    file.name,
                                    { type: file.type, lastModified: Date.now() }
                                );
                                resolve(compressedFile);
                            }
                        },
                        file.type,
                        currentQuality
                    );
                };

                // Start compression with initial quality
                compressWithQuality(quality);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            if (e.target?.result) {
                img.src = e.target.result as string;
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Validates file size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB
 * @returns boolean - True if file size is valid
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

/**
 * Formats file size for display
 * @param bytes - File size in bytes
 * @returns string - Formatted file size
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

