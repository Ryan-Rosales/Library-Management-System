<?php

namespace App\Services;

use App\Mail\MemberWelcomeCredentialsMail;
use App\Mail\PasswordResetChangedNoticeMail;
use App\Mail\PasswordResetRejectedNoticeMail;
use App\Mail\PasswordResetVerificationLinkMail;
use App\Mail\StaffWelcomeCredentialsMail;
use Illuminate\Support\Facades\Mail;
use Throwable;
use RuntimeException;

class TransactionalMailService
{
    public function __construct(
        private readonly GmailApiMailerService $gmailApiMailer,
    ) {
    }

    private function usingGmailApiMailer(): bool
    {
        $configured = strtolower((string) config('mail.default'));
        $runtime = strtolower((string) env('MAIL_MAILER', $configured));

        return $configured === 'gmail_api' || $runtime === 'gmail_api';
    }

    private function queueOrFallbackToGmailApi(string $recipientEmail, \Illuminate\Mail\Mailable $mailable): void
    {
        try {
            Mail::to($recipientEmail)->queue($mailable);
        } catch (Throwable $exception) {
            $message = $exception->getMessage();

            if ($this->usingGmailApiMailer() && str_contains($message, 'Mailer [gmail_api] is not defined')) {
                $this->gmailApiMailer->sendMailable($recipientEmail, $mailable);

                return;
            }

            throw $exception;
        }
    }

    private function ensureConfiguredMailer(): void
    {
        $defaultMailer = (string) config('mail.default');

        if ($defaultMailer === 'gmail_api') {
            $clientId = (string) env('GMAIL_API_CLIENT_ID');
            $clientSecret = (string) env('GMAIL_API_CLIENT_SECRET');
            $refreshToken = (string) env('GMAIL_API_REFRESH_TOKEN');
            $fromAddress = (string) config('mail.from.address');

            if ($clientId === '' || $clientSecret === '' || $refreshToken === '') {
                throw new RuntimeException('Gmail API mailer requires GMAIL_API_CLIENT_ID, GMAIL_API_CLIENT_SECRET, and GMAIL_API_REFRESH_TOKEN.');
            }

            if ($fromAddress === '') {
                throw new RuntimeException('MAIL_FROM_ADDRESS is required when using Gmail API mailer.');
            }

            return;
        }

        if (in_array($defaultMailer, ['log', 'array'], true)) {
            throw new RuntimeException('MAIL_MAILER is set to "'.$defaultMailer.'". This driver does not deliver real emails. Configure SMTP first.');
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

        if ($this->usingGmailApiMailer()) {
            $this->gmailApiMailer->sendMailable($recipientEmail, $mailable);

            return;
        }

        $this->queueOrFallbackToGmailApi($recipientEmail, $mailable);
    }

    public function sendStaffWelcomeCredentials(string $recipientEmail, string $recipientName, string $generatedPassword): void
    {
        $this->ensureConfiguredMailer();

        $mailable = new StaffWelcomeCredentialsMail(
            recipientName: $recipientName,
            recipientEmail: $recipientEmail,
            generatedPassword: $generatedPassword,
        );

        if ($this->usingGmailApiMailer()) {
            $this->gmailApiMailer->sendMailable($recipientEmail, $mailable);

            return;
        }

        $this->queueOrFallbackToGmailApi($recipientEmail, $mailable);
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

        if ($this->usingGmailApiMailer()) {
            $this->gmailApiMailer->sendMailable($recipientEmail, $mailable);

            return;
        }

        $this->queueOrFallbackToGmailApi($recipientEmail, $mailable);
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

        if ($this->usingGmailApiMailer()) {
            $this->gmailApiMailer->sendMailable($recipientEmail, $mailable);

            return;
        }

        $this->queueOrFallbackToGmailApi($recipientEmail, $mailable);
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

        if ($this->usingGmailApiMailer()) {
            $this->gmailApiMailer->sendMailable($recipientEmail, $mailable);

            return;
        }

        $this->queueOrFallbackToGmailApi($recipientEmail, $mailable);
    }
}
