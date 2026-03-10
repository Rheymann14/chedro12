<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issuance_years', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issuance_id')->constrained('issuances')->cascadeOnDelete();
            $table->year('year');
            $table->timestamps();
            
            // Ensure unique year per issuance
            $table->unique(['issuance_id', 'year']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issuance_years');
    }
};