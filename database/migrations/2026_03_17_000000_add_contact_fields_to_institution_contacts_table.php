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
        Schema::table('institution_contacts', function (Blueprint $table) {
            $table->string('official_email')->nullable()->after('id');
            $table->string('facebook_page')->nullable()->after('official_email');
            $table->text('office_address')->nullable()->after('facebook_page');
            $table->string('director_name')->nullable()->after('office_address');
            $table->string('director_position')->nullable()->after('director_name');
            $table->string('director_office')->nullable()->after('director_position');
            $table->text('director_address')->nullable()->after('director_office');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institution_contacts', function (Blueprint $table) {
            $table->dropColumn([
                'official_email',
                'facebook_page',
                'office_address',
                'director_name',
                'director_position',
                'director_office',
                'director_address',
            ]);
        });
    }
};
