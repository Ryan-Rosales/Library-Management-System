import { Head, Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth-layout';

type VerificationStatus = 'verified' | 'invalid';

interface PasswordRequestVerificationProps {
    status: VerificationStatus;
    message: string;
}

export default function PasswordRequestVerification({ status, message }: PasswordRequestVerificationProps) {
    const isVerified = status === 'verified';

    return (
        <AuthLayout
            title={isVerified ? 'Password Request Verified' : 'Verification Link Invalid'}
            description={isVerified ? 'Your request has been confirmed successfully.' : 'This link cannot be used anymore.'}
        >
            <Head title={isVerified ? 'Password Request Verified' : 'Verification Link Invalid'} />

            <div className="space-y-6 text-center">
                <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                        isVerified
                            ? 'border-[#bfe8d5] bg-[#effaf4] text-[#265d48] dark:border-[#2f5f4b] dark:bg-[#0f231b] dark:text-[#b9e8d4]'
                            : 'border-[#f0c7c7] bg-[#fff3f3] text-[#7f2d2d] dark:border-[#6b2f2f] dark:bg-[#2a1515] dark:text-[#f7c9c9]'
                    }`}
                >
                    {message}
                </div>

                {isVerified && (
                    <p className="text-sm text-muted-foreground">
                        Staff or admin can now continue in User Account Control to change your password.
                    </p>
                )}

                <div className="flex justify-center gap-2">
                    <Button asChild>
                        <Link href={route('login')}>Back to sign in</Link>
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
}
