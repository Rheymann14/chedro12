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
        Schema::create("careerpost", function (Blueprint $table) {
            $table->bigIncrements("id");
            $table->string("headline");
            $table->text("description");
            $table->date("posted_date");
            $table->date("closing_date");
            $table->string("career");
            $table->string("Poster");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
