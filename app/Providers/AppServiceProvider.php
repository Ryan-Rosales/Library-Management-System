<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;
use App\Mail\Transport\GmailApiTransport;

use Psr\Log\LoggerInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register custom Gmail API transport (sends via Gmail REST API using OAuth2)
        Mail::extend('gmail_api', function ($config = []) {
            $clientId = $config['client_id'] ?? config('services.gmail.client_id');
            $clientSecret = $config['client_secret'] ?? config('services.gmail.client_secret');
            $refreshToken = $config['refresh_token'] ?? config('services.gmail.refresh_token');
            $user = $config['user'] ?? config('services.gmail.user', 'me');

            return new GmailApiTransport($clientId, $clientSecret, $refreshToken, $user, app(LoggerInterface::class));
        });
    }
}
