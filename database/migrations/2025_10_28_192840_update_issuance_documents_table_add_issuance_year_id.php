<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('issuance_documents', function (Blueprint $table) {
            $table->foreignId('issuance_year_id')->nullable()->after('issuance_id')->constrained('issuance_years')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('issuance_documents', function (Blueprint $table) {
            $table->dropForeign(['issuance_year_id']);
            $table->dropColumn('issuance_year_id');
        });
    }
};