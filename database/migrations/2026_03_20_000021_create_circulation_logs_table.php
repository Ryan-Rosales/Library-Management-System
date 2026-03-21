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
        Schema::create('circulation_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->foreignId('book_copy_id')->nullable()->constrained('book_copies')->nullOnDelete();
            $table->foreignId('member_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('borrowed_at')->nullable();
            $table->date('due_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->unsignedInteger('fine_amount')->default(0);
            $table->string('fine_status', 20)->default('none');
            $table->timestamps();

            $table->index(['member_id', 'returned_at']);
            $table->index(['member_id', 'fine_status']);
            $table->index(['book_id', 'borrowed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('circulation_logs');
    }
};
