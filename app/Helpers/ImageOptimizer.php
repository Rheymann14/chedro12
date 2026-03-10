<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Storage;
use Spatie\ImageOptimizer\OptimizerChainFactory;

class ImageOptimizer
{
    /**
     * Optimize an image file
     *
     * @param string $path The storage path to the image (relative to storage/app/public)
     * @return bool Success status
     */
    public static function optimize(string $path): bool
    {
        try {
            $fullPath = Storage::disk('public')->path($path);
            
            // Check if file exists
            if (!file_exists($fullPath)) {
                return false;
            }

            // Get the optimizer chain
            $optimizerChain = OptimizerChainFactory::create();
            
            // Optimize the image
            $optimizerChain->optimize($fullPath);
            
            return true;
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Log::warning('Image optimization failed: ' . $e->getMessage(), [
                'path' => $path,
            ]);
            return false;
        }
    }

    /**
     * Optimize multiple images
     *
     * @param array $paths Array of storage paths
     * @return void
     */
    public static function optimizeMany(array $paths): void
    {
        foreach ($paths as $path) {
            if (!empty($path) && is_string($path)) {
                self::optimize($path);
            }
        }
    }
}

