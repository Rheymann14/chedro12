<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class PortalService
{
    protected string $apiUrl = 'https://portal.chedro12.com/api/fetch-programs';
    protected ?string $apiKey;

    public function __construct()
    {
        $this->apiKey = env('PORTAL_API');

        if (empty($this->apiKey)) {
            // Use try-catch for logging to prevent crashes if log file is not writable
            try {
                Log::warning('PORTAL_API key is not set in environment variables');
            } catch (\Throwable $e) {
                // Silently fail if logging fails
            }
        }
    }

    public function fetchPrograms(string $instCode, string $instName): array
    {
        $cacheKey = "chedro12_programs_{$instCode}";

        return Cache::remember($cacheKey, 600, function () use ($instCode, $instName) {
            $data = $this->postToCHED($instCode);

            return collect($data ?? [])
                ->filter(
                    fn($item) =>
                    !empty($item['programName']) &&
                    trim($item['instName'] ?? '') === trim($instName) &&
                    trim($item['instCode'] ?? '') === trim($instCode)
                )
                ->map(fn($item) => [
                    'programName' => $item['programName'],
                    'degreeName' => $item['degreeName'] ?? ($item['degName'] ?? null),
                    'major' => $item['majorName'] ?? ($item['major'] ?? null),
                    'status' => $item['status'] ?? ($item['programStatus'] ?? $item['accreditationStatus'] ?? null),
                    'institutionName' => $item['instName'] ?? ($item['institutionName'] ?? $item['heiName'] ?? null),
                    'address' => $item['address'] ?? ($item['instAddress'] ?? $item['institutionAddress'] ?? $item['heiAddress'] ?? $item['location'] ?? null),
                ])
                ->values()
                ->all();
        });
    }

    public function fetchMajors(string $instCode, string $programName): array
    {
        $programName = trim($programName);
        $cacheKey = "chedro12_program_majors_{$instCode}_{$programName}";

        return Cache::remember($cacheKey, 600, function () use ($instCode, $programName) {
            $data = $this->postToCHED($instCode);

            return collect($data ?? [])
                ->filter(fn($item) => trim($item['programName'] ?? '') === $programName)
                ->pluck('majorName')
                ->filter()
                ->unique()
                ->values()
                ->all();
        });
    }

    public function fetchProgramDetails(string $instCode, string $programName, ?string $instName = null): array
    {
        // This method is complex and specific, caching might be tricky due to the filtering logic
        // relying on exact matches. For now, we'll just wrap the API call.
        // If needed, we can cache the raw response from postToCHED inside postToCHED itself (which we are not doing yet,
        // but fetchPrograms and fetchMajors use Cache::remember which wraps the logic).
        
        // Actually, let's cache the RESULT of this function to be safe and fast.
        $cacheKey = "chedro12_program_details_{$instCode}_" . md5($programName . ($instName ?? ''));

        return Cache::remember($cacheKey, 600, function () use ($instCode, $programName, $instName) {
            $programName = trim($programName);
            $data = $this->postToCHED($instCode);

            $normalizedProgram = mb_strtolower(preg_replace('/\s+/', ' ', $programName));
            $normalizedInstName = $instName ? mb_strtolower(preg_replace('/\s+/', ' ', $instName)) : null;

            $collection = collect($data ?? []);

            $exact = $collection->first(function ($item) use ($normalizedProgram, $instCode, $normalizedInstName) {
                $itemProgram = mb_strtolower(preg_replace('/\s+/', ' ', $item['programName'] ?? ''));
                $itemInst = mb_strtolower(preg_replace('/\s+/', ' ', $item['instName'] ?? ''));
                $instMatches = ($normalizedInstName === null)
                    || ($itemInst === $normalizedInstName)
                    || (is_string($itemInst) && is_string($normalizedInstName) && (str_contains($itemInst, $normalizedInstName) || str_contains($normalizedInstName, $itemInst)));

                return $itemProgram === $normalizedProgram
                    && trim($item['instCode'] ?? '') === trim($instCode)
                    && $instMatches;
            });

            $match = $exact ?: $collection->first(function ($item) use ($normalizedProgram, $instCode, $normalizedInstName) {
                $itemProgram = mb_strtolower(preg_replace('/\s+/', ' ', $item['programName'] ?? ''));
                $itemInst = mb_strtolower(preg_replace('/\s+/', ' ', $item['instName'] ?? ''));
                $instMatches = ($normalizedInstName === null)
                    || ($itemInst === $normalizedInstName)
                    || (is_string($itemInst) && is_string($normalizedInstName) && (str_contains($itemInst, $normalizedInstName) || str_contains($normalizedInstName, $itemInst)));

                return str_contains($itemProgram, $normalizedProgram)
                    && trim($item['instCode'] ?? '') === trim($instCode)
                    && $instMatches;
            });
            if (!$match) {
                return [];
            }

            try {
                Log::info('CHED match found', [
                    'instCode' => $instCode,
                    'programName' => $programName,
                ]);
            } catch (\Throwable $e) {}

            // Deep helpers
            $deepFind = function ($arr, $needle) {
                $needle = strtolower($needle);
                $queue = [$arr];
                $visited = [];
                while ($queue) {
                    $current = array_shift($queue);
                    if (!is_array($current))
                        continue;
                    $oid = spl_object_id((object) $current);
                    if (isset($visited[$oid]))
                        continue;
                    $visited[$oid] = true;
                    foreach ($current as $k => $v) {
                        if (is_string($k) && str_contains(strtolower($k), $needle)) {
                            if (is_scalar($v))
                                return $v;
                            if (is_array($v))
                                return $v; // caller decides how to serialize
                        }
                        if (is_array($v))
                            $queue[] = $v;
                    }
                }
                return null;
            };

            // Status normalization
            $statusRaw = $match['status'] ?? ($match['programStatus'] ?? ($match['accreditationStatus'] ?? null));
            if ($statusRaw === null) {
                $statusRaw = $deepFind($match, 'status');
            }
            $status = 'N/A';
            if (is_bool($statusRaw)) {
                $status = $statusRaw ? 'Active' : 'Inactive';
            } elseif (is_numeric($statusRaw)) {
                $status = ((int) $statusRaw === 1) ? 'Active' : 'Inactive';
            } elseif (is_string($statusRaw)) {
                $s = strtolower(trim($statusRaw));
                if (in_array($s, ['active', 'inactive'], true)) {
                    $status = ucfirst($s);
                } elseif (in_array($s, ['1', 'true', 'yes', 'y'], true)) {
                    $status = 'Active';
                } elseif (in_array($s, ['0', 'false', 'no', 'n'], true)) {
                    $status = 'Inactive';
                } else {
                    $status = $statusRaw;
                }
            }

            // Address normalization
            $address = $match['address']
                ?? ($match['instAddress']
                    ?? ($match['institutionAddress']
                        ?? ($match['heiAddress']
                            ?? ($match['location'] ?? null))));
            if (empty($address)) {
                $addrCandidate = $deepFind($match, 'address');
                if (is_array($addrCandidate)) {
                    $parts = [];
                    foreach (['street', 'address1', 'address2', 'city', 'province', 'state', 'region', 'zip', 'zipcode', 'postal', 'country', 'barangay'] as $key) {
                        if (!empty($addrCandidate[$key]))
                            $parts[] = (string) $addrCandidate[$key];
                    }
                    $address = $parts ? implode(', ', $parts) : null;
                } elseif (!empty($addrCandidate)) {
                    $address = (string) $addrCandidate;
                }
            }
            // Compose from common top-level fields if still empty
            if (empty($address)) {
                $composeKeys = [
                    'street',
                    'address1',
                    'address2',
                    'barangay',
                    'town',
                    'city',
                    'municipality',
                    'province',
                    'region',
                    'state',
                    'zip',
                    'zipcode',
                    'postal',
                    'country',
                    'campus',
                    'building'
                ];
                $parts = [];
                foreach ($composeKeys as $k) {
                    if (!empty($match[$k]))
                        $parts[] = (string) $match[$k];
                }
                if ($parts)
                    $address = implode(', ', $parts);
            }
            if (empty($address)) {
                $address = 'N/A';
            }

            return [
                'programName' => $match['programName'] ?? null,
                'degreeName' => $match['degreeName'] ?? ($match['degName'] ?? null),
                'major' => $match['majorName'] ?? ($match['major'] ?? null),
                'institutionName' => $match['instName'] ?? ($match['institutionName'] ?? $match['heiName'] ?? null),
                'status' => $status,
                'address' => $address,
            ];
        });
    }

    public function postToCHED(string $instCode): array
    {
        try {
            if (empty($this->apiKey)) {
                try {
                    Log::error('Missing PORTAL_API key when calling postToCHED');
                } catch (\Throwable $e) {}
                return [];
            }

            $response = Http::withHeaders([
                'PORTAL-API' => $this->apiKey,
            ])->timeout(60)->post($this->apiUrl, [
                'instCode' => $instCode,
            ]);

            if (!$response->ok()) {
                try {
                    Log::warning('CHED API error', [
                        'status' => $response->status(),
                        'instCode' => $instCode,
                    ]);
                } catch (\Throwable $e) {}
                return [];
            }

            $data = $response->json();
            
            // Handle weird string response "Array[...]" if applicable, based on user snippet
            if (is_string($data) && str_starts_with($data, 'Array[')) {
                $data = substr($data, 5);
                $data = json_decode($data, true);
            }

            return is_array($data) ? $data : [];
        } catch (\Throwable $e) {
            try {
                Log::error('CHED API exception', [
                    'message' => $e->getMessage(),
                    'instCode' => $instCode,
                ]);
            } catch (\Throwable $logEx) {}
            return [];
        }
    }

    public function fetchAllHEI(): array
    {
        $cacheKey = 'chedro12_allhei';

        return Cache::remember($cacheKey, 600, function () {
            try {
                if (empty($this->apiKey)) {
                    try {
                        Log::error('Missing PORTAL_API key when calling fetchAllHEI');
                    } catch (\Throwable $e) {}
                    return [];
                }

                $response = Http::withHeaders([
                    'PORTAL-API' => $this->apiKey,
                ])->timeout(60)->get('https://portal.chedro12.com/api/fetch-all-hei');

                if (!$response->ok()) {
                    try {
                        Log::warning('CHED fetch-all-hei failed', [
                            'status' => $response->status(),
                            'body' => $response->body(),
                        ]);
                    } catch (\Throwable $e) {}
                    return [];
                }

                $jsonData = $response->json();
                if (!is_array($jsonData)) {
                    try {
                        Log::warning('CHED fetch-all-hei returned non-array data', [
                            'type' => gettype($jsonData),
                        ]);
                    } catch (\Throwable $e) {}
                    return [];
                }

                return collect($jsonData)
                    ->map(fn($item) => [
                        'instCode' => $this->normalizeValue($item['instCode'] ?? null),
                        'instName' => $this->normalizeValue($item['instName'] ?? null),
                        'region' => 'Region XII', // Hardcoded since this is Region XII data
                        'instType' => $this->normalizeInstitutionType($item['instOwnership'] ?? null),
                        'province' => $this->normalizeValue($item['province'] ?? null),
                        'municipality' => $this->normalizeValue($item['municipalityCity'] ?? null),
                        'website' => null, // Not available in API
                        'fax' => null, // Not available in API
                        'telephone' => null, // Not available in API
                        'address' => $this->normalizeValue($item['address'] ?? null),
                        'city' => $this->normalizeValue($item['municipalityCity'] ?? null),
                        'fullAddress' => null, // Not available in API
                        'location' => null, // Not available in API
                    ])
                    ->sortBy('instName')
                    ->values()
                    ->all();
            } catch (\Throwable $e) {
                try {
                    Log::error('CHED fetch-all-hei exception', [
                        'message' => $e->getMessage(),
                    ]);
                } catch (\Throwable $logEx) {}
                return [];
            }
        });
    }

    private function normalizeValue($value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }
        
        // Convert to string if not already
        if (!is_string($value)) {
            $value = (string) $value;
        }
        
        $trimmed = trim($value);
        if ($trimmed === '') {
            return null;
        }
        
        return $trimmed;
    }

    private function normalizeInstitutionType($instOwnership): ?string
    {
        if (!$instOwnership || !is_string($instOwnership))
            return null;

        $ownership = strtoupper(trim($instOwnership));

        // Map common ownership types to more readable format
        $typeMap = [
            'CSCU-MAIN' => 'State University',
            'CSCU-SAT' => 'State University (Satellite)',
            'CSU' => 'State University',
            'PRIVATE' => 'Private',
            'PRIVATE NON-SECTARIAN' => 'Private',
            'PRIVATE SECTARIAN' => 'Private',
            'LOCAL' => 'Local Government',
            'NATIONAL' => 'National Government',
            // Map all private institution codes to specific types
            'PSS' => 'Private Sectarian', // Private Sectarian School
            'PSN' => 'Private Sectarian', // Private Sectarian
            'PNN' => 'Private Non-Sectarian', // Private Non-Sectarian
            'PNF' => 'Private Non-Sectarian', // Private Non-Sectarian Foundation
            'PNS' => 'Private Non-Sectarian', // Private Non-Sectarian School
        ];

        return $typeMap[$ownership] ?? $instOwnership;
    }

}
