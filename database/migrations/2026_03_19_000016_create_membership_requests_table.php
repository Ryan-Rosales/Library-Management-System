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
        Schema::create('membership_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('contact_number', 30);
            $table->string('region_code', 20);
            $table->string('region_name');
            $table->string('province_code', 20)->nullable();
            $table->string('province_name')->nullable();
            $table->string('city_municipality_code', 20);
            $table->string('city_municipality_name');
            $table->string('barangay_code', 20);
            $table->string('barangay_name');
            $table->string('street_address')->nullable();
            $table->enum('status', ['pending', 'reviewed'])->default('pending');
            $table->timestamp('seen_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'seen_at'], 'membership_requests_status_seen_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_requests');
    }
};
