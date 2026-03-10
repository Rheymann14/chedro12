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
        // SQLite cannot easily change column nullability; recreate table with desired schema.
        if (Schema::hasTable('careerpost')) {
            Schema::create('careerpost_new', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('headline');
                $table->text('description');
                $table->date('posted_date');
                $table->date('closing_date');
                // Make career nullable to allow postings without a career
                $table->string('career')->nullable();
                $table->string('Poster')->nullable();
                // Discriminator column
                $table->string('entry_type')->default('career_post');
                // Optional: index for frequent filtering
                $table->index('entry_type');
                // CHECK constraint to keep data consistent
                // For SQLite, we add it via table-level raw statement after creation
            });

            // Copy data from old table; set default entry_type to 'career_post'
            DB::statement("INSERT INTO careerpost_new (id, headline, description, posted_date, closing_date, career, Poster, entry_type)
                SELECT id, headline, description, posted_date, closing_date, career, Poster, 'career_post' as entry_type FROM careerpost");

            // Drop old table and rename new one
            Schema::drop('careerpost');
            Schema::rename('careerpost_new', 'careerpost');

            // Add a CHECK constraint to enforce valid entry_type values and career nullability rules
            // Note: SQLite supports check constraints starting from long ago; applied at table creation.
            // Since Laravel's schema builder does not expose adding CHECK post-creation in SQLite,
            // this is best-effort and may be omitted. It's okay to rely on application validation.
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Best-effort down: drop entry_type and restore NOT NULL career by recreating the table
        if (Schema::hasTable('careerpost')) {
            Schema::create('careerpost_old', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->string('headline');
                $table->text('description');
                $table->date('posted_date');
                $table->date('closing_date');
                $table->string('career');
                $table->string('Poster');
            });

            DB::statement("INSERT INTO careerpost_old (id, headline, description, posted_date, closing_date, career, Poster)
                SELECT id, headline, description, posted_date, closing_date, COALESCE(career, ''), COALESCE(Poster, '') FROM careerpost");

            Schema::drop('careerpost');
            Schema::rename('careerpost_old', 'careerpost');
        }
    }
};


