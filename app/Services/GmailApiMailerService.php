<?php

namespace App\Services;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\View;
use RuntimeException;

class GmailApiMailerService
{
    private ?string $cachedAccessToken = null;

    private ?int $cachedAccessTokenExpiresAt = null;

    public function sendMailable(string $recipientEmail, Mailable $mailable): void
    {
        $content = $mailable->content();
        $subject = (string) ($mailable->envelope()->subject ?? config('app.name', 'Libraria'));
        $viewData = is_array($content->with ?? null) ? $content->with : [];

        if ($content->text) {
            $body = View::make($content->text, $viewData)->render();
            $this->sendRawMessage($recipientEmail, $subject, $body, 'text/plain; charset=UTF-8');

            return;
        }

        if ($content->html) {
            $body = View::make($content->html, $viewData)->render();
            $this->sendRawMessage($recipientEmail, $subject, $body, 'text/html; charset=UTF-8');

            return;
        }

        throw new RuntimeException('Gmail API sender requires a text or html mailable view.');
    }

    private function sendRawMessage(string $recipientEmail, string $subject, string $body, string $contentType): void
    {
        $fromAddress = (string) config('mail.from.address');
        $fromName = (string) config('mail.from.name', config('app.name', 'Libraria'));
        $gmailApiUser = (string) env('GMAIL_API_USER', 'me');

        $fromHeader = $fromName !== '' ? sprintf('%s <%s>', $fromName, $fromAddress) : $fromAddress;

        $headers = [
            'From: '.$fromHeader,
            'To: '.$recipientEmail,
            'Subject: '.$subject,
            'MIME-Version: 1.0',
            'Content-Type: '.$contentType,
            'Content-Transfer-Encoding: 8bit',
        ];

        $mimeMessage = implode("\r\n", $headers)."\r\n\r\n".$body;
        $rawMessage = rtrim(strtr(base64_encode($mimeMessage), '+/', '-_'), '=');

        $response = Http::timeout(30)
            ->withToken($this->getAccessToken())
            ->post('https://gmail.googleapis.com/gmail/v1/users/'.urlencode($gmailApiUser).'/messages/send', [
                'raw' => $rawMessage,
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Gmail API send failed: '.$response->status().' '.$response->body());
        }
    }

    private function getAccessToken(): string
    {
        if ($this->cachedAccessToken !== null && $this->cachedAccessTokenExpiresAt !== null && time() < $this->cachedAccessTokenExpiresAt) {
            return $this->cachedAccessToken;
        }

        $clientId = (string) env('GMAIL_API_CLIENT_ID');
        $clientSecret = (string) env('GMAIL_API_CLIENT_SECRET');
        $refreshToken = (string) env('GMAIL_API_REFRESH_TOKEN');

        if ($clientId === '' || $clientSecret === '' || $refreshToken === '') {
            throw new RuntimeException('Gmail API credentials are missing. Set GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET, and GMAIL_API_REFRESH_TOKEN.');
        }

        $response = Http::asForm()
            ->timeout(30)
            ->post('https://oauth2.googleapis.com/token', [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'refresh_token' => $refreshToken,
                'grant_type' => 'refresh_token',
            ]);

        if (! $response->successful()) {
            throw new RuntimeException('Gmail API token request failed: '.$response->status().' '.$response->body());
        }

        $payload = $response->json();
        $accessToken = (string) ($payload['access_token'] ?? '');
        $expiresIn = (int) ($payload['expires_in'] ?? 3600);

        if ($accessToken === '') {
            throw new RuntimeException('Gmail API token response did not include access_token.');
        }

        $this->cachedAccessToken = $accessToken;
        $this->cachedAccessTokenExpiresAt = time() + max(60, $expiresIn - 60);

        return $this->cachedAccessToken;
    }
}
