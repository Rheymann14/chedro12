<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ViewController extends Controller
{
    public function track(Request $request): JsonResponse
    {
        try {
            $page = (string) ($request->input('page') ?? $request->query('page') ?? 'unknown');
            if ($page === '') {
                return response()->json(['error' => 'Missing page'], 422);
            }

            $ip = $request->ip() ?? 'unknown';
            $dayKey = now()->toDateString();
            $seenKey = "views:seen:{$page}:{$dayKey}:{$ip}";
            $countKey = "views:count:{$page}";

            // Only count once per IP per day
            // Ensure counter exists with a long TTL
            if (!Cache::has($countKey)) {
                Cache::put($countKey, 0, now()->addDays(365));
            }

            if (!Cache::has($seenKey)) {
                Cache::put($seenKey, true, now()->addDay());
                $newCount = Cache::increment($countKey);
            } else {
                $newCount = (int) (Cache::get($countKey, 0));
            }

            return response()->json(['page' => $page, 'count' => $newCount]);
        } catch (\Throwable $e) {
            Log::error('View track error', ['message' => $e->getMessage()]);
            return response()->json(['error' => 'failed'], 500);
        }
    }

    public function count(Request $request): JsonResponse
    {
        $page = (string) $request->query('page', 'unknown');
        if ($page === '') {
            return response()->json(['error' => 'Missing page'], 422);
        }
        $countKey = "views:count:{$page}";
        return response()->json(['page' => $page, 'count' => (int) Cache::get($countKey, 0)]);
    }
}


