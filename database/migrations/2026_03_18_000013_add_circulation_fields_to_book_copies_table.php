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
        Schema::table('book_copies', function (Blueprint $table) {
            $table->foreignId('borrower_id')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('borrowed_at')->nullable()->after('borrower_id');
            $table->date('due_at')->nullable()->after('borrowed_at');
            $table->timestamp('returned_at')->nullable()->after('due_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('book_copies', function (Blueprint $table) {
            $table->dropConstrainedForeignId('borrower_id');
            $table->dropColumn(['borrowed_at', 'due_at', 'returned_at']);
        });
    }
};
