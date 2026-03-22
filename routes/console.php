<?php

use App\Models\MemberNotification;
use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('notifications:cleanup-staff-activity-urls {--dry-run : Preview updates without writing to DB}', function () {
    $isDryRun = (bool) $this->option('dry-run');

    $staffPath = parse_url(route('staff'), PHP_URL_PATH) ?: '/staff';
    $membersPath = parse_url(route('members'), PHP_URL_PATH) ?: '/members';
    $membersUrl = route('members');

    $staffUserIds = User::query()
        ->where('role', 'staff')
        ->pluck('id');

    if ($staffUserIds->isEmpty()) {
        $this->info('No staff users found. Nothing to clean.');

        return 0;
    }

    $candidates = MemberNotification::query()
        ->whereIn('user_id', $staffUserIds)
        ->where('type', 'role_activity')
        ->whereNotNull('url')
        ->get(['id', 'url']);

    $totalScanned = $candidates->count();
    $totalRewritable = 0;
    $totalUpdated = 0;

    foreach ($candidates as $notification) {
        $url = (string) $notification->url;
        $path = parse_url($url, PHP_URL_PATH) ?: '';

        if ($path !== $staffPath) {
            continue;
        }

        $totalRewritable++;

        $newUrl = $url === $staffPath
            ? $membersPath
            : preg_replace('~'.preg_quote($staffPath, '~').'(?=$|[?#])~', $membersPath, $url, 1);

        if (! is_string($newUrl) || $newUrl === '') {
            $newUrl = $membersUrl;
        }

        if ($isDryRun) {
            continue;
        }

        MemberNotification::query()
            ->whereKey($notification->id)
            ->update([
                'url' => $newUrl,
            ]);

        $totalUpdated++;
    }

    $this->line('Scanned: '.$totalScanned);
    $this->line('Rewritable: '.$totalRewritable);

    if ($isDryRun) {
        $this->info('Dry-run complete. No database rows were updated.');

        return 0;
    }

    $this->info('Updated: '.$totalUpdated);

    return 0;
})->purpose('Rewrite staff role_activity notification URLs from /staff to /members for staff recipients');
