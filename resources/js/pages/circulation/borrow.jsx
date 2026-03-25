import AppLayout from '@/layouts/app-layout';
import GlassSelect from '@/components/ui/glass-select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeftRight, Search } from 'lucide-react';
import { useState } from 'react';

const initialForm = {
    book_id: '',
    borrow_quantity: '1',
    borrower_id: '',
    due_at: '',
};

export default function BorrowPage({ availableCopies, options, filters, reservations = [] }) {
    const breadcrumbs = [
        { title: 'Circulation', href: '/borrow' },
        { title: 'Borrow', href: '/borrow' },
    ];

    const [search, setSearch] = useState(filters?.search || '');
    const reservationsCount = Array.isArray(reservations) ? reservations.length : 0;
    const [isReservationDialogOpen, setReservationDialogOpen] = useState(false);
    const [activeReservationId, setActiveReservationId] = useState(reservations[0]?.id || '');

    const defaultBookId = options?.availableBooks?.[0]?.value?.toString() || '';

    const { data, setData, post, processing, errors, reset } = useForm({
        ...initialForm,
        book_id: defaultBookId,
        borrow_quantity: '1',
        borrower_id: options?.members?.[0]?.value?.toString() || '',
    });

    const filteredCopyOptions = options.availableCopies.filter((copy) => String(copy.book_id) === String(data.book_id));

    const handleBookChange = (bookId) => {
        setData('book_id', bookId);

        const nextAvailableCount = options.availableCopies.filter((copy) => String(copy.book_id) === String(bookId)).length;
        const currentQuantity = Number(data.borrow_quantity) || 1;
        const boundedQuantity = Math.max(1, Math.min(currentQuantity, Math.max(nextAvailableCount, 1)));

        setData('borrow_quantity', String(boundedQuantity));
    };

    const submitBorrow = (event) => {
        event.preventDefault();

        post(route('circulation.borrow'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                const nextBookId = options?.availableBooks?.[0]?.value?.toString() || '';

                setData('book_id', nextBookId);
                setData('borrow_quantity', '1');
                setData('borrower_id', options?.members?.[0]?.value?.toString() || '');
            },
        });
    };

    const maxBorrowable = Math.max(filteredCopyOptions.length, 1);

    const openReservationDialog = () => {
        setReservationDialogOpen(true);
        if (!activeReservationId && reservations[0]) {
            setActiveReservationId(reservations[0].id);
        }
    };

    const closeReservationDialog = () => {
        setReservationDialogOpen(false);
    };

    const applySearch = (event) => {
        event.preventDefault();

        router.get(
            route('circulation.borrow.page'),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Borrow" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-6 md:py-6">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">CIRCULATION</p>
                        <h1 className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#def5ec] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                            Borrow
                        </h1>
                    </div>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '70ms' }}>
                    <div className="mb-4 flex flex-col gap-2 text-[#2c6d52] dark:text-[#96e2c2] md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <ArrowLeftRight size={18} />
                            <h2 className="text-lg font-semibold">Borrow Books</h2>
                        </div>
                        <button
                            type="button"
                            onClick={openReservationDialog}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#c7d8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#355f4f] shadow-sm transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/8 dark:text-[#c8e6da]"
                        >
                            View ready reservations
                            {reservationsCount > 0 && (
                                <span className="flex h-4 min-w-[1.25rem] items-center justify-center rounded-full bg-[#2f8e63] px-1.5 text-[10px] font-semibold text-white">
                                    {reservationsCount}
                                </span>
                            )}
                        </button>
                    </div>

                    <form onSubmit={submitBorrow} className="grid gap-3 md:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">BOOK</label>
                            <GlassSelect
                                value={data.book_id}
                                onValueChange={handleBookChange}
                                placeholder="Select available book"
                                options={[
                                    { value: '', label: 'Select available book' },
                                    ...options.availableBooks.map((book) => ({ value: String(book.value), label: book.label })),
                                ]}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">QUANTITY</label>
                            <input
                                type="number"
                                min={1}
                                max={maxBorrowable}
                                value={data.borrow_quantity}
                                onChange={(event) => {
                                    const rawValue = Number(event.target.value);
                                    if (Number.isNaN(rawValue)) {
                                        setData('borrow_quantity', '1');
                                        return;
                                    }

                                    const boundedValue = Math.max(1, Math.min(rawValue, maxBorrowable));
                                    setData('borrow_quantity', String(boundedValue));
                                }}
                                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                            />
                            <p className="mt-1 text-xs text-[#5f756d] dark:text-[#9cb2ab]">Available copies for selected book: {filteredCopyOptions.length}</p>
                            {errors.borrow_quantity && <p className="mt-1 text-xs text-red-600">{errors.borrow_quantity}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">MEMBER</label>
                            <GlassSelect
                                value={data.borrower_id}
                                onValueChange={(value) => setData('borrower_id', value)}
                                placeholder="Select member"
                                options={[
                                    { value: '', label: 'Select member' },
                                    ...options.members.map((member) => ({ value: String(member.value), label: member.label })),
                                ]}
                            />
                            {errors.borrower_id && <p className="mt-1 text-xs text-red-600">{errors.borrower_id}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">DUE DATE</label>
                            <input
                                type="date"
                                value={data.due_at}
                                onChange={(event) => setData('due_at', event.target.value)}
                                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                            />
                            {errors.due_at && <p className="mt-1 text-xs text-red-600">{errors.due_at}</p>}
                        </div>

                        <div className="md:col-span-3 flex flex-wrap items-center gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Borrow Books
                            </button>
                        </div>
                    </form>
                </section>

                <section className="page-enter-item relative z-10 mt-5 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '120ms' }}>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-[#1d3029] dark:text-[#d9f3e8]">Available Book Copies</h2>
                        <form onSubmit={applySearch} className="flex w-full max-w-sm items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a837a]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white py-2 pl-9 pr-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    placeholder="Search available copies..."
                                />
                            </div>
                            <button className="rounded-xl bg-[#2f8e63] px-3 py-2 text-sm font-semibold text-white">Find</button>
                        </form>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#dce8e2] dark:border-white/10">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#edf8f2] text-left text-[#2b5444] dark:bg-[#14332d] dark:text-[#a9dfc7]">
                                <tr>
                                    <th className="px-4 py-3">Accession #</th>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Condition</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {availableCopies.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-[#627a72] dark:text-[#9ab1a8]" colSpan={4}>
                                            No available copies found.
                                        </td>
                                    </tr>
                                )}

                                {availableCopies.data.map((copy) => (
                                    <tr key={copy.id} className="border-t border-[#e6efea] dark:border-white/10">
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{copy.accession_number}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">
                                            {copy.book?.title || '-'}
                                            <div className="text-xs text-[#7a8d86] dark:text-[#8ea79e]">{copy.book?.author || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{copy.condition || '-'}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{copy.status || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {availableCopies.links.map((link, index) => (
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

            <Dialog open={isReservationDialogOpen} onOpenChange={setReservationDialogOpen}>
                <DialogContent>
                    <DialogTitle>Process scheduled reservations</DialogTitle>
                    <DialogDescription>
                        These reservations already have member-chosen claim and due dates. You can accept (issue) or reject them.
                    </DialogDescription>

                    {reservations.length === 0 ? (
                        <p className="mt-3 text-sm text-[#5f756d] dark:text-[#9cb2ab]">There are no fulfilled reservations at the moment.</p>
                    ) : (
                        <form className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">RESERVATION</label>
                                <select
                                    value={activeReservationId}
                                    onChange={(event) => setActiveReservationId(Number(event.target.value))}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                >
                                    {reservations.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.book_title}
                                            {' - '} {item.member_name} ({item.member_email}) [Claim: {item.claim_at || 'n/a'} | Due: {item.due_at || 'n/a'}]
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <DialogFooter className="gap-2">
                                <button
                                    type="button"
                                    onClick={closeReservationDialog}
                                    className="rounded-xl border border-[#c7d8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#355f4f] transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/8 dark:text-[#c8e6da]"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!activeReservationId) return;
                                        router.post(
                                            route('circulation.reject-reservation'),
                                            { reservation_id: activeReservationId },
                                            {
                                                preserveScroll: true,
                                                onSuccess: () => closeReservationDialog(),
                                            },
                                        );
                                    }}
                                    className="rounded-xl border border-[#d7a9a4] bg-[#fff5f4] px-3 py-1.5 text-xs font-semibold text-[#b04c40] transition hover:bg-[#ffe9e7] dark:border-[#7c3f3a] dark:bg-[#331d1b] dark:text-[#f0aca3]"
                                >
                                    Reject reservation
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!activeReservationId) return;
                                        router.post(
                                            route('circulation.issue-reservation'),
                                            { reservation_id: activeReservationId },
                                            {
                                                preserveScroll: true,
                                                onSuccess: () => closeReservationDialog(),
                                            },
                                        );
                                    }}
                                    className="rounded-xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
                                >
                                    Accept & issue
                                </button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
