<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class Web3SchoolMailService
{
    public function sendMemberWelcomeCredentials(string $recipientEmail, string $recipientName, string $generatedPassword): void
    {
        $endpoint = (string) config('services.web3school_mail.endpoint');
        $apiKey = (string) config('services.web3school_mail.api_key');

        if ($endpoint === '' || $apiKey === '') {
            throw new RuntimeException('Web3School mail API is not configured.');
        }

        $subject = 'Welcome to Libraria - Your member account details';
        $message = implode("\n", [
            "Hello {$recipientName},",
            '',
            'Welcome to Libraria. Your membership request has been approved.',
            'You can now access your account using the credentials below:',
            "Email: {$recipientEmail}",
            "Password: {$generatedPassword}",
            '',
            'Please log in and change your password as soon as possible for security.',
            '',
            'Regards,',
            'Libraria Team',
        ]);

        $response = Http::timeout(20)->acceptJson()->post($endpoint, [
            'api_key' => $apiKey,
            'from_email' => config('services.web3school_mail.from_email'),
            'from_name' => config('services.web3school_mail.from_name'),
            'to' => $recipientEmail,
            'to_email' => $recipientEmail,
            'subject' => $subject,
            'message' => $message,
        ]);

        if ($response->failed()) {
            throw new RuntimeException('Web3School mail API request failed.');
        }
    }
}
