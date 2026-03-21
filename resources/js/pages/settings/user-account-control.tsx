import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Maximize2, Minimize2, WandSparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const generateSecurePassword = (length = 12) => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    const randomBytes = new Uint32Array(length);
    window.crypto.getRandomValues(randomBytes);

    return Array.from(randomBytes)
        .map((value) => charset[value % charset.length])
        .join('');
};

interface ManagedUser {
    id: number;
    name: string;
    email: string;
    role: 'staff' | 'member';
}

interface PendingStaffRequest {
    id: number;
    requester_user_id: number | null;
    requester_name: string | null;
    requester_email: string;
    requester_role: 'staff' | 'member';
    target_role: 'admin' | 'staff';
    reason: string | null;
    verified_by_user_id: number | null;
    verified_at: string | null;
    created_at: string | null;
    seen_at: string | null;
}

interface UserAccountControlProps {
    viewerRole: 'admin' | 'staff';
    users: ManagedUser[];
    pendingRequests: PendingStaffRequest[];
    selectedRequestId: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User account control',
        href: '/settings/user-account-control',
    },
];

export default function UserAccountControl({ viewerRole, users, pendingRequests, selectedRequestId }: UserAccountControlProps) {
    const isAdmin = viewerRole === 'admin';
    const [showProcessPanel, setShowProcessPanel] = useState(true);
    const defaultUserId = users[0]?.id ?? 0;
    const defaultRequestId =
        selectedRequestId && pendingRequests.some((item) => item.id === selectedRequestId)
            ? selectedRequestId
            : (pendingRequests[0]?.id ?? 0);

    const emailForm = useForm({
        user_id: defaultUserId,
        email: users[0]?.email ?? '',
    });

    const passwordForm = useForm({
        request_id: defaultRequestId,
        password: '',
        password_confirmation: '',
    });

    const selectedEmailUser = useMemo(
        () => users.find((user) => user.id === Number(emailForm.data.user_id)) ?? null,
        [users, emailForm.data.user_id],
    );

    const selectedEmailUserRequests = useMemo(() => {
        if (!selectedEmailUser) {
            return [];
        }

        return pendingRequests.filter((request) => {
            if (request.requester_user_id) {
                return request.requester_user_id === selectedEmailUser.id;
            }

            return request.requester_email === selectedEmailUser.email;
        });
    }, [pendingRequests, selectedEmailUser]);

    const selectedPasswordRequest = useMemo(
        () => pendingRequests.find((request) => request.id === Number(passwordForm.data.request_id)) ?? null,
        [pendingRequests, passwordForm.data.request_id],
    );

    const selectedStaffUser = useMemo(() => {
        if (!selectedPasswordRequest) {
            return null;
        }

        if (selectedPasswordRequest.requester_user_id) {
            return users.find((user) => user.id === selectedPasswordRequest.requester_user_id) ?? null;
        }

        return users.find((user) => user.email === selectedPasswordRequest.requester_email) ?? null;
    }, [users, selectedPasswordRequest]);

    const isVerifiedForCurrentUser = useMemo(() => {
        if (!selectedPasswordRequest) {
            return false;
        }

        return selectedPasswordRequest.verified_at !== null;
    }, [selectedPasswordRequest]);

    useEffect(() => {
        if (!selectedPasswordRequest) {
            return;
        }

        if (selectedPasswordRequest.requester_role === 'member' && !passwordForm.data.password) {
            const generatedPassword = generateSecurePassword();
            passwordForm.setData('password', generatedPassword);
            passwordForm.setData('password_confirmation', generatedPassword);
        }
    }, [selectedPasswordRequest, passwordForm]);

    const onEmailUserChange = (nextUserId: number) => {
        const nextUser = users.find((user) => user.id === nextUserId);

        emailForm.setData({
            user_id: nextUserId,
            email: nextUser?.email ?? '',
        });
    };

    const submitEmailUpdate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedEmailUser) {
            return;
        }

        emailForm.patch(route('settings.user-account-control.email.update', selectedEmailUser.id), {
            preserveScroll: true,
        });
    };

    const submitPasswordUpdate = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedStaffUser || !selectedPasswordRequest) {
            return;
        }

        passwordForm.put(route('settings.user-account-control.password.update', selectedStaffUser.id), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset('password', 'password_confirmation'),
        });
    };

    const rejectPasswordRequest = () => {
        if (!selectedStaffUser || !selectedPasswordRequest) {
            return;
        }

        router.post(
            route('settings.user-account-control.password.reject', selectedStaffUser.id),
            {
                request_id: selectedPasswordRequest.id,
            },
            {
                preserveScroll: true,
                onSuccess: () => passwordForm.reset('password', 'password_confirmation'),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User account control" />

            <SettingsLayout>
                <div className="min-h-[34rem] space-y-6 rounded-2xl border border-[#d5e7df] bg-white/75 p-6 shadow-sm dark:border-white/12 dark:bg-white/6 md:p-7">
                    <HeadingSmall
                        title="User account control"
                        description={
                            isAdmin
                                ? 'Manage user email addresses and process staff or member password change requests.'
                                : 'Process member password change requests.'
                        }
                    />

                    <div className="grid gap-6 lg:grid-cols-2">
                        {isAdmin && (
                            <section className="rounded-2xl border border-[#d9e8e1] bg-white/80 p-4 dark:border-white/12 dark:bg-white/6">
                            <h3 className="mb-1 text-sm font-semibold text-[#2a5849] dark:text-[#bfe7d7]">Update user email</h3>
                            <p className="mb-4 text-xs text-[#657a72] dark:text-[#9ab2a8]">Admins can update the email of staff and member accounts.</p>

                            <form onSubmit={submitEmailUpdate} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email_user_id">Select user</Label>
                                    <select
                                        id="email_user_id"
                                        value={emailForm.data.user_id}
                                        onChange={(event) => onEmailUserChange(Number(event.target.value))}
                                        className="h-10 w-full rounded-xl border border-[#d0dfd8] bg-white px-3 text-sm dark:border-white/18 dark:bg-white/8"
                                    >
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={emailForm.data.email}
                                        onChange={(event) => emailForm.setData('email', event.target.value)}
                                        placeholder="user@library.ph"
                                        required
                                    />
                                    <InputError message={emailForm.errors.email} />
                                </div>

                                <div className="rounded-xl border border-[#d4e5dc] bg-[#f5fcf8] px-3 py-2 text-xs text-[#45695b] dark:border-white/18 dark:bg-white/8 dark:text-[#b6d9cb]">
                                    <p>
                                        Requester indicator:{' '}
                                        {selectedEmailUserRequests.length > 0
                                            ? `${selectedEmailUserRequests.length} pending forgot-password request(s) by this user`
                                            : 'No pending forgot-password request by this user'}
                                    </p>
                                    {selectedEmailUserRequests.length > 0 && (
                                        <p className="mt-1">
                                            Latest: {selectedEmailUserRequests[0]?.requester_name || selectedEmailUserRequests[0]?.requester_email} ({selectedEmailUserRequests[0]?.requester_role})
                                        </p>
                                    )}
                                </div>

                                <Button disabled={emailForm.processing || !selectedEmailUser}>Save email</Button>
                            </form>
                            </section>
                        )}

                        <section className="rounded-2xl border border-[#d9e8e1] bg-white/80 p-4 dark:border-white/12 dark:bg-white/6">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h3 className="mb-1 text-sm font-semibold text-[#2a5849] dark:text-[#bfe7d7]">Process forgot-password request</h3>
                                    <p className="text-xs text-[#657a72] dark:text-[#9ab2a8]">
                                        {isAdmin
                                            ? 'Admins can process pending requests from members and staff.'
                                            : 'Staff can process pending requests from members only.'}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    aria-label={showProcessPanel ? 'Minimize forgot-password panel' : 'Maximize forgot-password panel'}
                                    title={showProcessPanel ? 'Minimize panel' : 'Maximize panel'}
                                    onClick={() => setShowProcessPanel((current) => !current)}
                                    className="h-9 w-9 rounded-full p-0 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(33,72,60,0.18)] focus-visible:ring-2 focus-visible:ring-[#6fc8a1]/65"
                                >
                                    {showProcessPanel ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                </Button>
                            </div>

                            {!showProcessPanel ? (
                                <p className="rounded-xl border border-dashed border-[#c9ddd3] bg-[#f7fcf9] px-3 py-2 text-xs text-[#64786f] dark:border-white/18 dark:bg-white/6 dark:text-[#9ab2a8]">
                                    Forgot-password panel is minimized.
                                </p>
                            ) : pendingRequests.length === 0 ? (
                                <p className="rounded-xl border border-dashed border-[#c9ddd3] bg-[#f7fcf9] px-3 py-2 text-xs text-[#64786f] dark:border-white/18 dark:bg-white/6 dark:text-[#9ab2a8]">
                                    No pending password change requests.
                                </p>
                            ) : (
                                <form onSubmit={submitPasswordUpdate} className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="request_id">Pending request</Label>
                                        <select
                                            id="request_id"
                                            value={passwordForm.data.request_id}
                                            onChange={(event) => {
                                                passwordForm.setData('request_id', Number(event.target.value));
                                                passwordForm.setData('password', '');
                                                passwordForm.setData('password_confirmation', '');
                                            }}
                                            className="h-10 w-full rounded-xl border border-[#d0dfd8] bg-white px-3 text-sm dark:border-white/18 dark:bg-white/8"
                                        >
                                            {pendingRequests.map((request) => (
                                                <option key={request.id} value={request.id}>
                                                    {(request.requester_name || request.requester_email) + ` (${request.requester_role})`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        {pendingRequests.map((request) => {
                                            const isSelected = request.id === Number(passwordForm.data.request_id);

                                            return (
                                                <button
                                                    key={request.id}
                                                    type="button"
                                                    onClick={() => {
                                                        passwordForm.setData('request_id', request.id);
                                                        passwordForm.setData('password', '');
                                                        passwordForm.setData('password_confirmation', '');
                                                    }}
                                                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                                                        isSelected
                                                            ? 'border-[#66c89c] bg-[#eaf8f1] shadow-sm dark:border-[#72d7aa]/60 dark:bg-[#14372d]'
                                                            : 'border-[#d4e5dc] bg-[#f8fcfa] hover:border-[#9bcfb7] hover:bg-[#f1f9f5] dark:border-white/15 dark:bg-white/6 dark:hover:border-[#76b89c] dark:hover:bg-white/10'
                                                    }`}
                                                >
                                                    <p className="font-semibold text-[#2f5d4d] dark:text-[#bfe7d7]">{request.requester_name || request.requester_email}</p>
                                                    <p className="mt-0.5 text-[#5e766b] dark:text-[#9cb9ae]">{request.requester_email}</p>
                                                    <p className="mt-0.5 text-[11px] text-[#5e766b] dark:text-[#9cb9ae]">Role: {request.requester_role} | Target: {request.target_role}</p>
                                                    <p className="mt-0.5 text-[11px] text-[#5e766b] dark:text-[#9cb9ae]">
                                                        Verification: {request.verified_at ? 'Verified from email link' : 'Pending email verification'}
                                                    </p>
                                                    {request.reason && <p className="mt-1 line-clamp-2 text-[#4f665d] dark:text-[#b5d5c8]">Reason: {request.reason}</p>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="rounded-xl border border-[#d4e5dc] bg-[#f5fcf8] px-3 py-2 text-xs text-[#45695b] dark:border-white/18 dark:bg-white/8 dark:text-[#b6d9cb]">
                                        <p>
                                            Requester: {selectedStaffUser?.name || selectedPasswordRequest?.requester_name || 'Unknown'} ({selectedPasswordRequest?.requester_email || '-'})
                                        </p>
                                        <p className="mt-1">Role: {selectedPasswordRequest?.requester_role || '-'} | Target: {selectedPasswordRequest?.target_role || '-'}</p>
                                        <p className="mt-1">Verification: {selectedPasswordRequest?.verified_at ? 'Verified' : 'Pending verification from email link'}</p>
                                        {selectedPasswordRequest?.reason && <p className="mt-1">Reason: {selectedPasswordRequest.reason}</p>}
                                    </div>

                                    {!isVerifiedForCurrentUser && (
                                        <p className="rounded-xl border border-dashed border-[#d8dfd8] bg-[#f8fbf9] px-3 py-2 text-xs text-[#64786f] dark:border-white/18 dark:bg-white/6 dark:text-[#9ab2a8]">
                                            Password cannot be changed yet. The requester must click the verification link sent to their own email first.
                                        </p>
                                    )}

                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <Label htmlFor="password">New password</Label>
                                            {selectedPasswordRequest?.requester_role === 'member' && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    aria-label="Auto-generate member password"
                                                    title="Auto-generate member password"
                                                    onClick={() => {
                                                        const generatedPassword = generateSecurePassword();
                                                        passwordForm.setData('password', generatedPassword);
                                                        passwordForm.setData('password_confirmation', generatedPassword);
                                                    }}
                                                    className="h-9 w-9 rounded-full p-0 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_8px_18px_rgba(33,72,60,0.18)] focus-visible:ring-2 focus-visible:ring-[#6fc8a1]/65"
                                                >
                                                    <WandSparkles className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="text"
                                            value={passwordForm.data.password}
                                            onChange={(event) => passwordForm.setData('password', event.target.value)}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <InputError message={passwordForm.errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">Confirm new password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="text"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(event) => passwordForm.setData('password_confirmation', event.target.value)}
                                            autoComplete="new-password"
                                            required
                                        />
                                        <InputError message={passwordForm.errors.password_confirmation} />
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button disabled={passwordForm.processing || !selectedStaffUser || !selectedPasswordRequest || !isVerifiedForCurrentUser}>Update password</Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={rejectPasswordRequest}
                                            disabled={passwordForm.processing || !selectedStaffUser || !selectedPasswordRequest}
                                        >
                                            Reject request
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </section>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
