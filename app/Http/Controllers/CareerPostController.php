<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Careerpost;
use App\Helpers\ImageOptimizer;

class CareerPostController extends Controller
{
    public function index()
    {
        $posts = Careerpost::careerPosts()->orderByDesc('posted_date')->get();
        return Inertia::render('careerPost', [
            'posts' => $posts,
        ]);
    }

    public function show(Careerpost $careerPost)
    {
        return Inertia::render('PostDetail', [
            'post' => $careerPost,
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'entry_type' => 'required|in:posting,career_post,awards_commendation',
            'headline' => 'required|string|max:255',
            'description' => 'nullable|string',
            'posted_date' => 'required|date',
            'closing_date' => 'nullable|date',
            'career' => 'nullable|required_if:entry_type,career_post|string|max:255',
            'Poster' => 'nullable|array|max:10',
            'Poster.*' => 'image|max:2048',
            'placeholder_images' => 'nullable|array',
            'blurhash' => 'nullable|array',
            'Video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/ogg|max:102400',
        ]);

        // Handle multiple image uploads if present
        if ($request->hasFile('Poster')) {
            $imagePaths = [];
            foreach ($request->file('Poster') as $image) {
                $imagePath = $image->store('career-images', 'public');
                $imagePaths[] = $imagePath;
                // Optimize the uploaded image
                ImageOptimizer::optimize($imagePath);
            }
            $validated['Poster'] = $imagePaths;
        }

        if ($request->hasFile('Video')) {
            $validated['Video'] = $request->file('Video')->store('career-videos', 'public');
        }

        if (($validated['entry_type'] ?? null) === 'posting' || ($validated['entry_type'] ?? null) === 'awards_commendation') {
            // Ensure career is null for postings and awards commendations
            $validated['career'] = null;
        }

        $post = Careerpost::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Post created successfully!',
            'post' => $post
        ]);
    }

    public function update(Request $request, Careerpost $careerPost)
    {
        $validated = $request->validate([
            'headline' => 'required|string|max:255',
            'description' => 'nullable|string',
            'posted_date' => 'required|date',
            'closing_date' => 'nullable|date',
            'career' => 'nullable|required_if:entry_type,career_post|string|max:255',
            'Poster' => 'nullable|array|max:10',
            'Poster.*' => 'image|max:2048',
            'existing_images' => 'nullable|array|max:10',
            'existing_images.*' => 'string',
            'placeholder_images' => 'nullable|array',
            'blurhash' => 'nullable|array',
            'Video' => 'nullable|file|mimetypes:video/mp4,video/webm,video/ogg|max:102400',
        ]);

        // Handle image updates
        $imagePaths = [];
        $existingImagesProvided = false;
        
        // Add existing images that weren't removed
        // If existing_images is provided (even as empty array/string), use it to determine final images
        if ($request->has('existing_images')) {
            $existingImagesProvided = true;
            $existingImagesInput = $request->input('existing_images', []);
            // Handle both array and empty string cases
            if (is_array($existingImagesInput)) {
                $imagePaths = array_merge($imagePaths, $existingImagesInput);
            } elseif ($existingImagesInput === '') {
                // Empty string means clear all images
                $imagePaths = [];
            }
        }
        
        // Add new uploaded images
        if ($request->hasFile('Poster')) {
            foreach ($request->file('Poster') as $image) {
                $imagePath = $image->store('career-images', 'public');
                $imagePaths[] = $imagePath;
                // Optimize the uploaded image
                ImageOptimizer::optimize($imagePath);
            }
        }
        
        // If existing_images was explicitly provided (even if empty), set Poster accordingly
        if ($existingImagesProvided) {
            if (!empty($imagePaths)) {
                $validated['Poster'] = $imagePaths;
            } else {
                $validated['Poster'] = null; // Explicitly clear images
            }
        } elseif (!empty($imagePaths)) {
            // Only new images, keep existing ones
            $validated['Poster'] = $imagePaths;
        }
        // If neither existing_images nor new files, don't touch Poster (keep existing)

        if ($request->hasFile('Video')) {
            $validated['Video'] = $request->file('Video')->store('career-videos', 'public');
        } else {
            unset($validated['Video']);
        }

        if (($validated['entry_type'] ?? null) === 'posting' || ($validated['entry_type'] ?? null) === 'awards_commendation') {
            $validated['career'] = null;
        }

        $careerPost->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Post updated successfully!',
            'post' => $careerPost->fresh()
        ]);
    }

    public function destroy(Careerpost $careerPost)
    {
        $careerPost->delete();
        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully!'
        ]);
    }

    public function searchPostings(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $query = Careerpost::postings()->orderByDesc('posted_date');
        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('headline', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('career', 'like', "%{$q}%");
            });
        }
        $posts = $query->get();
        return response()->json([
            'success' => true,
            'posts' => $posts,
        ]);
    }
}
