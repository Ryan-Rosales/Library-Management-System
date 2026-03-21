import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LockKeyhole, ShieldAlert } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function MemberPasswordReminderDialog() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const [open, setOpen] = useState(true);

    const isPasswordSettingsPage = useMemo(() => page.url.startsWith('/settings/password'), [page.url]);

    const mustShow = useMemo(() => {
        const user = auth?.user;

        return !isPasswordSettingsPage && (user?.role === 'member' || user?.role === 'staff') && user?.must_change_password === true;
    }, [auth, isPasswordSettingsPage]);

    if (!mustShow) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-lg border border-white/70 bg-white/95 p-0 shadow-[0_24px_60px_rgba(34,78,61,0.28)] backdrop-blur-xl dark:border-white/15 dark:bg-[#0d1f28eb] dark:shadow-[0_30px_80px_rgba(3,9,14,0.8)]">
                <div className="rounded-t-2xl bg-[linear-gradient(120deg,#ecfff5_0%,#eaf3ff_100%)] px-6 py-5 dark:bg-[linear-gradient(120deg,#113428_0%,#132a3f_100%)]">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#b7e8d2] bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-[#2f7c59] dark:border-[#3f8b6d] dark:bg-white/8 dark:text-[#9de8c8]">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        SECURITY REMINDER
                    </div>
                    <DialogTitle className="text-2xl font-semibold text-[#1e3028] dark:text-[#e0f7ec]" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                        Please change your password now
                    </DialogTitle>
                    <DialogDescription className="mt-2 text-sm leading-relaxed text-[#5b746b] dark:text-[#9ab4aa]">
                        Your account password was recently reset with a temporary value. For your safety, update it immediately to a private password only you know.
                    </DialogDescription>
                </div>

                <div className="space-y-4 px-6 pb-6 pt-5">
                    <div className="rounded-2xl border border-[#d6e6df] bg-[#f7fcf9] px-4 py-3 text-sm text-[#45695b] dark:border-white/12 dark:bg-white/6 dark:text-[#b7d9cc]">
                        <p className="inline-flex items-center gap-2 font-semibold text-[#2f7c59] dark:text-[#8edaba]">
                            <LockKeyhole className="h-4 w-4" />
                            Recommended password tips
                        </p>
                        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed">
                            <li>Use at least 12 characters.</li>
                            <li>Mix uppercase, lowercase, numbers, and symbols.</li>
                            <li>Do not reuse your old or shared passwords.</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-[#c7ddd2] text-[#2f5f4d] hover:bg-[#f2faf6] dark:border-white/20 dark:text-[#bfe8d6] dark:hover:bg-white/10"
                        >
                            Remind me later
                        </Button>
                        <Button asChild className="bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] text-white shadow-[0_10px_20px_rgba(34,126,92,0.3)] hover:shadow-[0_14px_24px_rgba(34,126,92,0.38)]">
                            <Link href={route('password.edit')} onClick={() => setOpen(false)}>
                                Change password now
                            </Link>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
