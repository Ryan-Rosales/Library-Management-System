<?php

namespace App\Services;

use App\Mail\MemberWelcomeCredentialsMail;
use App\Mail\PasswordResetChangedNoticeMail;
use App\Mail\PasswordResetRejectedNoticeMail;
use App\Mail\PasswordResetVerificationLinkMail;
use App\Mail\StaffWelcomeCredentialsMail;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class TransactionalMailService
{
    private function ensureConfiguredMailer(): void
    {
        $defaultMailer = (string) config('mail.default');

        if (in_array($defaultMailer, ['log', 'array'], true)) {
            throw new RuntimeException('MAIL_MAILER is set to "'.$defaultMailer.'". This driver does not deliver real emails. Set MAIL_MAILER to a real mail driver (e.g. gmail_api or smtp) and provide valid credentials.');
        }

        if ($defaultMailer === 'gmail_api') {
            $clientId = (string) config('mail.mailers.gmail_api.client_id');
            $clientSecret = (string) config('mail.mailers.gmail_api.client_secret');
            $refreshToken = (string) config('mail.mailers.gmail_api.refresh_token');

            if ($clientId === '' || $clientSecret === '' || $refreshToken === '') {
                throw new RuntimeException('Gmail API requires GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET, and GMAIL_API_REFRESH_TOKEN to be set in the environment.');
            }

            return;
        }

        if ($defaultMailer === 'smtp') {
            $smtpHost = (string) config('mail.mailers.smtp.host');
            $smtpUsername = (string) config('mail.mailers.smtp.username');
            $smtpPassword = (string) config('mail.mailers.smtp.password');

            $isLocalTrap = ($smtpHost === '127.0.0.1' || $smtpHost === 'localhost') && $smtpUsername === '' && $smtpPassword === '';

            if ($isLocalTrap) {
                throw new RuntimeException('SMTP is pointing to a local mail trap ('.$smtpHost.'). Use real SMTP credentials to deliver to Gmail inboxes.');
            }
        }
    }

    public function sendMemberWelcomeCredentials(string $recipientEmail, string $recipientName, string $generatedPassword): void
    {
        $this->ensureConfiguredMailer();

        $mailable = new MemberWelcomeCredentialsMail(
            recipientName: $recipientName,
            recipientEmail: $recipientEmail,
            generatedPassword: $generatedPassword,
        );

        Mail::to($recipientEmail)->queue($mailable);
    }

    public function sendStaffWelcomeCredentials(string $recipientEmail, string $recipientName, string $generatedPassword): void
    {
        $this->ensureConfiguredMailer();

        $mailable = new StaffWelcomeCredentialsMail(
            recipientName: $recipientName,
            recipientEmail: $recipientEmail,
            generatedPassword: $generatedPassword,
        );

        Mail::to($recipientEmail)->queue($mailable);
    }

    public function sendPasswordResetVerificationLink(
        string $recipientEmail,
        string $recipientName,
        string $requesterName,
        string $requesterEmail,
        string $requesterRole,
        string $verificationUrl,
    ): void {
        $this->ensureConfiguredMailer();

        $mailable = new PasswordResetVerificationLinkMail(
            recipientName: $recipientName,
            requesterName: $requesterName,
            requesterEmail: $requesterEmail,
            requesterRole: $requesterRole,
            verificationUrl: $verificationUrl,
        );

        Mail::to($recipientEmail)->queue($mailable);
    }

    public function sendPasswordResetChangedNotice(
        string $recipientEmail,
        string $recipientName,
        string $newPassword,
        string $changedByName,
        string $changedByRole,
    ): void {
        $this->ensureConfiguredMailer();

        $mailable = new PasswordResetChangedNoticeMail(
            recipientName: $recipientName,
            recipientEmail: $recipientEmail,
            newPassword: $newPassword,
            changedByName: $changedByName,
            changedByRole: $changedByRole,
        );

        Mail::to($recipientEmail)->queue($mailable);
    }

    public function sendPasswordResetRejectedNotice(
        string $recipientEmail,
        string $recipientName,
        string $requesterRole,
        string $rejectedByName,
        string $rejectedByRole,
    ): void {
        $this->ensureConfiguredMailer();

        $mailable = new PasswordResetRejectedNoticeMail(
            recipientName: $recipientName,
            requesterRole: $requesterRole,
            rejectedByName: $rejectedByName,
            rejectedByRole: $rejectedByRole,
        );

        Mail::to($recipientEmail)->queue($mailable);
    }
}
