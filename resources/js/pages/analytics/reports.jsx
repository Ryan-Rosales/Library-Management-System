import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BarChart3, BookOpen, Boxes, CheckCircle2, Clock3, FolderKanban, UsersRound, UserCog } from 'lucide-react';

function StatCard({ title, value, subtitle, icon: Icon, tone = 'mint' }) {
    const toneStyles = {
        mint: 'from-[#e8f9ef] to-[#e6f6ff] text-[#1f4f3d] dark:from-[#18342b] dark:to-[#132b3a] dark:text-[#b6e9d2]',
        sky: 'from-[#e8f3ff] to-[#edf4ff] text-[#244a71] dark:from-[#152e45] dark:to-[#17253d] dark:text-[#b8d5f2]',
        gold: 'from-[#fff7e6] to-[#fff0dc] text-[#6c4a1f] dark:from-[#3d2e18] dark:to-[#3c2618] dark:text-[#f0d1a2]',
    };

    return (
        <div className={`rounded-2xl border border-white/70 bg-gradient-to-br p-4 shadow-[0_18px_40px_rgba(40,78,66,0.12)] ${toneStyles[tone]} dark:border-white/10`}>
            <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.12em] opacity-80">{title}</p>
                <Icon size={16} />
            </div>
            <p className="text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs opacity-80">{subtitle}</p>
        </div>
    );
}

export default function ReportsAnalyticsPage({ summary, topCategories, recentBooks }) {
    const breadcrumbs = [
        { title: 'Analytics', href: '/reports' },
        { title: 'Reports', href: '/reports' },
    ];

    const checkedOut = Math.max((summary.copies_total || 0) - (summary.copies_available || 0), 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics Reports" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-6 md:py-6">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-6">
                    <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">ANALYTICS</p>
                    <h1 className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#def5ec] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                        Library Insights Dashboard
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm text-[#5b746b] dark:text-[#9ab4aa]">
                        Snapshot of category performance, circulation pressure, and current people footprint to support daily operational decisions.
                    </p>
                </div>

                <section className="page-enter-item relative z-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" style={{ animationDelay: '60ms' }}>
                    <StatCard title="Total Books" value={summary.books_total} subtitle="Records in active catalog" icon={BookOpen} tone="mint" />
                    <StatCard title="Categories" value={summary.categories_total} subtitle="Distinct content groups" icon={FolderKanban} tone="sky" />
                    <StatCard title="Members" value={summary.members_total} subtitle="Registered borrowers" icon={UsersRound} tone="mint" />
                    <StatCard title="Staff" value={summary.staff_total} subtitle="Library team accounts" icon={UserCog} tone="gold" />
                </section>

                <section className="page-enter-item relative z-10 mt-5 grid gap-4 xl:grid-cols-[1.45fr,1fr]" style={{ animationDelay: '110ms' }}>
                    <div className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#ecf9f2] px-3 py-2 text-[#2d7757] dark:bg-[#173630] dark:text-[#98e5c4]">
                                <BarChart3 size={15} />
                                <span className="text-sm font-semibold">Top Categories</span>
                            </div>
                            <p className="text-xs text-[#647a72] dark:text-[#97aba4]">By number of books</p>
                        </div>

                        <div className="space-y-3">
                            {topCategories.length === 0 && (
                                <p className="rounded-xl border border-dashed border-[#d4e6dd] bg-[#f7fcf9] px-3 py-4 text-sm text-[#607970] dark:border-white/15 dark:bg-white/5 dark:text-[#9cb3aa]">
                                    No category data yet. Add books with category values to unlock these analytics widgets.
                                </p>
                            )}

                            {topCategories.map((item, index) => {
                                const utilization = item.copies_total > 0 ? Math.round((item.checked_out / item.copies_total) * 100) : 0;
                                return (
                                    <div key={`${item.name}-${index}`} className="rounded-2xl border border-[#d9e8e1] bg-white/90 p-3 dark:border-white/10 dark:bg-white/5">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <p className="font-semibold text-[#274238] dark:text-[#c8eadc]">{item.name}</p>
                                            <span className="rounded-full bg-[#eaf8f1] px-2 py-1 text-xs font-semibold text-[#2b6e51] dark:bg-[#18372d] dark:text-[#9fd6bf]">
                                                {item.books_count} books
                                            </span>
                                        </div>
                                        <div className="mb-2 h-2 rounded-full bg-[#e7f2ec] dark:bg-[#1a3132]">
                                            <div className="h-2 rounded-full bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)]" style={{ width: `${Math.min(utilization, 100)}%` }} />
                                        </div>
                                        <p className="text-xs text-[#637971] dark:text-[#9ab0a8]">
                                            {item.checked_out} checked out of {item.copies_total} total copies ({utilization}% utilization)
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]">
                            <h3 className="mb-3 text-sm font-semibold tracking-[0.12em] text-[#2f7c59] dark:text-[#8edaba]">CIRCULATION SNAPSHOT</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between rounded-xl bg-[#eef8f3] px-3 py-2 text-[#285d47] dark:bg-[#17312c] dark:text-[#a6d8c3]">
                                    <span className="inline-flex items-center gap-2"><Boxes size={14} /> Total Copies</span>
                                    <strong>{summary.copies_total}</strong>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-[#ecf3ff] px-3 py-2 text-[#2b5071] dark:bg-[#182b41] dark:text-[#b9d2ea]">
                                    <span className="inline-flex items-center gap-2"><CheckCircle2 size={14} /> Available</span>
                                    <strong>{summary.copies_available}</strong>
                                </div>
                                <div className="flex items-center justify-between rounded-xl bg-[#fff4e8] px-3 py-2 text-[#7b531e] dark:bg-[#3b2918] dark:text-[#eccb9e]">
                                    <span className="inline-flex items-center gap-2"><Clock3 size={14} /> Checked Out</span>
                                    <strong>{checkedOut}</strong>
                                </div>
                            </div>
                            <p className="mt-3 text-xs text-[#61786f] dark:text-[#9ab0a8]">Overall utilization: {summary.utilization_rate}% of copies currently in use.</p>
                        </div>

                        <div className="rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]">
                            <h3 className="mb-3 text-sm font-semibold tracking-[0.12em] text-[#2f7c59] dark:text-[#8edaba]">RECENT BOOKS</h3>
                            <div className="space-y-2">
                                {recentBooks.length === 0 && (
                                    <p className="text-sm text-[#61786f] dark:text-[#9ab0a8]">No recently added books yet.</p>
                                )}
                                {recentBooks.map((book) => (
                                    <div key={book.id} className="rounded-xl border border-[#d9e8e1] bg-white/90 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                                        <p className="text-sm font-semibold text-[#284237] dark:text-[#c8eadc]">{book.title}</p>
                                        <p className="text-xs text-[#667d74] dark:text-[#9eb6ad]">
                                            {book.category || 'Uncategorized'} | {book.copies_available}/{book.copies_total} available | Added {book.created_at}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </AppLayout>
    );
}
