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
        Schema::create('recycling', function (Blueprint $table) {
            $table->id();
            // Gépre hivatkozás (gépek tábla)
            $table->foreignId('machine_id')->constrained('machines')->onDelete('cascade');
            // Termékre hivatkozás (products tábla)
            $table->foreignId('product')->constrained('products')->onDelete('cascade');
            $table->enum('event_type', ['success', 'error', 'warning']);
            $table->dateTime('event_date');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recycling');
    }
};
