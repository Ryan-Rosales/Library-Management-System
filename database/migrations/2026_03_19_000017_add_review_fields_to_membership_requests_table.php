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
            $table->enum('review_outcome', ['approved', 'rejected'])->nullable()->after('status');
            $table->text('review_notes')->nullable()->after('review_outcome');
            $table->foreignId('reviewed_by_user_id')->nullable()->after('review_notes')->constrained('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('membership_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('reviewed_by_user_id');
            $table->dropColumn(['review_outcome', 'review_notes']);
        });
    }
};
