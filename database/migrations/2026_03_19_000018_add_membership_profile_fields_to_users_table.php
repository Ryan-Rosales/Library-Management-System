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
        Schema::table('users', function (Blueprint $table) {
            $table->string('contact_number', 30)->nullable()->after('role');
            $table->string('region_name')->nullable()->after('contact_number');
            $table->string('province_name')->nullable()->after('region_name');
            $table->string('city_municipality_name')->nullable()->after('province_name');
            $table->string('barangay_name')->nullable()->after('city_municipality_name');
            $table->string('street_address')->nullable()->after('barangay_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'contact_number',
                'region_name',
                'province_name',
                'city_municipality_name',
                'barangay_name',
                'street_address',
            ]);
        });
    }
};
