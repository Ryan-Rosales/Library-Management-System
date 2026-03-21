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
        Schema::table('password_change_requests', function (Blueprint $table) {
            $table->foreignId('processed_by_user_id')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
            $table->enum('review_action', ['approved', 'rejected'])->nullable()->after('processed_by_user_id');

            $table->index(['status', 'review_action', 'resolved_at'], 'password_change_requests_audit_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('password_change_requests', function (Blueprint $table) {
            $table->dropIndex('password_change_requests_audit_idx');
            $table->dropConstrainedForeignId('processed_by_user_id');
            $table->dropColumn('review_action');
        });
    }
};
