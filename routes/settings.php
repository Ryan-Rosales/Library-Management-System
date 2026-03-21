<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\UserAccountControlController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('settings/delete-account', [ProfileController::class, 'deletePage'])->name('profile.delete.page');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/user-account-control', [UserAccountControlController::class, 'index'])->name('settings.user-account-control');
    Route::patch('settings/user-account-control/{user}/email', [UserAccountControlController::class, 'updateEmail'])
        ->name('settings.user-account-control.email.update');
    Route::put('settings/user-account-control/{user}/password', [UserAccountControlController::class, 'updatePassword'])
        ->name('settings.user-account-control.password.update');
});
