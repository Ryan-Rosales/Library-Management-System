<?php

namespace App\Services;

use App\Models\MemberNotification;
use App\Models\User;

class ActivityNotificationService
{
    public function notifyPeerRoleChange(?User $actor, string $module, string $action, string $subject, ?string $url = null): void
    {
        if (! $actor || ! in_array($actor->role, ['admin', 'staff'], true)) {
            return;
        }

        $recipientRole = $actor->role === 'admin' ? 'staff' : 'admin';

        $recipientIds = User::query()
            ->where('role', $recipientRole)
            ->pluck('id');

        if ($recipientIds->isEmpty()) {
            return;
        }

        $message = sprintf(
            '%s (%s) %s %s.',
            $actor->name,
            strtoupper((string) $actor->role),
            $action,
            $subject,
        );

        $now = now();

        $rows = $recipientIds->map(fn (int $recipientId) => [
            'user_id' => $recipientId,
            'type' => 'role_activity',
            'title' => ucfirst($module).' update',
            'message' => $message,
            'url' => $url,
            'meta' => json_encode([
                'actor_name' => $actor->name,
                'actor_role' => $actor->role,
                'module' => $module,
                'action' => $action,
                'subject' => $subject,
            ]),
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        MemberNotification::query()->insert($rows);
    }
}
