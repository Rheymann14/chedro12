<?php

namespace App\Http\Controllers;

use App\Models\Issuance;
use App\Models\IssuanceDocument;
use App\Models\IssuanceYear;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class IssuanceController extends Controller
{
    public function store(Request $request)
    {
        // Validate basic fields
        $validated = $request->validate([
            'issuanceType' => 'required|string|max:255',
            'viewType' => 'required|in:public,private',
            'years' => 'required|array|min:1',
            'years.*.year' => 'required|integer|min:1900|max:3000',
            'years.*.titleFilePairs' => 'required|array|min:1',
            'years.*.titleFilePairs.*.title' => 'required|string|max:255',
            'years.*.titleFilePairs.*.file' => 'required|file|max:10240',
        ]);

        return DB::transaction(function () use ($request, $validated) {
            $issuance = Issuance::create([
                'issuance_type' => $validated['issuanceType'],
                'view_type' => $validated['viewType'],
            ]);

            $years = $request->input('years', []);
            
            foreach ($years as $yearIdx => $yearData) {
                $issuanceYear = IssuanceYear::create([
                    'issuance_id' => $issuance->id,
                    'year' => (int) $yearData['year'],
                ]);

                $titleFilePairs = $yearData['titleFilePairs'] ?? [];
                foreach ($titleFilePairs as $pairIdx => $pair) {
                    // Access the file using the correct nested path
                    $file = $request->file("years.{$yearIdx}.titleFilePairs.{$pairIdx}.file");
                    
                    if ($file && $file->isValid()) {
                        $path = $file->store('issuances', 'public');
                        IssuanceDocument::create([
                            'issuance_year_id' => $issuanceYear->id,
                            'title' => $pair['title'],
                            'path' => $path,
                        ]);
                    }
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Issuance created successfully.',
                'issuance' => $issuance->load(['years.documents']),
            ]);
        });
    }

    public function update(Request $request, Issuance $issuance)
    {
        // Validate basic fields
        $validated = $request->validate([
            'issuanceType' => 'required|string|max:255',
            'viewType' => 'required|in:public,private',
            'years' => 'required|array|min:1',
            'years.*.year' => 'required|integer|min:1900|max:3000',
            'years.*.titleFilePairs' => 'required|array|min:1',
            'years.*.titleFilePairs.*.title' => 'required|string|max:255',
            'years.*.titleFilePairs.*.file' => 'nullable|file|max:10240',
            'years.*.titleFilePairs.*.existingPath' => 'nullable|string',
            'years.*.titleFilePairs.*.documentId' => 'nullable|integer',
        ]);

        return DB::transaction(function () use ($request, $validated, $issuance) {
            // Update issuance basic info
            $issuance->update([
                'issuance_type' => $validated['issuanceType'],
                'view_type' => $validated['viewType'],
            ]);

            // Get all existing document IDs to track what should be deleted
            // Use fully-qualified column to avoid ambiguity from the join
            $existingDocumentIds = $issuance->documents()->pluck('issuance_documents.id')->toArray();
            $updatedDocumentIds = [];

            $years = $request->input('years', []);
            
            foreach ($years as $yearIdx => $yearData) {
                // Find or create the year
                $issuanceYear = IssuanceYear::firstOrCreate([
                    'issuance_id' => $issuance->id,
                    'year' => (int) $yearData['year'],
                ]);

                $titleFilePairs = $yearData['titleFilePairs'] ?? [];
                foreach ($titleFilePairs as $pairIdx => $pair) {
                    $file = $request->file("years.{$yearIdx}.titleFilePairs.{$pairIdx}.file");
                    $documentId = $pair['documentId'] ?? null;
                    
                    if ($file && $file->isValid()) {
                        // New file uploaded
                        $path = $file->store('issuances', 'public');
                        
                        if ($documentId) {
                            // Update existing document
                            $document = IssuanceDocument::find($documentId);
                            if ($document) {
                                $document->update([
                                    'title' => $pair['title'],
                                    'path' => $path,
                                ]);
                                $updatedDocumentIds[] = $documentId;
                            }
                        } else {
                            // Create new document
                            $document = IssuanceDocument::create([
                                'issuance_year_id' => $issuanceYear->id,
                                'title' => $pair['title'],
                                'path' => $path,
                            ]);
                            $updatedDocumentIds[] = $document->id;
                        }
                    } elseif ($documentId) {
                        // No new file, but document ID provided - update title only
                        $document = IssuanceDocument::find($documentId);
                        if ($document) {
                            $document->update(['title' => $pair['title']]);
                            $updatedDocumentIds[] = $documentId;
                        }
                    } elseif (isset($pair['existingPath']) && $pair['existingPath']) {
                        // No new file uploaded but existing path provided - create new document
                        $document = IssuanceDocument::create([
                            'issuance_year_id' => $issuanceYear->id,
                            'title' => $pair['title'],
                            'path' => $pair['existingPath'],
                        ]);
                        $updatedDocumentIds[] = $document->id;
                    }
                }
            }

            // Delete documents that were not included in the update
            $documentsToDelete = array_diff($existingDocumentIds, $updatedDocumentIds);
            if (!empty($documentsToDelete)) {
                IssuanceDocument::whereIn('id', $documentsToDelete)->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Issuance updated successfully.',
                'issuance' => $issuance->load(['years.documents']),
            ]);
        });
    }

    public function destroy(Issuance $issuance)
    {
        return DB::transaction(function () use ($issuance) {
            // Delete all related documents and years first
            $issuance->years()->each(function ($year) {
                // Delete all documents for this year
                $year->documents()->delete();
                // Delete the year
                $year->delete();
            });
            
            // Finally delete the issuance itself
            $issuance->delete();

            return response()->json([
                'success' => true,
                'message' => 'Issuance deleted successfully.',
            ]);
        });
    }
}