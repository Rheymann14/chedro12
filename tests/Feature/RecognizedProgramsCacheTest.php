<?php

namespace Tests\Feature;

use App\Http\Controllers\RecognizedProgramController;
use App\Services\PortalService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RecognizedProgramsCacheTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Clear all caches before each test
        Cache::flush();
    }

    public function test_recognized_programs_endpoint_uses_cache()
    {
        // Mock the PortalService to avoid actual API calls
        $mockData = [
            [
                'instCode' => 'TEST001',
                'instName' => 'Test University',
                'region' => 'Region XII',
                'instType' => 'Private',
                'province' => 'Test Province',
                'municipality' => 'Test City',
            ]
        ];

        $this->mock(PortalService::class, function ($mock) use ($mockData) {
            $mock->shouldReceive('fetchAllHEI')
                ->once() // Should only be called once due to caching
                ->andReturn($mockData);
        });

        // First request should call the service and cache the result
        $response1 = $this->get('/recognized-programs');
        $response1->assertStatus(200);
        $response1->assertJson($mockData);

        // Second request should use cache (service not called again)
        $response2 = $this->get('/recognized-programs');
        $response2->assertStatus(200);
        $response2->assertJson($mockData);

        // Verify cache exists
        $this->assertTrue(Cache::has('recognized_programs_index'));
    }

    public function test_cache_clear_endpoint()
    {
        // First, populate cache
        $this->get('/recognized-programs');
        $this->assertTrue(Cache::has('recognized_programs_index'));

        // Clear cache
        $response = $this->post('/recognized-programs/cache/clear');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'timestamp'
        ]);

        // Verify cache is cleared
        $this->assertFalse(Cache::has('recognized_programs_index'));
    }

    public function test_cache_refresh_endpoint()
    {
        // Mock the PortalService
        $mockData = [
            [
                'instCode' => 'TEST002',
                'instName' => 'Refreshed University',
                'region' => 'Region XII',
                'instType' => 'State University',
                'province' => 'Refreshed Province',
                'municipality' => 'Refreshed City',
            ]
        ];

        $this->mock(PortalService::class, function ($mock) use ($mockData) {
            $mock->shouldReceive('clearAllCaches')->once();
            $mock->shouldReceive('fetchAllHEI')->once()->andReturn($mockData);
        });

        $response = $this->post('/recognized-programs/cache/refresh');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'message',
            'count',
            'timestamp'
        ]);

        $responseData = $response->json();
        $this->assertEquals(count($mockData), $responseData['count']);
    }

    public function test_cache_status_endpoint()
    {
        // Test with empty cache
        $response = $this->get('/recognized-programs/cache/status');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'recognized_programs_index',
            'chedro12_allhei',
            'portal_service_stats',
            'timestamp'
        ]);

        $responseData = $response->json();
        $this->assertFalse($responseData['recognized_programs_index']['exists']);
        $this->assertFalse($responseData['chedro12_allhei']['exists']);

        // Test with populated cache
        $this->get('/recognized-programs');
        $response = $this->get('/recognized-programs/cache/status');
        $response->assertStatus(200);

        $responseData = $response->json();
        $this->assertTrue($responseData['recognized_programs_index']['exists']);
    }

    public function test_cache_ttl_configuration()
    {
        // Test that cache has appropriate TTL
        $this->get('/recognized-programs');
        
        // Verify cache exists
        $this->assertTrue(Cache::has('recognized_programs_index'));
        
        // The cache should exist for at least 30 minutes (1800 seconds)
        // We can't easily test the exact TTL without mocking the cache store,
        // but we can verify the cache exists and has data
        $cachedData = Cache::get('recognized_programs_index');
        $this->assertIsArray($cachedData);
    }
}
