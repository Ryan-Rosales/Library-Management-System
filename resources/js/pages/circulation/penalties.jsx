import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Wallet } from 'lucide-react';
import { useState } from 'react';

function statusClass(status) {
    if (status === 'pending') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    if (status === 'cleared') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300';
}

export default function StaffPenalties({ penalties, filters, pendingTotal }) {
    const breadcrumbs = [
        { title: 'Circulation', href: '/penalties/manage' },
        { title: 'Penalties', href: '/penalties/manage' },
    ];

    const [search, setSearch] = useState(filters?.search || '');

    const applySearch = (event) => {
        event.preventDefault();
        router.get(route('staff.penalties.index'), { search: search || undefined }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const markCleared = (id) => {
        router.patch(route('staff.penalties.clear', id), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penalty Management" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(132deg,#fffaf5_0%,#fef4eb_45%,#f5f9ff_100%)] px-4 py-5 dark:bg-[linear-gradient(132deg,#26140f_0%,#221a16_45%,#10182a_100%)] md:px-7 md:py-7">
                <div className="pointer-events-none absolute -left-10 top-0 h-72 w-72 rounded-full bg-[#ffd0b0]/35 blur-3xl dark:bg-[#7b3a2c]/28" />

                <div className="page-enter-item relative z-10 mb-4 flex flex-col gap-2">
                    <p className="text-sm font-semibold tracking-[0.14em] text-[#a65b33] dark:text-[#f0b295]">STAFF PENALTIES</p>
                    <h1 className="text-4xl font-semibold text-[#4c271a] dark:text-[#ffdcca] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                        Penalty Management
                    </h1>
                    <p className="text-sm font-semibold text-[#b35d32] dark:text-[#f4b492]">Pending total: P {Number(pendingTotal || 0).toFixed(2)}</p>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/88 p-4 shadow-[0_20px_45px_rgba(81,43,30,0.15)] backdrop-blur dark:border-white/12 dark:bg-[#2d1b16c9]" style={{ animationDelay: '70ms' }}>
                    <form onSubmit={applySearch} className="flex w-full max-w-lg items-center gap-2">
                        <div className="relative flex-1">
                            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9a6b59]" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search member, title, ISBN"
                                className="w-full rounded-xl border border-[#e4cdc0] bg-white px-9 py-2.5 text-sm text-[#4b332a] dark:border-white/20 dark:bg-[#2a1f1b] dark:text-[#f2d9ce]"
                            />
                        </div>
                        <button className="rounded-xl bg-[#b05b33] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#994d2a]">Apply</button>
                    </form>
                </section>

                <section className="relative z-10 mt-4 overflow-hidden rounded-3xl border border-white/70 bg-white/88 shadow-[0_24px_52px_rgba(81,43,30,0.15)] backdrop-blur dark:border-white/12 dark:bg-[#2d1b16c9]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#fff3eb] text-xs font-semibold uppercase tracking-[0.08em] text-[#8f5a45] dark:bg-white/6 dark:text-[#d3ab97]">
                                <tr>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Member</th>
                                    <th className="px-4 py-3">Returned</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {penalties.data.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#8d6657] dark:text-[#c3a497]">
                                            No penalty records found.
                                        </td>
                                    </tr>
                                )}
                                {penalties.data.map((item) => (
                                    <tr key={item.id} className="border-t border-[#eeded5] dark:border-white/10">
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-[#5b2f21] dark:text-[#ffd7c7]">{item.title}</p>
                                            <p className="text-xs text-[#9a6f60] dark:text-[#d3ad9d]">{item.author} | ISBN: {item.isbn || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#805746] dark:text-[#c9a593]">
                                            <p>{item.member_name || 'Unknown'}</p>
                                            <p>{item.member_email || ''}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#805746] dark:text-[#c9a593]">{item.returned_at || 'N/A'}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(item.fine_status)}`}>{item.fine_status}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs font-semibold text-[#b0492f]">P {Number(item.fine_amount || 0).toFixed(2)}</td>
                                        <td className="px-4 py-3.5 text-right">
                                            {item.fine_status === 'pending' ? (
                                                <button onClick={() => markCleared(item.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f8b62] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[#197451]">
                                                    <Wallet size={12} />
                                                    Mark Cleared
                                                </button>
                                            ) : (
                                                <span className="text-xs text-[#8d6657] dark:text-[#c3a497]">No action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {penalties.links?.length > 3 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#eeded5] px-4 py-3 dark:border-white/10">
                            {penalties.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${link.active ? 'bg-[#b05b33] text-white' : 'bg-[#fff3eb] text-[#8f5a45] dark:bg-white/8 dark:text-[#d9b7a8]'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
