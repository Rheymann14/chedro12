<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MenuItemController extends BaseController
{
    private const DEFAULT_FILE = 'data/menu-items.json';

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
        if (!Storage::exists($file)) {
            Storage::put($file, json_encode(['items' => []], JSON_PRETTY_PRINT));
        }

        $raw = Storage::get($file);
        $decoded = json_decode($raw, true);
        if (!is_array($decoded) || !isset($decoded['items']) || !is_array($decoded['items'])) {
            $decoded = ['items' => []];
        }
        return $decoded;
    }

    /**
     * Persist structure back to storage
     */
    private function write(array $payload, ?string $key = null): void
    {
        $file = $this->fileFor($key);
        Storage::put($file, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
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
                'href' => route('about'),
                'order' => 1,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Online Services',
                'href' => route('onlineServices'),
                'order' => 2,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'HEMIS',
                'href' => route('hemis'),
                'order' => 3,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Resources',
                'href' => route('resources'),
                'order' => 4,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Postings',
                'href' => route('postings'),
                'order' => 5,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Career Postings',
                'href' => route('careerPost'),
                'order' => 6,
            ],
            [
                'id' => (string) Str::uuid(),
                'title' => 'Contact us',
                'href' => route('contactUs'),
                'order' => 7,
            ],
        ];
    }

    private function readAppHeader(): array
    {
        $fileExists = Storage::exists(self::APP_HEADER_FILE);
        
        if (!$fileExists) {
            // Initialize with default items
            $defaultItems = $this->getDefaultHeaderMenuItems();
            Storage::put(self::APP_HEADER_FILE, json_encode(['items' => $defaultItems], JSON_PRETTY_PRINT));
            return ['items' => $defaultItems];
        }

        $raw = Storage::get(self::APP_HEADER_FILE);
        $decoded = json_decode($raw, true);
        if (!is_array($decoded) || !isset($decoded['items']) || !is_array($decoded['items'])) {
            $decoded = ['items' => []];
        }

        // If file exists but is empty, initialize with defaults
        if (empty($decoded['items'])) {
            $defaultItems = $this->getDefaultHeaderMenuItems();
            $decoded = ['items' => $defaultItems];
            Storage::put(self::APP_HEADER_FILE, json_encode($decoded, JSON_PRETTY_PRINT));
        }

        return $decoded;
    }

    private function writeAppHeader(array $payload): void
    {
        Storage::put(self::APP_HEADER_FILE, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
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


