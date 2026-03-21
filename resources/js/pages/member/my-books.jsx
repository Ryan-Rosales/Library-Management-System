import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';

export default function MemberMyBooks({ loans }) {
    const breadcrumbs = [
        { title: 'Member', href: '/member/dashboard' },
        { title: 'My Books', href: '/member/my-books' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Books" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f7fbff_0%,#eef8f3_48%,#edf4ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#081723_0%,#0a1f1a_48%,#0a1726_100%)] md:px-7 md:py-7">
                <div className="pointer-events-none absolute left-10 top-0 h-72 w-72 rounded-full bg-[#90d8be]/30 blur-3xl dark:bg-[#2d8a6f]/20" />
                <h1 className="relative z-10 text-4xl font-semibold text-[#1a3348] dark:text-[#dbeefe]" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                    My Current Books
                </h1>

                <section className="relative z-10 mt-4 overflow-hidden rounded-3xl border border-white/70 bg-white/88 shadow-[0_24px_52px_rgba(29,62,92,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#111d2ac9]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#f2f8fd] text-xs font-semibold uppercase tracking-[0.08em] text-[#4f6881] dark:bg-white/6 dark:text-[#93abc0]">
                                <tr>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Copy</th>
                                    <th className="px-4 py-3">Borrowed At</th>
                                    <th className="px-4 py-3">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loans.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#6a8094] dark:text-[#9eb4c8]">
                                            You currently have no borrowed books.
                                        </td>
                                    </tr>
                                )}
                                {loans.data.map((item) => (
                                    <tr key={item.id} className="border-t border-[#e4edf4] dark:border-white/10">
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-[#1d3f5a] dark:text-[#d7e9fb]">{item.title}</p>
                                            <p className="text-xs text-[#6a8399] dark:text-[#9eb5c9]">{item.author} | ISBN: {item.isbn || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#45637a] dark:text-[#b7cfe3]">
                                            <p>Accession: {item.accession_number}</p>
                                            <p>Shelf: {item.shelf || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#45637a] dark:text-[#b7cfe3]">{item.borrowed_at || 'N/A'}</td>
                                        <td className="px-4 py-3.5 text-xs font-semibold">
                                            <span className={item.is_overdue ? 'text-[#c43a2f]' : 'text-[#2a6ea1] dark:text-[#93d1f8]'}>{item.due_at || 'No due date'}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {loans.links?.length > 3 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e4edf4] px-4 py-3 dark:border-white/10">
                            {loans.links.map((link, index) => (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url || '#'}
                                    preserveScroll
                                    preserveState
                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold ${link.active ? 'bg-[#226ea8] text-white' : 'bg-[#f3f8fd] text-[#486a86] dark:bg-white/8 dark:text-[#aac9df]'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
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
