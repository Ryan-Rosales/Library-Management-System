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
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->enum('email_delivery_status', ['sent', 'failed'])->nullable()->after('reviewed_by_user_id');
            $table->text('email_delivery_message')->nullable()->after('email_delivery_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->dropColumn(['email_delivery_status', 'email_delivery_message']);
        });
    }
};
