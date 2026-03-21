<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetVerificationLinkMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $recipientName,
        public readonly string $requesterName,
        public readonly string $requesterEmail,
        public readonly string $requesterRole,
        public readonly string $verificationUrl,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Libraria - Verify forgot-password request',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'emails.password-reset-verification-link',
            with: [
                'recipientName' => $this->recipientName,
                'requesterName' => $this->requesterName,
                'requesterEmail' => $this->requesterEmail,
                'requesterRole' => $this->requesterRole,
                'verificationUrl' => $this->verificationUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
