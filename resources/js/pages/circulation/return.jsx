import AppLayout from '@/layouts/app-layout';
import GlassSelect from '@/components/ui/glass-select';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowBigLeftDash, Filter, X } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
    book_copy_ids: [],
    condition: 'good',
};

export default function ReturnPage({ activeLoans, options, filters, schemaReady = true }) {
    const breadcrumbs = [
        { title: 'Circulation', href: '/return' },
        { title: 'Return', href: '/return' },
    ];

    const [search, setSearch] = useState(filters?.search || '');
    const [dueDateFilter, setDueDateFilter] = useState(filters?.due_date || '');
    const [loanStatusFilter, setLoanStatusFilter] = useState(filters?.loan_status || '');
    const now = new Date();

    const { data, setData, post, processing, errors, reset } = useForm(initialForm);

    const toggleLoanSelection = (loanId) => {
        const loanIdString = String(loanId);
        const isSelected = data.book_copy_ids.includes(loanIdString);

        if (isSelected) {
            setData(
                'book_copy_ids',
                data.book_copy_ids.filter((id) => id !== loanIdString),
            );
            return;
        }

        setData('book_copy_ids', [...data.book_copy_ids, loanIdString]);
    };

    const toggleSelectAllVisible = () => {
        const visibleIds = activeLoans.data.map((loan) => String(loan.id));
        const allSelected = visibleIds.length > 0 && visibleIds.every((id) => data.book_copy_ids.includes(id));

        if (allSelected) {
            setData(
                'book_copy_ids',
                data.book_copy_ids.filter((id) => !visibleIds.includes(id)),
            );
            return;
        }

        const uniqueIds = Array.from(new Set([...data.book_copy_ids, ...visibleIds]));
        setData('book_copy_ids', uniqueIds);
    };

    const submitReturn = (event) => {
        event.preventDefault();

        post(route('circulation.return'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setData('condition', 'good');
            },
        });
    };

    const applySearch = (event) => {
        event.preventDefault();

        router.get(
            route('circulation.return.page'),
            {
                search: search || undefined,
                due_date: dueDateFilter || undefined,
                loan_status: loanStatusFilter || undefined,
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
        setDueDateFilter('');
        setLoanStatusFilter('');

        router.get(
            route('circulation.return.page'),
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
            <Head title="Return" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-6 md:py-6">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">CIRCULATION</p>
                        <h1 className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#def5ec] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                            Return
                        </h1>
                    </div>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '70ms' }}>
                    {!schemaReady && (
                        <div className="mb-4 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/50 dark:bg-amber-900/25 dark:text-amber-200">
                            Circulation fields are not available in the database yet. Run <span className="font-semibold">php artisan migrate</span> to enable full Return and History features.
                        </div>
                    )}

                    <div className="mb-4 flex items-center gap-2 text-[#2c6d52] dark:text-[#96e2c2]">
                        <ArrowBigLeftDash size={18} />
                        <h2 className="text-lg font-semibold">Return Borrowed Books</h2>
                    </div>

                    <form onSubmit={submitReturn} className="grid gap-3 md:grid-cols-2">
                        <div className="md:col-span-2 rounded-xl border border-[#d4ddd8] bg-[#f7fcf9] px-3 py-2 text-sm text-[#355f4f] dark:border-white/20 dark:bg-white/8 dark:text-[#c8e6da]">
                            Selected copies to return: <span className="font-semibold">{data.book_copy_ids.length}</span>
                            {errors.book_copy_ids && <p className="mt-1 text-xs text-red-600">{errors.book_copy_ids}</p>}
                            {errors['book_copy_ids.0'] && <p className="mt-1 text-xs text-red-600">{errors['book_copy_ids.0']}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">RETURN CONDITION</label>
                            <GlassSelect
                                value={data.condition}
                                onValueChange={(value) => setData('condition', value)}
                                options={[
                                    { value: 'good', label: 'Good' },
                                    { value: 'fair', label: 'Fair' },
                                    { value: 'damaged', label: 'Damaged' },
                                ]}
                            />
                            {errors.condition && <p className="mt-1 text-xs text-red-600">{errors.condition}</p>}
                        </div>

                        <div className="md:col-span-2 flex flex-wrap items-center gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Return Selected
                            </button>
                        </div>
                    </form>
                </section>

                <section className="page-enter-item relative z-10 mt-5 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '120ms' }}>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-[#1d3029] dark:text-[#d9f3e8]">Active Loans</h2>
                        <form onSubmit={applySearch} className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-[1.25fr_0.8fr_0.9fr_auto_auto]">
                            <div className="relative sm:col-span-2 xl:col-span-1">
                                <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#688177]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white py-2 pl-9 pr-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    placeholder="Search loans..."
                                />
                            </div>
                            <input
                                type="date"
                                value={dueDateFilter}
                                onChange={(event) => setDueDateFilter(event.target.value)}
                                className="rounded-xl border border-[#d4ddd8] bg-white px-3 py-2 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                aria-label="Filter by due date"
                            />
                            <GlassSelect
                                value={loanStatusFilter}
                                onValueChange={setLoanStatusFilter}
                                className="min-w-0"
                                placeholder="All loan status"
                                options={[
                                    { value: '', label: 'All loan status' },
                                    { value: 'on_time', label: 'On time' },
                                    { value: 'overdue', label: 'Overdue' },
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
                                    <th className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            onChange={toggleSelectAllVisible}
                                            checked={activeLoans.data.length > 0 && activeLoans.data.every((loan) => data.book_copy_ids.includes(String(loan.id)))}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Accession #</th>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Borrower</th>
                                    <th className="px-4 py-3">Borrowed At</th>
                                    <th className="px-4 py-3">Due Date</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeLoans.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-[#627a72] dark:text-[#9ab1a8]" colSpan={7}>
                                            No active loans found.
                                        </td>
                                    </tr>
                                )}

                                {activeLoans.data.map((loan) => {
                                    const overdue = !!loan.due_at && new Date(loan.due_at) < now;

                                    return (
                                    <tr key={loan.id} className="border-t border-[#e6efea] dark:border-white/10">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={data.book_copy_ids.includes(String(loan.id))}
                                                onChange={() => toggleLoanSelection(loan.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{loan.accession_number}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">
                                            {loan.book?.title || '-'}
                                            <div className="text-xs text-[#7a8d86] dark:text-[#8ea79e]">{loan.book?.author || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{loan.borrower?.name || '-'}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{loan.borrowed_at ? new Date(loan.borrowed_at).toLocaleString() : '-'}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{loan.due_at ? new Date(loan.due_at).toLocaleDateString() : '-'}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    overdue
                                                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                                }`}
                                            >
                                                {overdue ? 'Overdue' : 'On time'}
                                            </span>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {activeLoans.links.map((link, index) => (
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
