<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetChangedNoticeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $recipientName,
        public readonly string $recipientEmail,
        public readonly string $newPassword,
        public readonly string $changedByName,
        public readonly string $changedByRole,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Libraria - Your password has been updated',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'emails.password-reset-changed-notice',
            with: [
                'recipientName' => $this->recipientName,
                'recipientEmail' => $this->recipientEmail,
                'newPassword' => $this->newPassword,
                'changedByName' => $this->changedByName,
                'changedByRole' => $this->changedByRole,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
