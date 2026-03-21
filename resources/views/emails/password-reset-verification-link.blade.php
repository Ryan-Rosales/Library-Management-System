Hello {{ $recipientName }},

You requested a forgot-password reset in Libraria.
Account: {{ $requesterName }} ({{ $requesterRole }})
Email: {{ $requesterEmail }}

Click this verification link:
{{ $verificationUrl }}

After verifying, the admin/staff can proceed to change your password.

Regards,
Libraria Team
