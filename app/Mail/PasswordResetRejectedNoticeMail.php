<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetRejectedNoticeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $recipientName,
        public readonly string $requesterRole,
        public readonly string $rejectedByName,
        public readonly string $rejectedByRole,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Libraria - Forgot-password request rejected',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'emails.password-reset-rejected-notice',
            with: [
                'recipientName' => $this->recipientName,
                'requesterRole' => $this->requesterRole,
                'rejectedByName' => $this->rejectedByName,
                'rejectedByRole' => $this->rejectedByRole,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
