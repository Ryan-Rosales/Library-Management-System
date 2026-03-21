param(
    [switch]$SkipPlaywright
)

$ErrorActionPreference = 'Stop'

Write-Host 'Starting Libraria local bootstrap...' -ForegroundColor Cyan

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host 'Created .env from .env.example' -ForegroundColor Green
}

composer install
npm install

php artisan key:generate --force
php artisan migrate --seed

if (-not $SkipPlaywright) {
    npx playwright install
}

Write-Host ''
Write-Host 'Bootstrap complete.' -ForegroundColor Green
Write-Host 'Run the app stack with:' -ForegroundColor Yellow
Write-Host '  composer run dev'
Write-Host ''
Write-Host 'For full E2E setup, ensure .env contains valid E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.'
