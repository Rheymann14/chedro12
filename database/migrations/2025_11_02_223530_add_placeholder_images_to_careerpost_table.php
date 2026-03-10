<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('careerpost', function (Blueprint $table) {
            $table->json('placeholder_images')->nullable()->after('Poster');
            $table->json('blurhash')->nullable()->after('placeholder_images');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('careerpost', function (Blueprint $table) {
            $table->dropColumn(['placeholder_images', 'blurhash']);
        });
    }
};
