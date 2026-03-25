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
        Schema::table('book_reservations', function (Blueprint $table) {
            $table->timestamp('claim_at')->nullable()->after('fulfilled_at');
            $table->date('member_due_at')->nullable()->after('claim_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('book_reservations', function (Blueprint $table) {
            $table->dropColumn(['claim_at', 'member_due_at']);
        });
    }
};
