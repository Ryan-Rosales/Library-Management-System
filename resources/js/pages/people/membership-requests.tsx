import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface MembershipRequestItem {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    region_name: string;
    province_name: string | null;
    city_municipality_name: string;
    barangay_name: string;
    street_address: string | null;
    status: 'pending' | 'reviewed';
    review_outcome: 'approved' | 'rejected' | null;
    reviewed_by: {
        id: number;
        name: string;
        role: string;
    } | null;
    email_delivery_status: 'sent' | 'failed' | null;
    email_delivery_message: string | null;
    created_at: string | null;
    seen_at: string | null;
    resolved_at: string | null;
}

interface MembershipRequestsProps {
    pendingRequests: MembershipRequestItem[];
    recentlyReviewed: MembershipRequestItem[];
    selectedRequestId: number;
}

const generateSecurePassword = (length = 12) => {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    const randomBytes = new Uint32Array(length);
    window.crypto.getRandomValues(randomBytes);

    return Array.from(randomBytes)
        .map((value) => charset[value % charset.length])
        .join('');
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Membership Requests',
        href: '/membership-requests',
    },
];

export default function MembershipRequests({ pendingRequests, recentlyReviewed, selectedRequestId }: MembershipRequestsProps) {
    const [showHistory, setShowHistory] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [historyOutcomeFilter, setHistoryOutcomeFilter] = useState<'all' | 'approved' | 'rejected'>('all');
    const [historyEmailFilter, setHistoryEmailFilter] = useState<'all' | 'sent' | 'failed'>('all');

    const initialSelectedId =
        selectedRequestId && pendingRequests.some((item) => item.id === selectedRequestId)
            ? selectedRequestId
            : (pendingRequests[0]?.id ?? 0);

    const actionForm = useForm({
        request_id: initialSelectedId,
        member_password: '',
    });

    const selectedRequest = useMemo(
        () => pendingRequests.find((item) => item.id === Number(actionForm.data.request_id)) ?? null,
        [pendingRequests, actionForm.data.request_id],
    );

    const selectedAddress = useMemo(() => {
        if (!selectedRequest) {
            return '';
        }

        return [
            selectedRequest.street_address,
            selectedRequest.barangay_name,
            selectedRequest.city_municipality_name,
            selectedRequest.province_name,
            selectedRequest.region_name,
        ]
            .filter(Boolean)
            .join(', ');
    }, [selectedRequest]);

    const filteredReviewed = useMemo(() => {
        return recentlyReviewed.filter((item) => {
            const search = historySearch.trim().toLowerCase();
            const matchesSearch =
                search.length === 0 ||
                item.name.toLowerCase().includes(search) ||
                item.email.toLowerCase().includes(search) ||
                (item.reviewed_by?.name.toLowerCase().includes(search) ?? false);

            const matchesOutcome = historyOutcomeFilter === 'all' || item.review_outcome === historyOutcomeFilter;

            const matchesEmailStatus =
                historyEmailFilter === 'all' ||
                (historyEmailFilter === 'sent' && item.email_delivery_status === 'sent') ||
                (historyEmailFilter === 'failed' && item.email_delivery_status === 'failed');

            return matchesSearch && matchesOutcome && matchesEmailStatus;
        });
    }, [recentlyReviewed, historySearch, historyOutcomeFilter, historyEmailFilter]);

    const submitApprove = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedRequest) {
            return;
        }

        actionForm.post(route('membership-requests.approve', selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => actionForm.reset('member_password'),
        });
    };

    const submitReject = () => {
        if (!selectedRequest) {
            return;
        }

        actionForm.post(route('membership-requests.reject', selectedRequest.id), {
            preserveScroll: true,
            onSuccess: () => actionForm.reset('member_password'),
        });
    };

    const getFallbackMembersShortcut = (item: MembershipRequestItem) =>
        route('members', {
            prefill_name: item.name,
            prefill_email: item.email,
            prefill_contact_number: item.contact_number,
            prefill_region_name: item.region_name,
            prefill_province_name: item.province_name || '',
            prefill_city_municipality_name: item.city_municipality_name,
            prefill_barangay_name: item.barangay_name,
            prefill_street_address: item.street_address || '',
        });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Membership Requests" />

            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-3 py-4 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-5 md:py-5">
                <div className="relative z-10 flex min-h-full flex-1 rounded-3xl border border-white/70 bg-white/82 p-4 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#0d1f28cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)] md:p-5">
                    <div className="w-full space-y-5">
                        <HeadingSmall title="Membership requests" description="Review requests and approve or reject directly from this page." />

                        <div className="grid gap-5 lg:grid-cols-[1.1fr_1.2fr]">
                            <section className="rounded-2xl border border-[#d5e7df] bg-white/80 p-4 dark:border-white/12 dark:bg-white/6">
                                <h3 className="mb-3 text-sm font-semibold text-[#2a5849] dark:text-[#bfe7d7]">Pending</h3>

                                {pendingRequests.length === 0 ? (
                                    <p className="rounded-xl border border-dashed border-[#c9ddd3] bg-[#f7fcf9] px-3 py-2 text-xs text-[#64786f] dark:border-white/18 dark:bg-white/6 dark:text-[#9ab2a8]">
                                        No pending membership requests.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {pendingRequests.map((item) => {
                                            const isSelected = item.id === Number(actionForm.data.request_id);

                                            return (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => actionForm.setData('request_id', item.id)}
                                                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs transition ${
                                                        isSelected
                                                            ? 'border-[#66c89c] bg-[#eaf8f1] shadow-sm dark:border-[#72d7aa]/60 dark:bg-[#14372d]'
                                                            : 'border-[#d4e5dc] bg-[#f8fcfa] hover:border-[#9bcfb7] hover:bg-[#f1f9f5] dark:border-white/15 dark:bg-white/6 dark:hover:border-[#76b89c] dark:hover:bg-white/10'
                                                    }`}
                                                >
                                                    <p className="font-semibold text-[#2f5d4d] dark:text-[#bfe7d7]">{item.name}</p>
                                                    <p className="mt-0.5 text-[#5e766b] dark:text-[#9cb9ae]">{item.email}</p>
                                                    <p className="mt-1 text-[#4f665d] dark:text-[#b5d5c8]">{item.contact_number}</p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </section>

                            <section className="rounded-2xl border border-[#d5e7df] bg-white/80 p-4 dark:border-white/12 dark:bg-white/6">
                                <h3 className="mb-3 text-sm font-semibold text-[#2a5849] dark:text-[#bfe7d7]">Request details</h3>

                                {!selectedRequest ? (
                                    <p className="rounded-xl border border-dashed border-[#c9ddd3] bg-[#f7fcf9] px-3 py-2 text-xs text-[#64786f] dark:border-white/18 dark:bg-white/6 dark:text-[#9ab2a8]">
                                        Select a request to review details.
                                    </p>
                                ) : (
                                    <form onSubmit={submitApprove} className="space-y-4">
                                        <div className="rounded-xl border border-[#d4e5dc] bg-[#f5fcf8] px-3 py-2 text-xs text-[#45695b] dark:border-white/18 dark:bg-white/8 dark:text-[#b6d9cb]">
                                            <p>Name: {selectedRequest.name}</p>
                                            <p className="mt-1">Email: {selectedRequest.email}</p>
                                            <p className="mt-1">Contact: {selectedRequest.contact_number}</p>
                                            <p className="mt-1">Address: {selectedAddress}</p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="member_password">Generated member password</Label>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <input
                                                    id="member_password"
                                                    type="text"
                                                    value={actionForm.data.member_password}
                                                    onChange={(event) => actionForm.setData('member_password', event.target.value)}
                                                    className="h-10 w-full rounded-xl border border-[#d0dfd8] bg-white px-3 text-sm dark:border-white/18 dark:bg-white/8"
                                                    placeholder="Click generate password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => actionForm.setData('member_password', generateSecurePassword())}
                                                >
                                                    Generate password
                                                </Button>
                                            </div>
                                            <p className="text-xs text-[#5c766b] dark:text-[#9cb9ae]">
                                                This password and the member email will be sent in the welcome email after approval.
                                            </p>
                                            <InputError message={actionForm.errors.member_password} />
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button disabled={actionForm.processing}>Approve and create member</Button>
                                            <Button type="button" variant="destructive" onClick={submitReject} disabled={actionForm.processing}>
                                                Reject request
                                            </Button>
                                            {selectedRequest && (
                                                <Link
                                                    href={getFallbackMembersShortcut(selectedRequest)}
                                                    className="inline-flex items-center rounded-lg border border-[#c5dace] bg-white px-3 py-2 text-xs font-semibold text-[#2f6b53] transition hover:bg-[#f3faf7] dark:border-white/20 dark:bg-white/8 dark:text-[#bfe8d6] dark:hover:bg-white/12"
                                                >
                                                    Create in Members form (fallback)
                                                </Link>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </section>
                        </div>

                        <section className="rounded-2xl border border-[#d5e7df] bg-white/80 p-4 dark:border-white/12 dark:bg-white/6">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold text-[#2a5849] dark:text-[#bfe7d7]">Recently reviewed</h3>
                                <Button type="button" variant="outline" onClick={() => setShowHistory((current) => !current)}>
                                    {showHistory ? 'Hide history' : `Show history (${recentlyReviewed.length})`}
                                </Button>
                            </div>

                            {showHistory &&
                                (recentlyReviewed.length === 0 ? (
                                    <p className="text-xs text-[#64786f] dark:text-[#9ab2a8]">No reviewed requests yet.</p>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="grid gap-2 md:grid-cols-3">
                                            <input
                                                type="text"
                                                value={historySearch}
                                                onChange={(event) => setHistorySearch(event.target.value)}
                                                placeholder="Search name, email, reviewer"
                                                className="h-10 rounded-xl border border-[#d0dfd8] bg-white px-3 text-sm dark:border-white/18 dark:bg-white/8"
                                            />
                                            <select
                                                value={historyOutcomeFilter}
                                                onChange={(event) => setHistoryOutcomeFilter(event.target.value as 'all' | 'approved' | 'rejected')}
                                                className="h-10 rounded-xl border border-[#d0dfd8] bg-white px-3 text-sm dark:border-white/18 dark:bg-white/8"
                                            >
                                                <option value="all">All outcomes</option>
                                                <option value="approved">Approved only</option>
                                                <option value="rejected">Rejected only</option>
                                            </select>
                                            <select
                                                value={historyEmailFilter}
                                                onChange={(event) => setHistoryEmailFilter(event.target.value as 'all' | 'sent' | 'failed')}
                                                className="h-10 rounded-xl border border-[#d0dfd8] bg-white px-3 text-sm dark:border-white/18 dark:bg-white/8"
                                            >
                                                <option value="all">All email statuses</option>
                                                <option value="sent">Email sent</option>
                                                <option value="failed">Email failed</option>
                                            </select>
                                        </div>

                                        {filteredReviewed.length === 0 ? (
                                            <p className="text-xs text-[#64786f] dark:text-[#9ab2a8]">No records match your filters.</p>
                                        ) : (
                                            <div className="overflow-x-auto rounded-xl border border-[#d4e5dc] dark:border-white/15">
                                                <table className="min-w-full divide-y divide-[#d4e5dc] text-xs dark:divide-white/15">
                                                    <thead className="bg-[#f1faf5] dark:bg-white/8">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Name</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Email</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Outcome</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Email status</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Reviewed by</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Resolved</th>
                                                            <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#d4e5dc] bg-white/70 dark:divide-white/10 dark:bg-white/6">
                                                        {filteredReviewed.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-3 py-2 text-[#2f5d4d] dark:text-[#bfe7d7]">{item.name}</td>
                                                                <td className="px-3 py-2 text-[#5e766b] dark:text-[#9cb9ae]">{item.email}</td>
                                                                <td className="px-3 py-2">
                                                                    <span
                                                                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                                                            item.review_outcome === 'approved'
                                                                                ? 'bg-[#e6f7ef] text-[#226a4a] dark:bg-[#1a3c2f] dark:text-[#b2ead1]'
                                                                                : 'bg-[#fdeaea] text-[#8a3030] dark:bg-[#442020] dark:text-[#ffb4b4]'
                                                                        }`}
                                                                    >
                                                                        {item.review_outcome}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2">
                                                                    {item.review_outcome === 'approved' ? (
                                                                        <span
                                                                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                                                                                item.email_delivery_status === 'sent'
                                                                                    ? 'bg-[#e7f6ea] text-[#1f6a43] dark:bg-[#173824] dark:text-[#afe6c6]'
                                                                                    : 'bg-[#fdeaea] text-[#8a3030] dark:bg-[#442020] dark:text-[#ffb4b4]'
                                                                            }`}
                                                                        >
                                                                            {item.email_delivery_status === 'sent' ? 'Email sent' : 'Email failed'}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[#5e766b] dark:text-[#9cb9ae]">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-3 py-2 text-[#5e766b] dark:text-[#9cb9ae]">
                                                                    {item.reviewed_by ? `${item.reviewed_by.name} (${item.reviewed_by.role})` : '-'}
                                                                </td>
                                                                <td className="px-3 py-2 text-[#5e766b] dark:text-[#9cb9ae]">{item.resolved_at || '-'}</td>
                                                                <td className="px-3 py-2">
                                                                    {item.review_outcome === 'approved' ? (
                                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                                            <Link
                                                                                href={getFallbackMembersShortcut(item)}
                                                                                className="inline-flex items-center rounded-lg border border-[#c5dace] bg-white px-2 py-1 text-[10px] font-semibold text-[#2f6b53] transition hover:bg-[#f3faf7] dark:border-white/20 dark:bg-white/8 dark:text-[#bfe8d6] dark:hover:bg-white/12"
                                                                            >
                                                                                Open prefilled form
                                                                            </Link>
                                                                            {item.email_delivery_status === 'failed' && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        router.post(route('membership-requests.retry-email', item.id), {}, {
                                                                                            preserveScroll: true,
                                                                                        })
                                                                                    }
                                                                                    className="inline-flex items-center rounded-lg border border-[#e2c38f] bg-[#fff8eb] px-2 py-1 text-[10px] font-semibold text-[#8a5a20] transition hover:bg-[#fff2d8] dark:border-[#6a4b22] dark:bg-[#2f2415] dark:text-[#f0c68d] dark:hover:bg-[#3a2d1b]"
                                                                                >
                                                                                    Retry Email
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-[#5e766b] dark:text-[#9cb9ae]">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                ))}
                        </section>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
