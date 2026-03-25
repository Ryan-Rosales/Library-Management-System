<?php

use App\Http\Controllers\BookController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\BookCopyController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CirculationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GenreController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MemberNotificationController;
use App\Http\Controllers\MemberPortalController;
use App\Http\Controllers\MembershipRequestController;
use App\Http\Controllers\PasswordChangeRequestController;
use App\Http\Controllers\ShelfController;
use App\Http\Controllers\StaffDashboardController;
use App\Http\Controllers\StaffPenaltyController;
use App\Http\Controllers\TeamActivityController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : redirect()->route('login');
})->name('home');

Route::get('notifications/password-change/{passwordChangeRequest}/verify', [PasswordChangeRequestController::class, 'verify'])
    ->middleware('signed:relative')
    ->name('password-change-requests.verify');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        if (Auth::user()?->role === 'staff') {
            return redirect()->route('staff.dashboard');
        }

        if (Auth::user()?->role === 'member') {
            return redirect()->route('member.dashboard');
        }

        return app(\App\Http\Controllers\DashboardController::class)->index();
    })->name('dashboard');

    Route::middleware('role:member')->group(function () {
        Route::get('member/dashboard', [MemberPortalController::class, 'dashboard'])->name('member.dashboard');
        Route::get('member/catalog', [MemberPortalController::class, 'catalog'])->name('member.catalog');
        Route::post('member/catalog/{book}/reserve', [MemberPortalController::class, 'reserve'])->name('member.catalog.reserve');

        Route::get('member/my-books', [MemberPortalController::class, 'myBooks'])->name('member.my-books');
        Route::get('member/history', [MemberPortalController::class, 'history'])->name('member.history');
        Route::get('member/reservations', [MemberPortalController::class, 'reservations'])->name('member.reservations');
        Route::patch('member/reservations/{bookReservation}/cancel', [MemberPortalController::class, 'cancelReservation'])->name('member.reservations.cancel');
        Route::post('member/reservations/{bookReservation}/claim', [MemberPortalController::class, 'claimReservation'])->name('member.reservations.claim');
        Route::get('member/penalties', [MemberPortalController::class, 'penalties'])->name('member.penalties');

        Route::post('member/notifications/{memberNotification}/read', [MemberNotificationController::class, 'markRead'])
            ->name('member.notifications.read');
        Route::post('member/notifications/read-all', [MemberNotificationController::class, 'markAllRead'])
            ->name('member.notifications.read-all');
    });

    Route::middleware('role:admin,staff')->group(function () {
        Route::get('staff/dashboard', [StaffDashboardController::class, 'index'])->name('staff.dashboard');

        Route::get('books', [BookController::class, 'index'])->name('books');
        Route::post('books', [BookController::class, 'store'])->name('books.store');
        Route::put('books/{book}', [BookController::class, 'update'])->name('books.update');
        Route::delete('books/{book}', [BookController::class, 'destroy'])->name('books.destroy');

        Route::get('categories', [CategoryController::class, 'index'])->name('categories');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::get('genres', [GenreController::class, 'index'])->name('genres');
        Route::post('genres', [GenreController::class, 'store'])->name('genres.store');
        Route::put('genres/{genre}', [GenreController::class, 'update'])->name('genres.update');
        Route::delete('genres/{genre}', [GenreController::class, 'destroy'])->name('genres.destroy');

        Route::get('authors', [AuthorController::class, 'index'])->name('authors');
        Route::post('authors', [AuthorController::class, 'store'])->name('authors.store');
        Route::put('authors/{author}', [AuthorController::class, 'update'])->name('authors.update');
        Route::delete('authors/{author}', [AuthorController::class, 'destroy'])->name('authors.destroy');

        Route::get('shelves', [ShelfController::class, 'index'])->name('shelves');
        Route::post('shelves', [ShelfController::class, 'store'])->name('shelves.store');
        Route::put('shelves/{shelf}', [ShelfController::class, 'update'])->name('shelves.update');
        Route::delete('shelves/{shelf}', [ShelfController::class, 'destroy'])->name('shelves.destroy');

        Route::get('locations', [LocationController::class, 'index'])->name('locations');
        Route::post('locations', [LocationController::class, 'store'])->name('locations.store');
        Route::put('locations/{location}', [LocationController::class, 'update'])->name('locations.update');
        Route::delete('locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');

        Route::get('book-copies', [BookCopyController::class, 'index'])->name('book.copies');
        Route::post('book-copies', [BookCopyController::class, 'store'])->name('book.copies.store');
        Route::put('book-copies/{bookCopy}', [BookCopyController::class, 'update'])->name('book.copies.update');
        Route::delete('book-copies/{bookCopy}', [BookCopyController::class, 'destroy'])->name('book.copies.destroy');

        Route::get('borrow-return', fn () => redirect()->route('circulation.borrow.page'))->name('circulation.index');
        Route::get('borrow', [CirculationController::class, 'borrowPage'])->name('circulation.borrow.page');
        Route::get('return', [CirculationController::class, 'returnPage'])->name('circulation.return.page');
        Route::get('history', [CirculationController::class, 'historyPage'])->name('circulation.history.page');
        Route::get('penalties/manage', [StaffPenaltyController::class, 'index'])->name('staff.penalties.index');
        Route::patch('penalties/manage/{circulationLog}/clear', [StaffPenaltyController::class, 'markCleared'])->name('staff.penalties.clear');
        Route::post('borrow-return/borrow', [CirculationController::class, 'borrow'])->name('circulation.borrow');
        Route::post('borrow-return/issue-reservation', [CirculationController::class, 'issueReservation'])->name('circulation.issue-reservation');
        Route::post('borrow-return/reject-reservation', [CirculationController::class, 'rejectReservation'])->name('circulation.reject-reservation');
        Route::post('borrow-return/return', [CirculationController::class, 'returnBook'])->name('circulation.return');

        Route::get('members', [UserManagementController::class, 'members'])->name('members');
        Route::post('members', [UserManagementController::class, 'storeMember'])->name('members.store');
        Route::put('members/{user}', [UserManagementController::class, 'updateMember'])->name('members.update');
        Route::delete('members/{user}', [UserManagementController::class, 'destroyMember'])->name('members.destroy');

        Route::middleware('role:admin')->group(function () {
            Route::get('staff', [UserManagementController::class, 'staff'])->name('staff');
            Route::post('staff', [UserManagementController::class, 'storeStaff'])->name('staff.store');
            Route::put('staff/{user}', [UserManagementController::class, 'updateStaff'])->name('staff.update');
            Route::delete('staff/{user}', [UserManagementController::class, 'destroyStaff'])->name('staff.destroy');
        });

        Route::get('reports', [AnalyticsController::class, 'index'])->name('reports');
        Route::get('team-activity', [TeamActivityController::class, 'index'])->name('team-activity.index');
        Route::post('team-activity/mark-all-read', [TeamActivityController::class, 'markAllRead'])->name('team-activity.read-all');

        Route::get('membership-requests', [MembershipRequestController::class, 'index'])->name('membership-requests.index');
        Route::post('membership-requests/{membershipRequest}/mark-read', [MembershipRequestController::class, 'markRead'])->name('membership-requests.mark-read');
        Route::post('membership-requests/{membershipRequest}/approve', [MembershipRequestController::class, 'approve'])->name('membership-requests.approve');
        Route::post('membership-requests/{membershipRequest}/reject', [MembershipRequestController::class, 'reject'])->name('membership-requests.reject');
        Route::post('membership-requests/{membershipRequest}/retry-email', [MembershipRequestController::class, 'retryEmail'])->name('membership-requests.retry-email');

        Route::post('notifications/password-change/{passwordChangeRequest}/mark-read', [PasswordChangeRequestController::class, 'markRead'])
            ->name('password-change-requests.mark-read');
        Route::post('notifications/password-change/mark-all-read', [PasswordChangeRequestController::class, 'markAllRead'])
            ->name('password-change-requests.mark-all-read');
        Route::post('notifications/activity/{memberNotification}/mark-read', [MemberNotificationController::class, 'markRead'])
            ->name('activity.notifications.read');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
