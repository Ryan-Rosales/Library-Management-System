#!/usr/bin/env bash

set -euo pipefail

SKIP_PLAYWRIGHT=0
if [[ "${1:-}" == "--skip-playwright" ]]; then
  SKIP_PLAYWRIGHT=1
fi

echo "Starting Libraria local bootstrap..."

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

composer install
npm install

php artisan key:generate --force
php artisan migrate --seed

if [[ "$SKIP_PLAYWRIGHT" -eq 0 ]]; then
  npx playwright install
fi

echo
echo "Bootstrap complete."
echo "Run the app stack with: composer run dev"
echo
echo "For full E2E setup, ensure .env contains valid E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD."
