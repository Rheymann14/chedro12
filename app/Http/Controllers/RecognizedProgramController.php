<?php

namespace App\Http\Controllers;

use App\Services\PortalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class RecognizedProgramController extends Controller
{
    public function __construct(
        protected PortalService $portalService
    ) {}

    /**
     * Fetch all Higher Education Institutions
     */
    public function index(): JsonResponse
    {
        try {
            $heiData = $this->portalService->fetchAllHEI();
            return response()->json($heiData, 200);
        } catch (\Throwable $e) {
            // Try to log the error, but don't crash if logging fails
            try {
                Log::error('Error fetching HEI data', [
                    'error' => $e->getMessage(),
                ]);
            } catch (\Throwable $logEx) {}

            // Return a JSON response with error details for debugging
            return response()->json([
                'error' => 'Failed to fetch recognized programs.',
                'debug_error' => $e->getMessage(), // Helpful for debugging 500 errors in production
            ], 500);
        }
    }

    /**
     * Export data as PDF
     */
    public function exportPdf(): Response|JsonResponse
    {
        try {
            $heiData = $this->portalService->fetchAllHEI();
            
            $pdf = Pdf::loadView('exports.recognized-programs-pdf', [
                'data' => $heiData,
                'title' => 'Recognized Programs - Region XII',
                'exportDate' => now()->format('F d, Y')
            ]);
            
            return $pdf->download('recognized-programs-' . now()->format('Y-m-d') . '.pdf');
        } catch (\Throwable $e) {
            Log::error('Error exporting PDF', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to export PDF'], 500);
        }
    }

    /**
     * Export data as Excel (XLSX)
     */
    public function exportXlsx(): Response|JsonResponse
    {
        try {
            $heiData = $this->portalService->fetchAllHEI();

            $html = '<html><head><meta charset="UTF-8"></head><body>';
            $html .= '<table border="1" cellspacing="0" cellpadding="4">';
            $html .= '<tr style="font-weight:bold;background:#e5e7eb;text-align:center">'
                . '<td>REGION</td>'
                . '<td>INSTITUTION NAME</td>'
                . '<td>INSTITUTION TYPE</td>'
                . '<td>PROVINCE</td>'
                . '<td>MUNICIPALITY/CITY</td>'
                . '</tr>';

            foreach ($heiData as $item) {
                $html .= '<tr>'
                    . '<td>' . e($item['region'] ?? 'N/A') . '</td>'
                    . '<td>' . e($item['instName'] ?? 'N/A') . '</td>'
                    . '<td>' . e($item['instType'] ?? 'N/A') . '</td>'
                    . '<td>' . e($item['province'] ?? 'N/A') . '</td>'
                    . '<td>' . e($item['municipality'] ?? 'N/A') . '</td>'
                    . '</tr>';
            }

            $html .= '</table></body></html>';

            $filename = 'recognized-programs-' . now()->format('Y-m-d') . '.xls';
            return response($html)
                ->header('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
        } catch (\Throwable $e) {
            Log::error('Error exporting XLSX', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to export Excel'], 500);
        }
    }
}
