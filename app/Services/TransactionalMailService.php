<?php

namespace App\Services;

use App\Mail\MemberWelcomeCredentialsMail;
use Illuminate\Support\Facades\Mail;
use RuntimeException;

class TransactionalMailService
{
    public function sendMemberWelcomeCredentials(string $recipientEmail, string $recipientName, string $generatedPassword): void
    {
        $defaultMailer = (string) config('mail.default');

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

        Mail::to($recipientEmail)->send(
            new MemberWelcomeCredentialsMail(
                recipientName: $recipientName,
                recipientEmail: $recipientEmail,
                generatedPassword: $generatedPassword,
            )
        );
    }
}
