<?php

namespace App\Http\Middleware;

use App\Models\MembershipRequest;
use App\Models\MemberNotification;
use App\Models\PasswordChangeRequest;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'notifications' => fn () => $this->buildNotifications($request),
        ]);
    }

    private function buildNotifications(Request $request): array
    {
        $user = $request->user();

        if (! $user) {
            return [
                'passwordChangeRequests' => [],
                'membershipRequests' => [],
                'activityNotifications' => [],
                'memberNotifications' => [],
                'passwordPendingCount' => 0,
                'membershipPendingCount' => 0,
                'unreadCount' => 0,
            ];
        }

        if ($user->role === 'member') {
            $memberBaseQuery = MemberNotification::query()->where('user_id', $user->id);

            $memberNotifications = (clone $memberBaseQuery)
                ->latest()
                ->take(10)
                ->get(['id', 'type', 'title', 'message', 'url', 'created_at', 'seen_at'])
                ->map(fn (MemberNotification $item) => [
                    'id' => $item->id,
                    'type' => $item->type,
                    'title' => $item->title,
                    'message' => $item->message,
                    'url' => $item->url,
                    'created_at' => optional($item->created_at)->toDateTimeString(),
                    'seen_at' => optional($item->seen_at)->toDateTimeString(),
                ])
                ->values();

            return [
                'passwordChangeRequests' => [],
                'membershipRequests' => [],
                'activityNotifications' => [],
                'memberNotifications' => $memberNotifications,
                'passwordPendingCount' => 0,
                'membershipPendingCount' => 0,
                'unreadCount' => (clone $memberBaseQuery)->whereNull('seen_at')->count(),
            ];
        }

        if (! $user || ! in_array($user->role, ['admin', 'staff'], true)) {
            return [
                'passwordChangeRequests' => [],
                'membershipRequests' => [],
                'activityNotifications' => [],
                'memberNotifications' => [],
                'passwordPendingCount' => 0,
                'membershipPendingCount' => 0,
                'unreadCount' => 0,
            ];
        }

        $baseQuery = PasswordChangeRequest::query()
            ->where('target_role', $user->role)
            ->where('status', 'pending');

        $requests = (clone $baseQuery)
            ->latest()
            ->take(10)
            ->get([
                'id',
                'requester_name',
                'requester_email',
                'requester_role',
                'reason',
                'created_at',
                'seen_at',
            ])
            ->map(fn (PasswordChangeRequest $item) => [
                'id' => $item->id,
                'requester_name' => $item->requester_name,
                'requester_email' => $item->requester_email,
                'requester_role' => $item->requester_role,
                'reason' => $item->reason,
                'created_at' => optional($item->created_at)->toDateTimeString(),
                'seen_at' => optional($item->seen_at)->toDateTimeString(),
            ])
            ->values();

        $unreadCount = (clone $baseQuery)->whereNull('seen_at')->count();
        $passwordPendingCount = (clone $baseQuery)->count();

        $activityBaseQuery = MemberNotification::query()
            ->where('user_id', $user->id)
            ->where('type', 'role_activity');

        $activityNotifications = (clone $activityBaseQuery)
            ->latest()
            ->take(10)
            ->get(['id', 'type', 'title', 'message', 'url', 'meta', 'created_at', 'seen_at'])
            ->map(fn (MemberNotification $item) => [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'message' => $item->message,
                'url' => $item->url,
                'meta' => $item->meta,
                'created_at' => optional($item->created_at)->toDateTimeString(),
                'seen_at' => optional($item->seen_at)->toDateTimeString(),
            ])
            ->values();

        $activityUnreadCount = (clone $activityBaseQuery)->whereNull('seen_at')->count();

        $membershipRequests = collect();
        $membershipUnreadCount = 0;
        $membershipPendingCount = 0;

        if ($user->role === 'staff') {
            $membershipBaseQuery = MembershipRequest::query()->where('status', 'pending');

            $membershipRequests = (clone $membershipBaseQuery)
                ->latest()
                ->take(10)
                ->get([
                    'id',
                    'name',
                    'email',
                    'contact_number',
                    'region_name',
                    'province_name',
                    'city_municipality_name',
                    'barangay_name',
                    'street_address',
                    'review_outcome',
                    'review_notes',
                    'created_at',
                    'seen_at',
                ])
                ->map(fn (MembershipRequest $item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'email' => $item->email,
                    'contact_number' => $item->contact_number,
                    'region_name' => $item->region_name,
                    'province_name' => $item->province_name,
                    'city_municipality_name' => $item->city_municipality_name,
                    'barangay_name' => $item->barangay_name,
                    'street_address' => $item->street_address,
                    'review_outcome' => $item->review_outcome,
                    'review_notes' => $item->review_notes,
                    'created_at' => optional($item->created_at)->toDateTimeString(),
                    'seen_at' => optional($item->seen_at)->toDateTimeString(),
                ])
                ->values();

            $membershipUnreadCount = (clone $membershipBaseQuery)->whereNull('seen_at')->count();
            $membershipPendingCount = (clone $membershipBaseQuery)->count();
        }

        return [
            'passwordChangeRequests' => $requests,
            'membershipRequests' => $membershipRequests,
            'activityNotifications' => $activityNotifications,
            'memberNotifications' => [],
            'passwordPendingCount' => $passwordPendingCount,
            'membershipPendingCount' => $membershipPendingCount,
            'unreadCount' => $unreadCount + $membershipUnreadCount + $activityUnreadCount,
        ];
    }
}
