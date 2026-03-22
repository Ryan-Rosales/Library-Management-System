<?php

namespace App\Http\Controllers;

use App\Models\MembershipRequest;
use App\Models\User;
use App\Services\ActivityNotificationService;
use App\Services\TransactionalMailService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class MembershipRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $this->ensureStaff($request);

        $selectedRequestId = (int) $request->integer('request');

        if ($selectedRequestId > 0) {
            $selectedRequest = MembershipRequest::query()
                ->where('id', $selectedRequestId)
                ->where('status', 'pending')
                ->first();

            if ($selectedRequest && $selectedRequest->seen_at === null) {
                $selectedRequest->forceFill([
                    'seen_at' => now(),
                ])->save();
            }
        }

        $pendingRequests = MembershipRequest::query()
            ->where('status', 'pending')
            ->latest()
            ->get()
            ->map(fn (MembershipRequest $item) => $this->serializeRequest($item))
            ->values();

        $recentlyReviewed = MembershipRequest::query()
            ->where('status', 'reviewed')
            ->latest('resolved_at')
            ->take(50)
            ->get()
            ->map(fn (MembershipRequest $item) => $this->serializeRequest($item))
            ->values();

        return Inertia::render('people/membership-requests', [
            'pendingRequests' => $pendingRequests,
            'recentlyReviewed' => $recentlyReviewed,
            'selectedRequestId' => $selectedRequestId,
        ]);
    }

    public function markRead(Request $request, MembershipRequest $membershipRequest): RedirectResponse
    {
        $this->ensureStaff($request);

        if ($membershipRequest->status === 'pending' && $membershipRequest->seen_at === null) {
            $membershipRequest->forceFill([
                'seen_at' => now(),
            ])->save();
        }

        return back();
    }

    public function approve(Request $request, MembershipRequest $membershipRequest, TransactionalMailService $mailService): RedirectResponse
    {
        $this->ensureStaff($request);

        if ($membershipRequest->status !== 'pending') {
            return back()->withErrors([
                'member_password' => 'This membership request has already been processed.',
            ]);
        }

        $validated = $request->validate([
            'member_password' => ['required', 'string', 'min:8', 'max:64'],
        ]);

        $emailDeliveryStatus = 'sent';
        $emailDeliveryMessage = null;

        try {
            DB::transaction(function () use ($membershipRequest, $request, $validated, $mailService, &$emailDeliveryStatus, &$emailDeliveryMessage): void {
                $lockedRequest = MembershipRequest::query()
                    ->whereKey($membershipRequest->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($lockedRequest->status !== 'pending') {
                    throw ValidationException::withMessages([
                        'member_password' => 'This membership request has already been processed.',
                    ]);
                }

                $normalizedEmail = strtolower((string) $lockedRequest->email);

                $existing = User::query()->whereRaw('LOWER(email) = ?', [$normalizedEmail])->first();

                if ($existing) {
                    throw ValidationException::withMessages([
                        'member_password' => 'An account with this email already exists.',
                    ]);
                }

                User::query()->create([
                    'name' => $lockedRequest->name,
                    'email' => $normalizedEmail,
                    'role' => 'member',
                    'contact_number' => $lockedRequest->contact_number,
                    'region_name' => $lockedRequest->region_name,
                    'province_name' => $lockedRequest->province_name,
                    'city_municipality_name' => $lockedRequest->city_municipality_name,
                    'barangay_name' => $lockedRequest->barangay_name,
                    'street_address' => $lockedRequest->street_address,
                    'password' => Hash::make($validated['member_password']),
                    'must_change_password' => true,
                    'email_verified_at' => now(),
                ]);

                try {
                    $mailService->sendMemberWelcomeCredentials(
                        $normalizedEmail,
                        $lockedRequest->name,
                        $validated['member_password'],
                    );
                } catch (\Throwable $exception) {
                    Log::warning('Unable to send membership welcome email via transactional mailer.', [
                        'membership_request_id' => $lockedRequest->id,
                        'recipient_email' => $lockedRequest->email,
                        'error' => $exception->getMessage(),
                    ]);

                    $emailDeliveryStatus = 'failed';
                    $emailDeliveryMessage = $exception->getMessage();
                }

                $lockedRequest->forceFill([
                    'status' => 'reviewed',
                    'review_outcome' => 'approved',
                    'review_notes' => null,
                    'reviewed_by_user_id' => $request->user()?->id,
                    'email_delivery_status' => $emailDeliveryStatus,
                    'email_delivery_message' => $emailDeliveryMessage,
                    'seen_at' => $lockedRequest->seen_at ?? now(),
                    'resolved_at' => now(),
                ])->save();
            });

            app(ActivityNotificationService::class)->notifyPeerRoleChange(
                $request->user(),
                'people',
                'approved',
                'membership request for "'.$membershipRequest->name.'"',
                route('membership-requests.index'),
            );

            $response = back()->with('success', 'Membership request approved and member account created.');

            if ($emailDeliveryStatus === 'failed') {
                $response = $response->with('warning', 'Membership was approved, but welcome email could not be sent. Please share credentials manually and recheck SMTP settings.');
            }

            return $response;
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (\Throwable $exception) {
            return back()->withErrors([
                'member_password' => 'Membership request could not be approved: '.$exception->getMessage(),
            ]);
        }
    }

    public function retryEmail(Request $request, MembershipRequest $membershipRequest, TransactionalMailService $mailService): RedirectResponse
    {
        $this->ensureStaff($request);

        if ($membershipRequest->status !== 'reviewed' || $membershipRequest->review_outcome !== 'approved') {
            return back()->withErrors([
                'review_notes' => 'Only approved membership requests can retry welcome email.',
            ]);
        }

        $member = User::query()
            ->where('email', $membershipRequest->email)
            ->where('role', 'member')
            ->first();

        if (! $member) {
            return back()->withErrors([
                'review_notes' => 'Member account not found for this approved request.',
            ]);
        }

        $generatedPassword = Str::password(12);

        try {
            $mailService->sendMemberWelcomeCredentials(
                $membershipRequest->email,
                $membershipRequest->name,
                $generatedPassword,
            );

            $member->forceFill([
                'password' => Hash::make($generatedPassword),
            ])->save();

            $membershipRequest->forceFill([
                'email_delivery_status' => 'sent',
                'email_delivery_message' => null,
            ])->save();

            return back()->with('success', 'Welcome email sent successfully. A new password was generated and emailed to the member.');
        } catch (\Throwable $exception) {
            Log::warning('Unable to resend membership welcome email via transactional mailer.', [
                'membership_request_id' => $membershipRequest->id,
                'recipient_email' => $membershipRequest->email,
                'error' => $exception->getMessage(),
            ]);

            $membershipRequest->forceFill([
                'email_delivery_status' => 'failed',
                'email_delivery_message' => $exception->getMessage(),
            ])->save();

            return back()->withErrors([
                'review_notes' => 'Retry failed: '.$exception->getMessage(),
            ]);
        }
    }

    public function reject(Request $request, MembershipRequest $membershipRequest): RedirectResponse
    {
        $this->ensureStaff($request);

        if ($membershipRequest->status !== 'pending') {
            return back()->withErrors([
                'member_password' => 'This membership request has already been processed.',
            ]);
        }

        $membershipRequest->forceFill([
            'status' => 'reviewed',
            'review_outcome' => 'rejected',
            'review_notes' => null,
            'reviewed_by_user_id' => $request->user()?->id,
            'email_delivery_status' => null,
            'email_delivery_message' => null,
            'seen_at' => $membershipRequest->seen_at ?? now(),
            'resolved_at' => now(),
        ])->save();

        app(ActivityNotificationService::class)->notifyPeerRoleChange(
            $request->user(),
            'people',
            'rejected',
            'membership request for "'.$membershipRequest->name.'"',
            route('membership-requests.index'),
        );

        return back()->with('success', 'Membership request rejected.');
    }

    private function serializeRequest(MembershipRequest $item): array
    {
        $reviewedBy = null;
        if ($item->reviewed_by_user_id) {
            $reviewer = User::query()->whereKey($item->reviewed_by_user_id)->first();
            if ($reviewer) {
                $reviewedBy = [
                    'id' => $reviewer->id,
                    'name' => $reviewer->name,
                    'role' => $reviewer->role,
                ];
            }
        }

        return [
            'id' => $item->id,
            'name' => $item->name,
            'email' => $item->email,
            'contact_number' => $item->contact_number,
            'region_name' => $item->region_name,
            'province_name' => $item->province_name,
            'city_municipality_name' => $item->city_municipality_name,
            'barangay_name' => $item->barangay_name,
            'street_address' => $item->street_address,
            'status' => $item->status,
            'review_outcome' => $item->review_outcome,
            'review_notes' => $item->review_notes,
            'reviewed_by' => $reviewedBy,
            'email_delivery_status' => $item->email_delivery_status,
            'email_delivery_message' => $item->email_delivery_message,
            'created_at' => optional($item->created_at)->toDateTimeString(),
            'seen_at' => optional($item->seen_at)->toDateTimeString(),
            'resolved_at' => optional($item->resolved_at)->toDateTimeString(),
        ];
    }

    private function ensureStaff(Request $request): void
    {
        if (! in_array($request->user()?->role, ['staff', 'admin'], true)) {
            abort(403);
        }
    }
}
