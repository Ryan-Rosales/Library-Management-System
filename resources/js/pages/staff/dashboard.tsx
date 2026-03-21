import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BellRing, BookUser, CalendarClock, ClipboardCheck, Users } from 'lucide-react';

type StaffCard = {
    label: string;
    value: string;
    hint: string;
    tone: 'amber' | 'blue' | 'violet' | 'rose' | 'emerald' | 'teal';
};

type StaffWidgetItem = {
    title: string;
    meta: string;
    timestamp: string;
};

type StaffAction = {
    label: string;
    url: string;
};

const toneClasses: Record<StaffCard['tone'], string> = {
    amber: 'border-amber-200/80 bg-amber-50/80 text-amber-800',
    blue: 'border-sky-200/80 bg-sky-50/80 text-sky-800',
    violet: 'border-violet-200/80 bg-violet-50/80 text-violet-800',
    rose: 'border-rose-200/80 bg-rose-50/80 text-rose-800',
    emerald: 'border-emerald-200/80 bg-emerald-50/80 text-emerald-800',
    teal: 'border-teal-200/80 bg-teal-50/80 text-teal-800',
};

export default function StaffDashboard({
    cards = [],
    recentMembers = [],
    dueSoonLoans = [],
    quickActions = [],
    selectedRange = '7d',
    rangeSummary = 'Last 7 days',
    availableCopiesNow = '0',
}: {
    cards: StaffCard[];
    recentMembers: StaffWidgetItem[];
    dueSoonLoans: StaffWidgetItem[];
    quickActions: StaffAction[];
    selectedRange: 'today' | '7d' | '30d';
    rangeSummary: string;
    availableCopiesNow: string;
}) {
    const breadcrumbs = [{ title: 'Staff', href: '/staff/dashboard' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Staff Dashboard" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(145deg,#f8fbff_0%,#f2f9f6_40%,#ecf5ff_100%)] px-4 py-5 dark:bg-[linear-gradient(145deg,#0b1520_0%,#0d1b18_40%,#0e1826_100%)] md:px-7 md:py-7">
                <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#9ac9ff]/40 blur-3xl dark:bg-[#19638d]/25" />
                <div className="pointer-events-none absolute -right-16 top-10 h-80 w-80 rounded-full bg-[#8ff0c2]/35 blur-3xl dark:bg-[#1f7a5f]/20" />

                <div className="page-enter-item relative z-10 rounded-3xl border border-white/80 bg-white/85 p-5 shadow-[0_22px_50px_rgba(26,66,104,0.14)] backdrop-blur dark:border-white/10 dark:bg-[#121d2acc] dark:shadow-[0_24px_55px_rgba(3,9,18,0.55)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm font-semibold tracking-[0.15em] text-[#2d6ea5] dark:text-[#8ccff8]">STAFF OPERATIONS</p>
                            <h1
                                className="mt-1 text-4xl font-semibold text-[#182a3d] dark:text-[#e2eefb] md:text-[3rem]"
                                style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                            >
                                Staff Dashboard
                            </h1>
                            <p className="mt-2 text-sm text-[#516579] dark:text-[#9fb2c6]">Member operations, circulation pressure, and daily tasks in one view.</p>
                            <p className="mt-1 text-xs font-semibold tracking-wide text-[#2f6fa5] dark:text-[#90cdf4]">Range: {rangeSummary} | Available copies now: {availableCopiesNow}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="mr-2 inline-flex rounded-xl border border-[#c4d7e7] bg-[#f0f7fd] p-1 dark:border-white/15 dark:bg-white/8">
                                <Link
                                    href="/staff/dashboard?range=today"
                                    preserveState
                                    preserveScroll
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${selectedRange === 'today' ? 'bg-[#226ea8] text-white' : 'text-[#2c608a] hover:bg-[#ddeefe] dark:text-[#a9d8fb] dark:hover:bg-white/12'}`}
                                >
                                    Today
                                </Link>
                                <Link
                                    href="/staff/dashboard?range=7d"
                                    preserveState
                                    preserveScroll
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${selectedRange === '7d' ? 'bg-[#226ea8] text-white' : 'text-[#2c608a] hover:bg-[#ddeefe] dark:text-[#a9d8fb] dark:hover:bg-white/12'}`}
                                >
                                    7 days
                                </Link>
                                <Link
                                    href="/staff/dashboard?range=30d"
                                    preserveState
                                    preserveScroll
                                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${selectedRange === '30d' ? 'bg-[#226ea8] text-white' : 'text-[#2c608a] hover:bg-[#ddeefe] dark:text-[#a9d8fb] dark:hover:bg-white/12'}`}
                                >
                                    30 days
                                </Link>
                            </div>
                            <Link href="/membership-requests" className="inline-flex items-center gap-2 rounded-xl bg-[#226ea8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1f5f90]">
                                <ClipboardCheck size={14} />
                                Review Requests
                            </Link>
                            <Link href="/borrow" className="inline-flex items-center gap-2 rounded-xl border border-[#b8d3e8] bg-white px-4 py-2 text-sm font-semibold text-[#1e4d73] transition hover:bg-[#f0f7fd] dark:border-white/20 dark:bg-white/10 dark:text-[#cce8ff]">
                                <BookUser size={14} />
                                Borrow Flow
                            </Link>
                        </div>
                    </div>
                </div>

                <section className="page-enter-item relative z-10 mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3" style={{ animationDelay: '80ms' }}>
                    {cards.map((card) => (
                        <article key={card.label} className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_14px_28px_rgba(24,51,77,0.10)] backdrop-blur dark:border-white/10 dark:bg-[#101c2acc] dark:shadow-[0_15px_32px_rgba(4,10,20,0.4)]">
                            <div className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${toneClasses[card.tone]}`}>
                                {card.hint}
                            </div>
                            <p className="mt-3 text-3xl font-semibold text-[#1b3350] dark:text-[#dcecff]">{card.value}</p>
                            <p className="mt-1 text-sm font-medium text-[#4f657a] dark:text-[#a1b4c8]">{card.label}</p>
                        </article>
                    ))}
                </section>

                <section className="relative z-10 mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
                    <div className="page-enter-item rounded-3xl border border-white/80 bg-white/88 p-5 shadow-[0_20px_45px_rgba(24,52,78,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#121d2acc] dark:shadow-[0_20px_45px_rgba(4,11,20,0.5)]" style={{ animationDelay: '120ms' }}>
                        <div className="mb-4 flex items-center gap-2 text-[#1f5e8f] dark:text-[#8ccff8]">
                            <Users size={16} />
                            <h2 className="text-lg font-semibold">Recent Members ({rangeSummary})</h2>
                        </div>
                        <div className="space-y-2.5">
                            {recentMembers.length === 0 && <p className="rounded-xl border border-dashed border-[#c7d9e8] px-3 py-2 text-sm text-[#627b90] dark:border-white/18 dark:text-[#9fb4c8]">No recent member records yet.</p>}
                            {recentMembers.map((member, index) => (
                                <div key={`${member.title}-${index}`} className="rounded-xl border border-[#d7e4ef] bg-[#f7fbff] px-3 py-2.5 dark:border-white/12 dark:bg-white/6">
                                    <p className="text-sm font-semibold text-[#24435f] dark:text-[#d8ebff]">{member.title}</p>
                                    <p className="text-xs text-[#607a90] dark:text-[#9cb1c5]">{member.meta}</p>
                                    <p className="mt-1 text-[11px] font-medium text-[#2b6ea3] dark:text-[#8acdf5]">{member.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="page-enter-item rounded-3xl border border-white/80 bg-white/88 p-5 shadow-[0_20px_45px_rgba(24,52,78,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#121d2acc] dark:shadow-[0_20px_45px_rgba(4,11,20,0.5)]" style={{ animationDelay: '150ms' }}>
                        <div className="mb-4 flex items-center gap-2 text-[#6b4db9] dark:text-[#c3b5ff]">
                            <CalendarClock size={16} />
                            <h2 className="text-lg font-semibold">Due Soon ({rangeSummary})</h2>
                        </div>
                        <div className="space-y-2.5">
                            {dueSoonLoans.length === 0 && <p className="rounded-xl border border-dashed border-[#d7cdef] px-3 py-2 text-sm text-[#75679b] dark:border-white/18 dark:text-[#b3a7d2]">No upcoming due loans.</p>}
                            {dueSoonLoans.map((loan, index) => (
                                <div key={`${loan.title}-${index}`} className="rounded-xl border border-[#e3daf7] bg-[#faf7ff] px-3 py-2.5 dark:border-white/12 dark:bg-white/6">
                                    <p className="text-sm font-semibold text-[#3e3271] dark:text-[#e5dcff]">{loan.title}</p>
                                    <p className="text-xs text-[#7669a1] dark:text-[#b7add6]">{loan.meta}</p>
                                    <p className="mt-1 text-[11px] font-medium text-[#7a5dc8] dark:text-[#c4b6ff]">Due: {loan.timestamp}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="page-enter-item rounded-3xl border border-white/80 bg-white/88 p-5 shadow-[0_20px_45px_rgba(24,52,78,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#121d2acc] dark:shadow-[0_20px_45px_rgba(4,11,20,0.5)]" style={{ animationDelay: '180ms' }}>
                        <div className="mb-4 flex items-center gap-2 text-[#2f8a6b] dark:text-[#95e4c7]">
                            <BellRing size={16} />
                            <h2 className="text-lg font-semibold">Quick Actions</h2>
                        </div>
                        <div className="space-y-2">
                            {quickActions.map((action) => (
                                <Link key={action.label} href={action.url} className="flex items-center justify-between rounded-xl border border-[#d5e6dd] bg-[#f6fcf9] px-3 py-2.5 text-sm font-semibold text-[#245844] transition hover:bg-[#eaf8f1] dark:border-white/12 dark:bg-white/6 dark:text-[#d7f3e7] dark:hover:bg-white/10">
                                    {action.label}
                                    <ArrowRight size={14} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
