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
            $table->foreignId('verified_by_user_id')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable()->after('verified_by_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('password_change_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('verified_by_user_id');
            $table->dropColumn('verified_at');
        });
    }
};
