<?php

namespace App\Mail\Transport;

use GuzzleHttp\Client;
use Psr\Log\LoggerInterface;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mailer\SentMessage;

class GmailApiTransport extends AbstractTransport
{
    protected Client $client;
    protected string $clientId;
    protected string $clientSecret;
    protected string $refreshToken;
    protected string $user;

    public function __construct(string $clientId, string $clientSecret, string $refreshToken, string $user = 'me', ?LoggerInterface $logger = null)
    {
        parent::__construct(null, $logger);

        $this->client = new Client();
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
        $this->refreshToken = $refreshToken;
        $this->user = $user;
    }

    protected function getAccessToken(): string
    {
        $resp = $this->client->post('https://oauth2.googleapis.com/token', [
            'form_params' => [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $this->refreshToken,
                'grant_type' => 'refresh_token',
            ],
            'headers' => [
                'Accept' => 'application/json',
            ],
            'http_errors' => true,
        ]);

        $data = json_decode((string) $resp->getBody(), true);

        if (empty($data['access_token'])) {
            throw new \RuntimeException('Unable to obtain Gmail access token');
        }

        return $data['access_token'];
    }

    protected function doSend(SentMessage $message): void
    {
        $accessToken = $this->getAccessToken();

        $raw = base64_encode($message->toString());
        // Use URL-safe base64 (RFC 4648 §5)
        $raw = rtrim(strtr($raw, '+/', '-_'), '=');

        $url = sprintf('https://gmail.googleapis.com/gmail/v1/users/%s/messages/send', $this->user);

        $resp = $this->client->post($url, [
            'json' => ['raw' => $raw],
            'headers' => [
                'Authorization' => 'Bearer ' . $accessToken,
                'Accept' => 'application/json',
            ],
            'http_errors' => true,
        ]);

        $data = json_decode((string) $resp->getBody(), true);

        if (! empty($data['id'])) {
            $message->setMessageId((string) $data['id']);
        }

        if (! empty($data['message']) && is_string($data['message'])) {
            $message->appendDebug($data['message']);
        }
    }

    public function __toString(): string
    {
        return 'gmail_api';
    }
}
