import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function MemberPenalties({ penalties, pendingTotal }) {
    const breadcrumbs = [
        { title: 'Member', href: '/member/dashboard' },
        { title: 'Penalties', href: '/member/penalties' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Penalties" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#fffaf6_0%,#fff3ef_40%,#f5f7ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#24110f_0%,#1f1418_40%,#12182a_100%)] md:px-7 md:py-7">
                <h1 className="relative z-10 text-4xl font-semibold text-[#4a221d] dark:text-[#ffe0dc]" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                    Pending Penalties
                </h1>
                <p className="relative z-10 mt-2 text-sm font-semibold text-[#9b4134] dark:text-[#f2a9a0]">Current total due: P {Number(pendingTotal || 0).toFixed(2)}</p>

                <section className="relative z-10 mt-4 overflow-hidden rounded-3xl border border-white/70 bg-white/88 shadow-[0_24px_52px_rgba(86,45,38,0.15)] backdrop-blur dark:border-white/12 dark:bg-[#2a1614c9]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#fff2f0] text-xs font-semibold uppercase tracking-[0.08em] text-[#8e4d44] dark:bg-white/6 dark:text-[#d4a8a2]">
                                <tr>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Returned At</th>
                                    <th className="px-4 py-3">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {penalties.data.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#90655f] dark:text-[#c7a8a3]">
                                            No pending penalties.
                                        </td>
                                    </tr>
                                )}
                                {penalties.data.map((item) => (
                                    <tr key={item.id} className="border-t border-[#f0ddda] dark:border-white/10">
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-[#5d2e28] dark:text-[#ffd7d1]">{item.title}</p>
                                            <p className="text-xs text-[#9a6d67] dark:text-[#cba7a1]">{item.author} | ISBN: {item.isbn || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#8f645e] dark:text-[#cba7a1]">{item.returned_at || 'N/A'}</td>
                                        <td className="px-4 py-3.5 text-xs font-semibold text-[#be4638]">P {Number(item.fine_amount || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {penalties.links?.length > 3 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#f0ddda] px-4 py-3 dark:border-white/10">
                            {penalties.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${link.active ? 'bg-[#a84236] text-white' : 'bg-[#fff2f0] text-[#8d4f46] dark:bg-white/8 dark:text-[#d9b2ac]'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
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
