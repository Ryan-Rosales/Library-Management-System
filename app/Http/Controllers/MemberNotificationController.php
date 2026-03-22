<?php

namespace App\Http\Controllers;

use App\Models\MemberNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MemberNotificationController extends Controller
{
    public function markRead(Request $request, MemberNotification $memberNotification): RedirectResponse
    {
        $user = $request->user();

        if ((int) $memberNotification->user_id !== (int) $user?->id) {
            abort(403);
        }

        if (! $memberNotification->seen_at) {
            $memberNotification->update([
                'seen_at' => now(),
            ]);
        }

        if ($memberNotification->url) {
            return redirect($this->normalizeActivityUrlForRole($memberNotification->url, (string) $user?->role));
        }

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $user = $request->user();

        MemberNotification::query()
            ->where('user_id', $user?->id)
            ->whereNull('seen_at')
            ->update([
                'seen_at' => now(),
            ]);

        return back();
    }

    private function normalizeActivityUrlForRole(?string $url, string $role): ?string
    {
        if (! $url) {
            return null;
        }

        if ($role !== 'staff') {
            return $url;
        }

        $staffModulePath = parse_url(route('staff'), PHP_URL_PATH);
        $membersModulePath = parse_url(route('members'), PHP_URL_PATH);
        $notificationPath = parse_url($url, PHP_URL_PATH);

        if ($staffModulePath && $membersModulePath && $notificationPath === $staffModulePath) {
            return route('members');
        }

        return $url;
    }
}
