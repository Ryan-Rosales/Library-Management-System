import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, BookCopy, BookOpenCheck, CalendarClock, Clock3, UserRoundPlus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

type DashboardCard = {
    label: string;
    value: string;
    trend: string;
    icon: 'BookCopy' | 'UserRoundPlus' | 'BookOpenCheck' | 'CalendarClock';
};

type DashboardActivity = {
    title: string;
    meta: string;
};

type DashboardAction = {
    label: string;
    url: string;
};

const iconMap = {
    BookCopy,
    UserRoundPlus,
    BookOpenCheck,
    CalendarClock,
};

export default function Dashboard({ cards = [], activities = [], quickActions = [] }: { cards: DashboardCard[]; activities: DashboardActivity[]; quickActions: DashboardAction[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-4 dark:bg-[linear-gradient(130deg,#07222c_0%,#061b26_46%,#051722_100%)] md:px-5 md:py-5">
                <div className="pointer-events-none absolute left-6 top-0 h-80 w-80 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#00d99a]/18" />
                <div className="pointer-events-none absolute -right-20 top-20 h-96 w-96 rounded-full bg-[#b7d8ff]/45 blur-3xl dark:bg-[#148bcc]/18" />

                <div className="page-enter-item relative z-10 mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1
                            className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#d5ebe4] md:text-[3.25rem]"
                            style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                        >
                            Dashboard
                        </h1>
                    </div>
                    <Link href="/books" className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(90deg,#2abf93_0%,#23a0dc_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(34,126,92,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(34,126,92,0.45)]">
                        <BookCopy size={16} />
                        Add Book
                    </Link>
                </div>

                <div className="page-enter-item relative z-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" style={{ animationDelay: '90ms' }}>
                    {cards.map((card) => {
                        const Icon = iconMap[card.icon] ?? BookCopy;

                        return (
                            <article
                                key={card.label}
                                className="rounded-3xl border border-white/70 bg-white/82 p-4 shadow-[0_20px_45px_rgba(37,74,64,0.12)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(37,74,64,0.18)] dark:border-white/12 dark:bg-[linear-gradient(140deg,#0b2b36c9_0%,#0a2430c9_100%)] dark:shadow-[0_20px_45px_rgba(2,18,26,0.35)] dark:hover:shadow-[0_28px_60px_rgba(2,18,26,0.46)]"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e6f8ef] text-[#257653] dark:bg-[#124039] dark:text-[#8ce8c1]">
                                        <Icon size={18} />
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-[#edf8f2] px-2.5 py-1 text-xs font-semibold text-[#2f7c59] dark:bg-[#124139] dark:text-[#8ce8c1]">
                                        <ArrowUpRight size={12} />
                                        {card.trend}
                                    </span>
                                </div>
                                <p className="text-3xl font-semibold text-[#1f322b] dark:text-[#def5ec]">{card.value}</p>
                                <p className="mt-1 text-sm font-medium text-[#617770] dark:text-[#8ea8a0]">{card.label}</p>
                            </article>
                        );
                    })}
                </div>

                <div className="relative z-10 mt-4 grid flex-1 gap-3 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="page-enter-item rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/12 dark:bg-[linear-gradient(145deg,#082432c9_0%,#071f2bc9_100%)] dark:shadow-[0_24px_50px_rgba(3,18,30,0.45)]" style={{ animationDelay: '130ms' }}>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-[#1d3029] dark:text-[#d9f2e8]">Recent Activity</h2>
                                <p className="text-sm text-[#718781] dark:text-[#88a59c]">Live updates across circulation and members.</p>
                            </div>
                            <Link href="/reports" className="rounded-full border border-[#d3e6dd] bg-white px-3 py-1.5 text-xs font-semibold text-[#356d58] transition hover:bg-[#eef8f3] dark:border-white/20 dark:bg-white/6 dark:text-[#9ce2c6] dark:hover:bg-white/12">
                                View Logs
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {activities.length === 0 && (
                                <div className="rounded-2xl border border-dashed border-[#d5e4de] bg-white/70 p-3 text-sm text-[#627a72] dark:border-white/14 dark:bg-white/6 dark:text-[#93a7a1]">
                                    No activity yet. Create members, books, or transactions to populate this widget.
                                </div>
                            )}
                            {activities.map((item, index) => (
                                <div
                                    key={`${item.title}-${index}`}
                                    className="flex items-start gap-3 rounded-2xl border border-[#e3ece7] bg-white/80 p-3 transition hover:border-[#c7ddd2] hover:bg-[#f8fffb] dark:border-white/12 dark:bg-white/6 dark:hover:border-white/20 dark:hover:bg-white/10"
                                >
                                    <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#e7f6ef] text-[#2a7f59] dark:bg-[#123f37] dark:text-[#8de7c1]">
                                        <Clock3 size={14} />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-[#2b3b35] dark:text-[#d8eee5]">{item.title}</p>
                                        <p className="text-xs text-[#6e837d] dark:text-[#93a7a1]">{item.meta}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="page-enter-item rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/12 dark:bg-[linear-gradient(145deg,#082432c9_0%,#071f2bc9_100%)] dark:shadow-[0_24px_50px_rgba(3,18,30,0.45)]" style={{ animationDelay: '170ms' }}>
                        <h2 className="text-xl font-semibold text-[#1d3029] dark:text-[#d9f3e8]">Quick Actions</h2>
                        <p className="mt-1 text-sm text-[#718781] dark:text-[#95aaa3]">Fast links for daily staff workflows.</p>

                        <div className="mt-6 grid gap-3">
                            {quickActions.map((action) => (
                                <Link
                                    key={action.label}
                                    href={action.url}
                                    className="flex items-center justify-between rounded-2xl border border-[#dce8e2] bg-white/85 px-4 py-3 text-sm font-semibold text-[#2c3f37] shadow-[0_10px_24px_rgba(48,87,74,0.08)] transition hover:-translate-y-0.5 hover:border-[#bdd8cb] hover:shadow-[0_16px_30px_rgba(48,87,74,0.16)] dark:border-white/14 dark:bg-white/6 dark:text-[#d3ebe1] dark:shadow-[0_10px_24px_rgba(6,17,28,0.35)] dark:hover:border-white/25 dark:hover:bg-white/11"
                                >
                                    {action.label}
                                    <ArrowUpRight size={15} className="text-[#2f8d65] dark:text-[#8ee6c2]" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </AppLayout>
    );
}
