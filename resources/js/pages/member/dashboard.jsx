import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { BookCopy, Clock3, History, TriangleAlert, Users } from 'lucide-react';

export default function MemberDashboard({ cards = [], dueSoon = [], recentHistory = [] }) {
    const breadcrumbs = [{ title: 'Member Dashboard', href: '/member/dashboard' }];

    const quickLinks = [
        { label: 'Search Catalog', href: '/member/catalog', icon: BookCopy },
        { label: 'My Books', href: '/member/my-books', icon: Clock3 },
        { label: 'Reservations', href: '/member/reservations', icon: Users },
        { label: 'Late Fees', href: '/member/penalties', icon: TriangleAlert },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Member Dashboard" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(145deg,#f6fbff_0%,#eef8f5_48%,#edf4ff_100%)] px-4 py-5 dark:bg-[linear-gradient(145deg,#081824_0%,#0b1f1b_48%,#0a1727_100%)] md:px-7 md:py-7">
                <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-[#8ecbff]/30 blur-3xl dark:bg-[#206b94]/20" />
                <div className="pointer-events-none absolute -right-24 top-14 h-80 w-80 rounded-full bg-[#8ee9c8]/30 blur-3xl dark:bg-[#1f7f62]/20" />

                <div className="page-enter-item relative z-10 rounded-3xl border border-white/80 bg-white/88 p-6 shadow-[0_24px_50px_rgba(25,61,93,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#111d2ac9] dark:shadow-[0_24px_56px_rgba(4,10,20,0.55)]">
                    <p className="text-sm font-semibold tracking-[0.15em] text-[#2f6ea0] dark:text-[#8ecdf5]">ONLINE PUBLIC ACCESS CATALOG</p>
                    <h1 className="mt-1 text-4xl font-semibold text-[#183047] dark:text-[#ddeefd] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                        Member Dashboard
                    </h1>
                    <p className="mt-2 text-sm text-[#5a7085] dark:text-[#9db2c5]">Track your borrowed books, returns, reservations, and penalties in one place.</p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card) => (
                            <article key={card.label} className="rounded-2xl border border-[#d6e4ef] bg-[#f8fbff] p-4 dark:border-white/12 dark:bg-white/6">
                                <p className="text-xs font-semibold tracking-wide text-[#3e6d95] dark:text-[#9eccef]">{card.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-[#19344f] dark:text-[#e1efff]">{card.value}</p>
                            </article>
                        ))}
                    </div>
                </div>

                <section className="relative z-10 mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_0.9fr]">
                    <div className="page-enter-item rounded-3xl border border-white/80 bg-white/88 p-5 shadow-[0_20px_44px_rgba(26,58,88,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#111d2ac9] dark:shadow-[0_20px_46px_rgba(4,11,20,0.5)]" style={{ animationDelay: '80ms' }}>
                        <div className="mb-4 flex items-center gap-2 text-[#2d6b9f] dark:text-[#8ecdf5]">
                            <Clock3 size={16} />
                            <h2 className="text-lg font-semibold">Due Soon</h2>
                        </div>
                        <div className="space-y-2.5">
                            {dueSoon.length === 0 && <p className="rounded-xl border border-dashed border-[#c8dcea] px-3 py-2 text-sm text-[#647e95] dark:border-white/18 dark:text-[#9eb4c8]">No active loans with due dates.</p>}
                            {dueSoon.map((loan) => (
                                <div key={loan.id} className="rounded-xl border border-[#d9e7f2] bg-[#f8fbff] px-3 py-2.5 dark:border-white/12 dark:bg-white/6">
                                    <p className="text-sm font-semibold text-[#1f425e] dark:text-[#d5e8fb]">{loan.title}</p>
                                    <p className="text-xs text-[#69839a] dark:text-[#a7bdd1]">{loan.author} | ISBN: {loan.isbn || 'N/A'}</p>
                                    <p className={`mt-1 text-[11px] font-semibold ${loan.is_overdue ? 'text-[#c43a2f]' : 'text-[#2d6b9f] dark:text-[#8fcff7]'}`}>
                                        Due: {loan.due_date || 'No due date'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="page-enter-item rounded-3xl border border-white/80 bg-white/88 p-5 shadow-[0_20px_44px_rgba(26,58,88,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#111d2ac9] dark:shadow-[0_20px_46px_rgba(4,11,20,0.5)]" style={{ animationDelay: '120ms' }}>
                        <div className="mb-4 flex items-center gap-2 text-[#2f875f] dark:text-[#9ce5c8]">
                            <History size={16} />
                            <h2 className="text-lg font-semibold">Recent Returns</h2>
                        </div>
                        <div className="space-y-2.5">
                            {recentHistory.length === 0 && <p className="rounded-xl border border-dashed border-[#d0e5dc] px-3 py-2 text-sm text-[#637f73] dark:border-white/18 dark:text-[#a2b9ae]">No returned books in your history yet.</p>}
                            {recentHistory.map((log) => (
                                <div key={log.id} className="rounded-xl border border-[#d8e9e2] bg-[#f8fcfa] px-3 py-2.5 dark:border-white/12 dark:bg-white/6">
                                    <p className="text-sm font-semibold text-[#244d3e] dark:text-[#d4f0e3]">{log.title}</p>
                                    <p className="text-xs text-[#688275] dark:text-[#a2b9ae]">Returned: {log.returned_at || 'N/A'}</p>
                                    {Number(log.fine_amount) > 0 && <p className="mt-1 text-[11px] font-semibold text-[#c14935]">Penalty: P {Number(log.fine_amount).toFixed(2)}</p>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="page-enter-item rounded-3xl border border-white/80 bg-white/88 p-5 shadow-[0_20px_44px_rgba(26,58,88,0.12)] backdrop-blur dark:border-white/10 dark:bg-[#111d2ac9] dark:shadow-[0_20px_46px_rgba(4,11,20,0.5)]" style={{ animationDelay: '160ms' }}>
                        <div className="mb-4 flex items-center gap-2 text-[#6e59b3] dark:text-[#c2b5ff]">
                            <Users size={16} />
                            <h2 className="text-lg font-semibold">Quick Access</h2>
                        </div>
                        <div className="space-y-2">
                            {quickLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-xl border border-[#d8e2ef] bg-[#f8fbff] px-3 py-2.5 text-sm font-semibold text-[#274763] transition hover:bg-[#edf5ff] dark:border-white/12 dark:bg-white/6 dark:text-[#cfe6ff] dark:hover:bg-white/10">
                                        <span>{item.label}</span>
                                        <Icon size={14} />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
