<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update all existing records to have 'career_post' as default
        // Since we can't distinguish between postings and career posts from existing data,
        // we'll set them all as 'career_post' and let the user manually update postings
        DB::table('careerpost')->update(['entry_type' => 'career_post']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to reverse this data migration
    }
};