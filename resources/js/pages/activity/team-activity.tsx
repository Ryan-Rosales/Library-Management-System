import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Activity, Search, Users } from 'lucide-react';

interface TeamActivityItem {
    id: number;
    title: string;
    message: string;
    url: string | null;
    meta?: {
        actor_name?: string;
        actor_role?: 'admin' | 'staff';
        module?: string;
        action?: string;
        subject?: string;
    } | null;
    created_at: string | null;
    seen_at: string | null;
}

interface TeamActivityPageProps {
    activities: {
        data: TeamActivityItem[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    filters: {
        search: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Activity', href: '/team-activity' },
    { title: 'Team Activity', href: '/team-activity' },
];

export default function TeamActivityPage({ activities, filters }: TeamActivityPageProps) {
    const onSearch = (value: string) => {
        router.get(
            route('team-activity.index'),
            { search: value },
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Team Activity" />

            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-6 md:py-6">
                <div className="pointer-events-none absolute left-14 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/30 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-4 flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">ACTIVITY</p>
                        <h1
                            className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#def5ec] md:text-5xl"
                            style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                        >
                            Team Activity Feed
                        </h1>
                        <p className="mt-2 text-sm text-[#5b746b] dark:text-[#9ab4aa]">Track changes made by admin and staff in catalog, inventory, circulation, and people modules.</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.post(route('team-activity.read-all'))}
                        className="rounded-xl border border-[#cfe2d9] bg-white/85 px-3 py-2 text-xs font-semibold text-[#2f5d4d] transition hover:bg-[#f1faf6] dark:border-white/18 dark:bg-white/8 dark:text-[#c9eadc] dark:hover:bg-white/12"
                    >
                        Mark all read
                    </button>
                </div>

                <div className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-4 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#0d1f28cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)] md:p-5">
                    <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#d9e8e1] bg-white/75 px-3 py-2 dark:border-white/12 dark:bg-white/6">
                        <Search className="h-4 w-4 text-[#5f7a70] dark:text-[#9fb8af]" />
                        <input
                            defaultValue={filters.search}
                            onChange={(event) => onSearch(event.target.value)}
                            placeholder="Search by actor, module, or action"
                            className="w-full bg-transparent text-sm text-[#1f3c31] placeholder:text-[#7a9289] focus:outline-none dark:text-[#cfeee0] dark:placeholder:text-[#8ca79d]"
                        />
                    </div>

                    {activities.data.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-[#c9ddd3] bg-[#f7fcf9] px-4 py-6 text-sm text-[#607970] dark:border-white/18 dark:bg-white/6 dark:text-[#9cb3aa]">
                            No team activity yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activities.data.map((item) => {
                                const actorRole = item.meta?.actor_role;

                                return (
                                    <div
                                        key={item.id}
                                        className="rounded-2xl border border-[#d4e5dc] bg-[#f8fcfa] px-4 py-3 text-sm dark:border-white/15 dark:bg-white/6"
                                    >
                                        <div className="mb-1 flex items-center justify-between gap-2">
                                            <div className="inline-flex items-center gap-2">
                                                <Activity className="h-4 w-4 text-[#2f7c59] dark:text-[#8edaba]" />
                                                <p className="font-semibold text-[#284237] dark:text-[#c8eadc]">{item.title}</p>
                                            </div>
                                            <div className="inline-flex items-center gap-2">
                                                {actorRole && (
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                                            actorRole === 'admin'
                                                                ? 'bg-[#fef2e6] text-[#8a5a20] dark:bg-[#3c2b18] dark:text-[#f0c68d]'
                                                                : 'bg-[#e6f1fb] text-[#256090] dark:bg-[#1a3142] dark:text-[#a6d4fb]'
                                                        }`}
                                                    >
                                                        {actorRole}
                                                    </span>
                                                )}
                                                {item.seen_at === null && <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />}
                                            </div>
                                        </div>

                                        <p className="text-[#526b61] dark:text-[#9ab4aa]">{item.message}</p>

                                        <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[#6f867d] dark:text-[#9eb7ae]">
                                            <span className="inline-flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5" />
                                                By: {item.meta?.actor_name || 'Unknown'}
                                            </span>
                                            <span>{item.created_at || ''}</span>
                                        </div>

                                        {item.url && (
                                            <div className="mt-2">
                                                <Link
                                                    href={item.url}
                                                    className="inline-flex items-center rounded-lg border border-[#c5dace] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2f6b53] transition hover:bg-[#f3faf7] dark:border-white/20 dark:bg-white/8 dark:text-[#bfe8d6] dark:hover:bg-white/12"
                                                >
                                                    Open related module
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activities.links.length > 3 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {activities.links.map((link, index) => (
                                <button
                                    key={`link-${index}`}
                                    type="button"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                        link.active
                                            ? 'bg-[#2f7c59] text-white'
                                            : 'border border-[#c5dace] bg-white text-[#2f6b53] hover:bg-[#f3faf7] dark:border-white/20 dark:bg-white/8 dark:text-[#bfe8d6]'
                                    } disabled:cursor-not-allowed disabled:opacity-50`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
