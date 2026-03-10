<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('careerpost')) {
            // Ensure no leftover tmp table from a previous failed run
            Schema::dropIfExists('careerpost_tmp');

            // Recreate table to change Poster from string to text for larger JSON payloads
            Schema::create('careerpost_tmp', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('headline');
                $table->text('description');
                // Allow nullable dates to permit migrating existing data with nulls
                $table->date('posted_date')->nullable();
                $table->date('closing_date')->nullable();
                $table->string('career')->nullable();
                $table->text('Poster')->nullable(); // changed to text
                $table->string('entry_type')->default('career_post');
                $table->index('entry_type');
            });

            DB::statement("INSERT INTO careerpost_tmp (id, headline, description, posted_date, closing_date, career, Poster, entry_type)
                SELECT id, headline, description, posted_date, closing_date, career, Poster, entry_type FROM careerpost");

            Schema::drop('careerpost');
            Schema::rename('careerpost_tmp', 'careerpost');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('careerpost')) {
            // Best-effort down: change Poster back to string(255)
            Schema::dropIfExists('careerpost_tmp_down');
            Schema::create('careerpost_tmp_down', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('headline');
                $table->text('description');
                $table->date('posted_date')->nullable();
                $table->date('closing_date')->nullable();
                $table->string('career')->nullable();
                $table->string('Poster')->nullable(); // back to string
                $table->string('entry_type')->default('career_post');
                $table->index('entry_type');
            });

            DB::statement("INSERT INTO careerpost_tmp_down (id, headline, description, posted_date, closing_date, career, Poster, entry_type)
                SELECT id, headline, description, posted_date, closing_date, career, Poster, entry_type FROM careerpost");

            Schema::drop('careerpost');
            Schema::rename('careerpost_tmp_down', 'careerpost');
        }
    }
};


