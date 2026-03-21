# Queue Workers (Production)

Libraria now queues transactional emails so user actions are not blocked by SMTP/network latency.

## Required production process

Run at least one persistent queue worker:

```bash
php artisan queue:work database --queue=default --tries=3 --timeout=90 --sleep=3
```

For higher reliability, run multiple workers with process supervision.

## Supervisor example (Linux)

Use [deploy/supervisor/libraria-queue.conf](deploy/supervisor/libraria-queue.conf).

Then:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start libraria-queue:*
```

## Health checks

- Verify jobs are being consumed from `jobs` table.
- Check failed jobs:

```bash
php artisan queue:failed
```

- Retry failed jobs:

```bash
php artisan queue:retry all
```

## Local development

You can keep queueing async behavior while developing:

```bash
php artisan queue:work database
```
