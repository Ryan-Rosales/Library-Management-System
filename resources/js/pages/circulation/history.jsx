import AppLayout from '@/layouts/app-layout';
import GlassSelect from '@/components/ui/glass-select';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, History, X } from 'lucide-react';
import { useState } from 'react';

export default function HistoryPage({ returns, filters, schemaReady = true }) {
    const breadcrumbs = [
        { title: 'Circulation', href: '/history' },
        { title: 'History', href: '/history' },
    ];

    const [search, setSearch] = useState(filters?.search || '');
    const [returnedDateFilter, setReturnedDateFilter] = useState(filters?.returned_date || '');
    const [returnStatusFilter, setReturnStatusFilter] = useState(filters?.return_status || '');

    const applySearch = (event) => {
        event.preventDefault();

        router.get(
            route('circulation.history.page'),
            {
                search: search || undefined,
                returned_date: returnedDateFilter || undefined,
                return_status: returnStatusFilter || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetSearchFilters = () => {
        setSearch('');
        setReturnedDateFilter('');
        setReturnStatusFilter('');

        router.get(
            route('circulation.history.page'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-6 md:py-6">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">CIRCULATION</p>
                        <h1 className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#def5ec] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                            History
                        </h1>
                    </div>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '70ms' }}>
                    {!schemaReady && (
                        <div className="mb-4 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/50 dark:bg-amber-900/25 dark:text-amber-200">
                            If history stays empty after returns, run <span className="font-semibold">php artisan migrate</span> to ensure circulation columns exist.
                        </div>
                    )}

                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-[#2c6d52] dark:text-[#96e2c2]">
                            <History size={18} />
                            <h2 className="text-lg font-semibold">Completed Returns</h2>
                        </div>
                        <form onSubmit={applySearch} className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-[1.25fr_0.8fr_0.9fr_auto_auto]">
                            <div className="relative sm:col-span-2 xl:col-span-1">
                                <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#688177]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white py-2 pl-9 pr-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    placeholder="Search return history..."
                                />
                            </div>
                            <input
                                type="date"
                                value={returnedDateFilter}
                                onChange={(event) => setReturnedDateFilter(event.target.value)}
                                className="rounded-xl border border-[#d4ddd8] bg-white px-3 py-2 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                aria-label="Filter by returned date"
                            />
                            <GlassSelect
                                value={returnStatusFilter}
                                onValueChange={setReturnStatusFilter}
                                className="min-w-0"
                                placeholder="All return status"
                                options={[
                                    { value: '', label: 'All return status' },
                                    { value: 'on_time', label: 'On time' },
                                    { value: 'overdue', label: 'Overdue return' },
                                ]}
                            />

                            <button className="rounded-xl bg-[#2f8e63] px-3 py-2 text-sm font-semibold text-white">Apply</button>
                            <button
                                type="button"
                                onClick={resetSearchFilters}
                                className="rounded-xl border border-[#efc7c7] bg-white px-3 py-2 text-sm font-semibold text-[#b04848] hover:bg-[#fff2f2] dark:border-[#703535] dark:bg-white/10 dark:text-[#efb0b0]"
                            >
                                Reset
                            </button>
                        </form>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#dce8e2] dark:border-white/10">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#edf8f2] text-left text-[#2b5444] dark:bg-[#14332d] dark:text-[#a9dfc7]">
                                <tr>
                                    <th className="px-4 py-3">Accession #</th>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Condition</th>
                                    <th className="px-4 py-3">Returned Date</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {returns.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-[#627a72] dark:text-[#9ab1a8]" colSpan={5}>
                                            No completed returns found.
                                        </td>
                                    </tr>
                                )}

                                {returns.data.map((record) => {
                                    const overdue = !!record.due_at && !!record.returned_at && new Date(record.returned_at) > new Date(record.due_at);

                                    return (
                                    <tr key={record.id} className="border-t border-[#e6efea] dark:border-white/10">
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{record.accession_number}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">
                                            {record.book?.title || '-'}
                                            <div className="text-xs text-[#7a8d86] dark:text-[#8ea79e]">{record.book?.author || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{record.condition || '-'}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{record.returned_at ? new Date(record.returned_at).toLocaleString() : '-'}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    overdue
                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                }`}
                                            >
                                                {overdue ? 'Overdue return' : 'On time'}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {returns.links.map((link, index) => (
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
                </section>
            </div>
        </AppLayout>
    );
}
