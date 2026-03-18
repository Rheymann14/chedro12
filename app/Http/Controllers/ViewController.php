<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ViewController extends Controller
{
    private const TOTAL_COUNT_KEY = 'views:count:total';

    public function track(Request $request): JsonResponse
    {
        try {
            $page = trim((string) ($request->input('page') ?? $request->query('page') ?? ''));

            if ($page === '') {
                return response()->json(['error' => 'Missing page'], 422);
            }

            $countKey = "views:count:{$page}";
            $totalKey = self::TOTAL_COUNT_KEY;

            $this->initializeCounter($countKey);
            $this->initializeCounter($totalKey);

            $newCount = Cache::increment($countKey);
            $newTotal = Cache::increment($totalKey);

            return response()->json([
                'page' => $page,
                'count' => $newCount,
                'total' => $newTotal,
            ]);
        } catch (\Throwable $e) {
            Log::error('View track error', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'failed'], 500);
        }
    }

    public function count(Request $request): JsonResponse
    {
        $page = trim((string) $request->query('page', ''));

        if ($page === '') {
            return response()->json([
                'page' => null,
                'count' => (int) Cache::get(self::TOTAL_COUNT_KEY, 0),
            ]);
        }

        $countKey = "views:count:{$page}";
        return response()->json(['page' => $page, 'count' => (int) Cache::get($countKey, 0)]);
    }

    private function initializeCounter(string $key): void
    {
        if (!Cache::has($key)) {
            Cache::put($key, 0, now()->addDays(365));
        }
    }
}


