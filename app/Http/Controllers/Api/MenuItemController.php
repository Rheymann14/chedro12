<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MenuItemController extends BaseController
{
    private const DEFAULT_FILE = 'data/menu-items.json';
    private const EMPTY_PAYLOAD = ['items' => []];
    private const INTERNAL_ROUTE_NAMES = [
        'home',
        'dashboard',
        'about',
        'onlineServices',
        'hemis',
        'resources',
        'postings',
        'careerPost',
        'awardsCommendation',
        'contactUs',
        'historicalBackground',
        'mandate',
        'visionMission',
        'policyStatement',
        'cavApplication',
        'statistics',
        'recognizedprograms',
        'regionalMemo',
        'admin.careerPost',
        'admin.postings',
        'admin.awardsCommendation',
        'admin.users',
        'admin.header-menu',
        'admin.contact-settings',
        'user.careerPost',
        'user.postings',
        'user.awardsCommendation',
    ];

    private function menuDisk(): Filesystem
    {
        return Storage::disk('local');
    }

    private function localRoute(string $name): string
    {
        return route($name, [], false);
    }

    private function normalizeInternalPath(string $path): string
    {
        $normalized = '/' . ltrim(trim($path), '/');
        $normalized = preg_replace('#^/public(?=/|$)#i', '', $normalized) ?? $normalized;

        return rtrim($normalized, '/') ?: '/';
    }

    /**
     * @return array<int, string>
     */
    private function knownInternalPaths(): array
    {
        static $paths = null;

        if (is_array($paths)) {
            return $paths;
        }

        $paths = array_values(array_unique(array_map(
            fn (string $name) => $this->normalizeInternalPath($this->localRoute($name)),
            self::INTERNAL_ROUTE_NAMES,
        )));

        return $paths;
    }

    private function normalizeMenuHref(string $href): string
    {
        $href = trim($href);

        if ($href === '' || str_starts_with($href, '#')) {
            return $href;
        }

        $parts = parse_url($href);

        if ($parts === false) {
            return $href;
        }

        $scheme = strtolower((string) ($parts['scheme'] ?? ''));
        if ($scheme !== '' && !in_array($scheme, ['http', 'https'], true)) {
            return $href;
        }

        $path = $parts['path'] ?? $href;
        $normalizedPath = $this->normalizeInternalPath($path);

        if (!in_array($normalizedPath, $this->knownInternalPaths(), true)) {
            return $href;
        }

        $query = isset($parts['query']) ? '?' . $parts['query'] : '';
        $fragment = isset($parts['fragment']) ? '#' . $parts['fragment'] : '';

        return $normalizedPath . $query . $fragment;
    }

    private function normalizePayload(array $payload): array
    {
        if (!isset($payload['items']) || !is_array($payload['items'])) {
            return $payload;
        }

        $payload['items'] = array_map(function (array $item) {
            if (isset($item['href']) && is_string($item['href'])) {
                $item['href'] = $this->normalizeMenuHref($item['href']);
            }

            return $item;
        }, $payload['items']);

        return $payload;
    }

    /**
     * Default seeded menu items for public pages that should not render blank
     *
     * @return array<int, array<string, string>>
     */
    private function defaultItemsFor(?string $key): array
    {
        return match ($key) {
            'about' => [
                [
                    'title' => 'Historical Background',
                    'href' => $this->localRoute('historicalBackground'),
                    'description' => "Learn about our organization's history and development",
                ],
                [
                    'title' => 'Mandate',
                    'href' => $this->localRoute('mandate'),
                    'description' => 'Our official mandate and responsibilities',
                ],
                [
                    'title' => 'Vision and Mission',
                    'href' => $this->localRoute('visionMission'),
                    'description' => 'Our vision and mission statement',
                ],
                [
                    'title' => 'Quality Policy Statement',
                    'href' => $this->localRoute('policyStatement'),
                    'description' => 'Our commitment to quality and excellence',
                ],
            ],
            'online-services' => [
                [
                    'title' => 'CAV Application',
                    'href' => $this->localRoute('cavApplication'),
                    'description' => 'Apply online for Certification, Authentication, and Verification (CAV).',
                ],
                [
                    'title' => 'Program Evaluation Self-Assessment',
                    'href' => 'https://portal.chedro12.com/program-assessment/',
                    'description' => 'Submit your program evaluation self-assessment through our official portal.',
                ],
            ],
            'hemis' => [
                [
                    'title' => 'Statistics',
                    'href' => $this->localRoute('statistics'),
                    'description' => 'Access higher education statistics, reports, and data insights.',
                ],
                [
                    'title' => 'Recognized Programs',
                    'href' => $this->localRoute('recognizedprograms'),
                    'description' => 'View officially recognized programs offered by institutions.',
                ],
                [
                    'title' => 'Curriculum Verification',
                    'href' => 'https://curriculum-verification.chedro12.com/',
                    'description' => 'Easily verify your curriculum with CHED to ensure it meets official standards.',
                ],
                [
                    'title' => 'Check with CHED',
                    'href' => 'https://checkwithched.chedro12.com/',
                    'description' => 'Check your records',
                ],
            ],
            null => [
                [
                    'title' => 'Issuances',
                    'href' => 'https://ched.gov.ph/issuances/#',
                    'description' => 'View Ched issuances.',
                ],
                [
                    'title' => 'Regional Memorandum',
                    'href' => $this->localRoute('regionalMemo'),
                    'description' => 'View regional memorandums.',
                ],
            ],
            default => [],
        };
    }

    /**
     * @param  array<int, array<string, string>>  $items
     * @return array{items: array<int, array<string, string>>}
     */
    private function payloadWithGeneratedIds(array $items): array
    {
        return $this->normalizePayload([
            'items' => array_map(fn (array $item) => [
                'id' => (string) Str::uuid(),
                'title' => $item['title'],
                'href' => $item['href'],
                'description' => $item['description'],
            ], $items),
        ]);
    }

    private function isDefaultEmptyPayload(string $raw): bool
    {
        $normalized = trim($raw);

        return in_array($normalized, [
            trim((string) json_encode(self::EMPTY_PAYLOAD, JSON_PRETTY_PRINT)),
            trim((string) json_encode(self::EMPTY_PAYLOAD)),
        ], true);
    }

    /**
     * Ensure the JSON file exists and return decoded array
     *
     * @return array{items: array<int, array<string,mixed>>}
     */
    private function fileFor(?string $key): string
    {
        if ($key && preg_match('/^[a-z0-9\-_.]+$/i', $key)) {
            return 'data/menu-' . $key . '.json';
        }
        return self::DEFAULT_FILE;
    }

    /**
     * Ensure the JSON file exists and return decoded array (by namespace key)
     *
     * @return array{items: array<int, array<string,mixed>>}
     */
    private function read(?string $key = null): array
    {
        $file = $this->fileFor($key);
        $disk = $this->menuDisk();
        $defaultItems = $this->defaultItemsFor($key);

        if (!$disk->exists($file)) {
            $payload = !empty($defaultItems)
                ? $this->payloadWithGeneratedIds($defaultItems)
                : self::EMPTY_PAYLOAD;

            $disk->put($file, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

            return $payload;
        }

        $raw = $disk->get($file);
        $decoded = json_decode($raw, true);

        if (!is_array($decoded) || !isset($decoded['items']) || !is_array($decoded['items'])) {
            $payload = !empty($defaultItems)
                ? $this->payloadWithGeneratedIds($defaultItems)
                : self::EMPTY_PAYLOAD;

            $this->write($payload, $key);

            return $payload;
        }

        if (empty($decoded['items']) && !empty($defaultItems) && $this->isDefaultEmptyPayload($raw)) {
            $payload = $this->payloadWithGeneratedIds($defaultItems);
            $this->write($payload, $key);

            return $payload;
        }

        $normalized = $this->normalizePayload($decoded);

        if ($normalized !== $decoded) {
            $this->write($normalized, $key);
        }

        return $normalized;
    }

    /**
     * Persist structure back to storage
     */
    private function write(array $payload, ?string $key = null): void
    {
        $file = $this->fileFor($key);
        $this->menuDisk()->put($file, json_encode($this->normalizePayload($payload), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    /**
     * GET /api/menu-items
     */
    public function index()
    {
        return response()->json($this->read());
    }

    /**
     * POST /api/menu-items
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'href' => 'required|string|max:1024',
            'description' => 'required|string|max:1000',
        ]);

        $data = $this->read();

        $item = [
            'id' => (string) Str::uuid(),
            'title' => $validated['title'],
            'href' => $validated['href'],
            'description' => $validated['description'],
        ];

        $data['items'][] = $item;
        $this->write($data);

        return response()->json(['item' => $item, 'items' => $data['items']]);
    }

    /**
     * PUT /api/menu-items/{id}
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'href' => 'required|string|max:1024',
            'description' => 'required|string|max:1000',
        ]);

        $data = $this->read();

        foreach ($data['items'] as $index => $existing) {
            if (($existing['id'] ?? '') === $id) {
                $data['items'][$index] = array_merge($existing, $validated, ['id' => $id]);
                $this->write($data);
                return response()->json(['item' => $data['items'][$index], 'items' => $data['items']]);
            }
        }

        return response()->json(['message' => 'Not found'], 404);
    }

    /**
     * DELETE /api/menu-items/{id}
     */
    public function destroy(string $id)
    {
        $data = $this->read();
        $before = count($data['items']);
        $data['items'] = array_values(array_filter($data['items'], fn ($i) => ($i['id'] ?? '') !== $id));
        if (count($data['items']) === $before) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $this->write($data);
        return response()->json(['items' => $data['items']]);
    }

    // ===== Namespaced variants: /api/menu-items/{key} =====

    public function indexKey(string $key)
    {
        return response()->json($this->read($key));
    }

    public function storeKey(Request $request, string $key)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'href' => 'required|string|max:1024',
            'description' => 'required|string|max:1000',
        ]);

        $data = $this->read($key);
        $item = [
            'id' => (string) Str::uuid(),
            'title' => $validated['title'],
            'href' => $validated['href'],
            'description' => $validated['description'],
        ];
        $data['items'][] = $item;
        $this->write($data, $key);
        return response()->json(['item' => $item, 'items' => $data['items']]);
    }

    public function updateKey(Request $request, string $key, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'href' => 'required|string|max:1024',
            'description' => 'required|string|max:1000',
        ]);

        $data = $this->read($key);
        foreach ($data['items'] as $index => $existing) {
            if (($existing['id'] ?? '') === $id) {
                $data['items'][$index] = array_merge($existing, $validated, ['id' => $id]);
                $this->write($data, $key);
                return response()->json(['item' => $data['items'][$index], 'items' => $data['items']]);
            }
        }
        return response()->json(['message' => 'Not found'], 404);
    }

    public function destroyKey(string $key, string $id)
    {
        $data = $this->read($key);
        $before = count($data['items']);
        $data['items'] = array_values(array_filter($data['items'], fn ($i) => ($i['id'] ?? '') !== $id));
        if (count($data['items']) === $before) {
            return response()->json(['message' => 'Not found'], 404);
        }
        $this->write($data, $key);
        return response()->json(['items' => $data['items']]);
    }

    // ===== App Header Menu: /api/app-header-menu =====

    private const APP_HEADER_FILE = 'data/appheadMenu.json';

    private function getDefaultHeaderMenuItems(): array
    {
        return [
            [
                'id' => (string) Str::uuid(),
                'title' => 'Home',
                'href' => '/',
                'order' => 0,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'About us',
                'href' => $this->localRoute('about'),
                'order' => 1,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Online Services',
                'href' => $this->localRoute('onlineServices'),
                'order' => 2,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'HEMIS',
                'href' => $this->localRoute('hemis'),
                'order' => 3,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Resources',
                'href' => $this->localRoute('resources'),
                'order' => 4,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Postings',
                'href' => $this->localRoute('postings'),
                'order' => 5,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Career Postings',
                'href' => $this->localRoute('careerPost'),
                'order' => 6,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Contact us',
                'href' => $this->localRoute('contactUs'),
                'order' => 7,
            ],
        ];
    }

    private function readAppHeader(): array
    {
        $disk = $this->menuDisk();
        $fileExists = $disk->exists(self::APP_HEADER_FILE);
        
        if (!$fileExists) {
            // Initialize with default items
            $defaultItems = $this->getDefaultHeaderMenuItems();
            $disk->put(self::APP_HEADER_FILE, json_encode(['items' => $defaultItems], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            return ['items' => $defaultItems];
        }

        $raw = $disk->get(self::APP_HEADER_FILE);
        $decoded = json_decode($raw, true);
        if (!is_array($decoded) || !isset($decoded['items']) || !is_array($decoded['items'])) {
            $decoded = ['items' => []];
        }

        // If file exists but is empty, initialize with defaults
        if (empty($decoded['items'])) {
            $defaultItems = $this->getDefaultHeaderMenuItems();
            $decoded = ['items' => $defaultItems];
            $disk->put(self::APP_HEADER_FILE, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        }

        $normalized = $this->normalizePayload($decoded);

        if ($normalized !== $decoded) {
            $this->writeAppHeader($normalized);
        }

        return $normalized;
    }

    private function writeAppHeader(array $payload): void
    {
        $this->menuDisk()->put(self::APP_HEADER_FILE, json_encode($this->normalizePayload($payload), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    public function indexAppHeader()
    {
        return response()->json($this->readAppHeader());
    }

    public function storeAppHeader(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'href' => 'required|string|max:1024',
        ]);

        $data = $this->readAppHeader();

        $item = [
            'id' => (string) Str::uuid(),
            'title' => $validated['title'],
            'href' => $validated['href'],
            'order' => count($data['items']),
        ];

        $data['items'][] = $item;
        $this->writeAppHeader($data);

        return response()->json(['item' => $item, 'items' => $data['items']]);
    }

    public function updateAppHeader(Request $request, string $id)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'href' => 'required|string|max:1024',
        ]);

        $data = $this->readAppHeader();

        foreach ($data['items'] as $index => $existing) {
            if (($existing['id'] ?? '') === $id) {
                $data['items'][$index] = array_merge($existing, $validated, ['id' => $id]);
                $this->writeAppHeader($data);
                return response()->json(['item' => $data['items'][$index], 'items' => $data['items']]);
            }
        }

        return response()->json(['message' => 'Not found'], 404);
    }

    public function destroyAppHeader(string $id)
    {
        $data = $this->readAppHeader();
        $before = count($data['items']);
        $data['items'] = array_values(array_filter($data['items'], fn ($i) => ($i['id'] ?? '') !== $id));
        if (count($data['items']) === $before) {
            return response()->json(['message' => 'Not found'], 404);
        }
        // Re-index order
        foreach ($data['items'] as $index => $item) {
            $data['items'][$index]['order'] = $index;
        }
        $this->writeAppHeader($data);
        return response()->json(['items' => $data['items']]);
    }

    public function reorderAppHeader(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|string',
            'items.*.title' => 'required|string',
            'items.*.href' => 'required|string',
        ]);

        $reordered = [];
        foreach ($validated['items'] as $index => $item) {
            $reordered[] = [
                'id' => $item['id'],
                'title' => $item['title'],
                'href' => $item['href'],
                'order' => $index,
            ];
        }

        $this->writeAppHeader(['items' => $reordered]);
        return response()->json(['items' => $reordered]);
    }
}


