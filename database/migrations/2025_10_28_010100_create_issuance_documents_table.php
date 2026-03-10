<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('issuance_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issuance_id')->constrained('issuances')->cascadeOnDelete();
            $table->string('title');
            $table->string('path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('issuance_documents');
    }
};


