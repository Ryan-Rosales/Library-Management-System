# Libraria - Laravel Management System

This guide helps a new developer clone this repository and run it locally, including database, queue workers, SMTP mail, and Playwright E2E tests.

## 1. Requirements

- PHP 8.2+
- Composer 2+
- Node.js 20+ and npm
- MySQL 8+ (or MariaDB equivalent)
- Git

## 2. Clone and install

```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd Laravel-Management-System

composer install
npm install
```

One-command bootstrap options:

Windows PowerShell:

```powershell
./scripts/bootstrap.ps1
```

Linux/macOS:

```bash
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

Skip Playwright browser install if needed:

Windows PowerShell:

```powershell
./scripts/bootstrap.ps1 -SkipPlaywright
```

Linux/macOS:

```bash
./scripts/bootstrap.sh --skip-playwright
```

## 3. Environment setup

Copy the example env and generate app key:

```bash
cp .env.example .env
php artisan key:generate
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
php artisan key:generate
```

Note: if you used the bootstrap script, this step is already handled.

## 4. Configure database

Open `.env` and set your DB credentials.

Example MySQL config:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lib
DB_USERNAME=root
DB_PASSWORD=
```

Then run migrations and seed data:

```bash
php artisan migrate --seed
```

Note: if you used the bootstrap script, this step is already handled.

Default seeded admin account:

- Email: `admin@library.ph`
- Password: `Admin@12345`

## 5. Configure mail (SMTP)

Transactional mail is required for membership and password reset flows.

Update `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="your-email@gmail.com"
MAIL_FROM_NAME="Libraria"
```

If using Gmail:

1. Enable 2-Step Verification in Google Account.
2. Create an App Password.
3. Use that App Password as `MAIL_PASSWORD`.

## 6. Queue worker (required for async emails)

This project queues transactional emails, so run a queue worker in parallel.

```bash
php artisan queue:work database --queue=default --tries=3 --timeout=90 --sleep=3
```

Alternative local all-in-one command (server + queue + vite):

```bash
composer run dev
```

## 7. Start the app (manual mode)

Use separate terminals:

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

Terminal 3:

```bash
php artisan queue:work database
```

Open: http://127.0.0.1:8000

## 8. Quality checks

Run lint and tests:

```bash
npm run lint
php artisan test
```

## 9. Browser E2E tests (Playwright)

Install browsers once:

```bash
npx playwright install --with-deps
```

Note: bootstrap scripts run `npx playwright install` by default.

Set E2E env values in `.env`:

```env
E2E_BASE_URL=http://127.0.0.1:8000
E2E_ADMIN_EMAIL=admin@library.ph
E2E_ADMIN_PASSWORD=Admin@12345
```

Run E2E:

```bash
npm run e2e
```

Headed mode:

```bash
npm run e2e:headed
```

## 10. Common issues

- `Unknown named parameter $recipientName`
  - Make sure you are using PHP 8.2+ (`php -v`).
- `Cannot find module '@playwright/test'`
  - Run `npm install`.
- `Executable doesn't exist ... ms-playwright`
  - Run `npx playwright install --with-deps`.
- E2E login fails with missing env credentials
  - Ensure `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` are set in `.env`.
- Emails not sent
  - Confirm SMTP credentials are valid and a queue worker is running.

## 11. Production queue note

For production process supervision, see:

- `docs/operations/queue-workers.md`
- `deploy/supervisor/libraria-queue.conf`

## 12. Deploy on Render (Blueprint)

This repository includes a Render Blueprint at `render.yaml`.

It provisions:

- `libraria-web` (Docker web service)
- `libraria-queue` (Docker worker service for queued jobs)

Steps:

1. Push your latest code to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Review services from `render.yaml` and apply.
4. Fill all `sync: false` environment variables in Render dashboard.
5. Set `APP_URL` to your Render web URL (for example, `https://your-app.onrender.com`).
6. Migrations run automatically during deploy via `preDeployCommand` on the web service.

Manual fallback (if you disable pre-deploy migration):

```bash
php artisan migrate --force
```

Required secrets/config on Render:

- `APP_KEY`
- `APP_URL`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`

If you use Supabase, set `DB_USERNAME` to the full pooler user from the dashboard, such as `postgres.<project-ref>`, and keep `DB_HOST`/`DB_PORT` aligned with the same connection string.

Queue note:

- Keep the `libraria-queue` worker running, or transactional emails will stay in the `jobs` table and not be sent.

Production safety notes:

- Avoid destructive migration operations (`drop`, irreversible column/type changes) directly on live data without a rollback or data-migration plan.
- Always take a database backup/snapshot before deploying schema changes.
- Prefer additive migrations first (new columns/tables), then code rollout, then cleanup migrations in a later release.
- For high-traffic deployments, schedule releases during low-usage windows and monitor logs/failed jobs after deploy.
