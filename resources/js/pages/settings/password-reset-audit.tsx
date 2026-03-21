import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface AuditRecord {
    id: number;
    requester_name: string | null;
    requester_email: string;
    requester_role: 'staff' | 'member';
    target_role: 'admin' | 'staff';
    review_action: 'approved' | 'rejected' | null;
    verified_at: string | null;
    resolved_at: string | null;
    processed_by: {
        id: number;
        name: string;
        role: 'admin' | 'staff' | 'member';
    } | null;
}

interface AuditPageProps {
    records: {
        data: AuditRecord[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password reset audit',
        href: '/settings/password-reset-audit',
    },
];

export default function PasswordResetAudit({ records, filters }: AuditPageProps) {
    const [search, setSearch] = useState(filters.search || '');

    const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            route('settings.password-reset-audit'),
            {
                search,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password reset audit" />

            <SettingsLayout>
                <div className="space-y-6 rounded-2xl border border-[#d5e7df] bg-white/75 p-6 shadow-sm dark:border-white/12 dark:bg-white/6 md:p-7">
                    <HeadingSmall
                        title="Password reset audit"
                        description="Admin visibility for processed forgot-password requests: approved/rejected outcomes, processor, and timestamps."
                    />

                    <form onSubmit={submitSearch} className="flex w-full max-w-md items-center gap-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="h-10 w-full rounded-xl border border-[#d0dfd8] bg-white px-3 text-sm dark:border-white/18 dark:bg-white/8"
                            placeholder="Search requester name, email, role"
                        />
                        <button
                            type="submit"
                            className="inline-flex h-10 items-center rounded-xl bg-[#2f8e63] px-3 text-sm font-semibold text-white transition hover:opacity-95"
                        >
                            Search
                        </button>
                    </form>

                    <div className="overflow-x-auto rounded-xl border border-[#d4e5dc] dark:border-white/15">
                        <table className="min-w-full divide-y divide-[#d4e5dc] text-xs dark:divide-white/15">
                            <thead className="bg-[#f1faf5] dark:bg-white/8">
                                <tr>
                                    <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Requester</th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Role/Target</th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Action</th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Processed By</th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Verified At</th>
                                    <th className="px-3 py-2 text-left font-semibold text-[#365e50] dark:text-[#bfe7d7]">Resolved At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#d4e5dc] bg-white/70 dark:divide-white/10 dark:bg-white/6">
                                {records.data.length === 0 && (
                                    <tr>
                                        <td className="px-3 py-4 text-[#5e766b] dark:text-[#9cb9ae]" colSpan={6}>
                                            No processed records found.
                                        </td>
                                    </tr>
                                )}
                                {records.data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-[#2f5d4d] dark:text-[#bfe7d7]">
                                            <p>{item.requester_name || '-'}</p>
                                            <p className="text-[#5e766b] dark:text-[#9cb9ae]">{item.requester_email}</p>
                                        </td>
                                        <td className="px-3 py-2 text-[#5e766b] dark:text-[#9cb9ae]">
                                            {item.requester_role}{' -> '}{item.target_role}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                                    item.review_action === 'approved'
                                                        ? 'bg-[#e6f7ef] text-[#226a4a] dark:bg-[#1a3c2f] dark:text-[#b2ead1]'
                                                        : item.review_action === 'rejected'
                                                          ? 'bg-[#fdeaea] text-[#8a3030] dark:bg-[#442020] dark:text-[#ffb4b4]'
                                                          : 'bg-[#eef3f1] text-[#48675b] dark:bg-[#243a33] dark:text-[#b6d9cb]'
                                                }`}
                                            >
                                                {item.review_action || 'unknown'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-[#5e766b] dark:text-[#9cb9ae]">
                                            {item.processed_by ? `${item.processed_by.name} (${item.processed_by.role})` : '-'}
                                        </td>
                                        <td className="px-3 py-2 text-[#5e766b] dark:text-[#9cb9ae]">{item.verified_at || '-'}</td>
                                        <td className="px-3 py-2 text-[#5e766b] dark:text-[#9cb9ae]">{item.resolved_at || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {records.links.map((link, index) => (
                            <Link
                                key={`${link.url}-${index}`}
                                href={link.url || '#'}
                                preserveState
                                preserveScroll
                                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                    link.active
                                        ? 'border-[#70c7a1] bg-[#e9f8f1] text-[#245e48] dark:border-[#4f9f85] dark:bg-[#16372f] dark:text-[#b4ebd4]'
                                        : 'border-[#d8e5de] bg-white text-[#44695b] hover:bg-[#f4fbf7] dark:border-white/20 dark:bg-white/8 dark:text-[#9fc2b4] dark:hover:bg-white/12'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
