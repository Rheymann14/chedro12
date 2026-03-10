<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('careerpost')) {
            Schema::table('careerpost', function (Blueprint $table) {
                // Adding as text to be safe for longer paths or metadata
                $table->text('Video')->nullable()->after('Poster');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('careerpost')) {
            Schema::table('careerpost', function (Blueprint $table) {
                if (Schema::hasColumn('careerpost', 'Video')) {
                    $table->dropColumn('Video');
                }
            });
        }
    }
};




