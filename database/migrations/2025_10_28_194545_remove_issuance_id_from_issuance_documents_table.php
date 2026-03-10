<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('issuance_documents', function (Blueprint $table) {
            $table->dropForeign(['issuance_id']);
            $table->dropColumn('issuance_id');
        });
    }

    public function down(): void
    {
        Schema::table('issuance_documents', function (Blueprint $table) {
            $table->foreignId('issuance_id')->constrained('issuances')->cascadeOnDelete();
        });
    }
};