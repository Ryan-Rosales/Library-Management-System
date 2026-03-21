# Dead Code Sweep (Phase 2)

Date: 2026-03-22

## Safe removals applied

1. Removed unused legacy mail service:
- `app/Services/Web3SchoolMailService.php`

2. Removed duplicate Inertia share merge noise:
- `app/Http/Middleware/HandleInertiaRequests.php`

3. Removed generated artifacts (non-source):
- `.phpunit.result.cache`
- `public/hot`

## Candidate reviewed (not removed automatically)

1. `resources/js/app.tsx`
- Candidate for deletion if project standard is `.jsx` entry only.
- Action: removed in this phase to reduce duplicate bootstrap logic.

2. Keep `resources/js/ssr.jsx`
- Used by Vite SSR config, should remain.

3. Keep all migration files
- Historical DB state, required for fresh environments.

## Result
- No lint errors.
- No PHP test regressions.
