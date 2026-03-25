import AppLayout from '@/layouts/app-layout';
import GlassSelect from '@/components/ui/glass-select';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Search } from 'lucide-react';
import { useState } from 'react';

function statusPillClass(kind) {
    if (kind === 'available') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    if (kind === 'checked_out') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
}

export default function MemberCatalog({ books, filters, options }) {
    const breadcrumbs = [
        { title: 'Member', href: '/member/dashboard' },
        { title: 'Online Catalog', href: '/member/catalog' },
    ];

    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || '');
    const [genre, setGenre] = useState(filters?.genre || '');
    const [author, setAuthor] = useState(filters?.author || '');

    const applyFilters = (event) => {
        event.preventDefault();

        router.get(
            route('member.catalog'),
            {
                search: search || undefined,
                category: category || undefined,
                genre: genre || undefined,
                author: author || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        setSearch('');
        setCategory('');
        setGenre('');
        setAuthor('');

        router.get(route('member.catalog'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const reserveBook = (bookId) => {
        router.post(route('member.catalog.reserve', bookId), {}, { preserveScroll: true });
    };

    const cancelReservation = (reservationId) => {
        router.patch(route('member.reservations.cancel', reservationId), {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Online Catalog" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(135deg,#f6fbff_0%,#eef7f3_50%,#edf3ff_100%)] px-4 py-5 dark:bg-[linear-gradient(135deg,#081824_0%,#0a1f1a_50%,#0b1728_100%)] md:px-7 md:py-7">
                <div className="pointer-events-none absolute left-6 top-0 h-72 w-72 rounded-full bg-[#8fe0c4]/30 blur-3xl dark:bg-[#2d8f70]/20" />

                <div className="page-enter-item relative z-10 mb-4">
                    <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7b5b] dark:text-[#8fdfbe]">MEMBER OPAC</p>
                    <h1 className="mt-1 text-4xl font-semibold text-[#193042] dark:text-[#e0effc] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                        Online Catalog
                    </h1>
                    <p className="mt-2 text-sm text-[#5e7286] dark:text-[#9bb0c4]">Search by title, ISBN, author, category, or genre and see copy availability in real time.</p>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/86 p-5 shadow-[0_22px_48px_rgba(27,59,88,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#111c2ac9]" style={{ animationDelay: '70ms' }}>
                    <form onSubmit={applyFilters} className="grid gap-3 md:grid-cols-5">
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">SEARCH</label>
                            <div className="relative">
                                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#688177]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white px-9 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#102028] dark:text-[#d8efe4]"
                                    placeholder="Title, ISBN, author"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">CATEGORY</label>
                            <GlassSelect
                                value={category}
                                onValueChange={setCategory}
                                options={[{ value: '', label: 'All categories' }, ...options.categories.map((item) => ({ value: item, label: item }))]}
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">GENRE</label>
                            <GlassSelect value={genre} onValueChange={setGenre} options={[{ value: '', label: 'All genres' }, ...options.genres.map((item) => ({ value: item, label: item }))]} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">AUTHOR</label>
                            <GlassSelect value={author} onValueChange={setAuthor} options={[{ value: '', label: 'All authors' }, ...options.authors.map((item) => ({ value: item, label: item }))]} />
                        </div>
                        <div className="md:col-span-5 flex flex-wrap gap-2 pt-1">
                            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#226ea8] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#1f5f90]">
                                <Filter size={14} />
                                Apply Filters
                            </button>
                            <button type="button" onClick={resetFilters} className="rounded-xl border border-[#c9dce9] bg-[#f3f8fd] px-3.5 py-2 text-sm font-semibold text-[#2f648f] transition hover:bg-[#e6f1fb] dark:border-white/16 dark:bg-white/8 dark:text-[#b6ddfb] dark:hover:bg-white/12">
                                Reset
                            </button>
                        </div>
                    </form>
                </section>

                <section className="relative z-10 mt-5 overflow-hidden rounded-3xl border border-white/70 bg-white/88 shadow-[0_24px_52px_rgba(29,62,92,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#111d2ac9]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#f2f8fd] text-xs font-semibold uppercase tracking-[0.08em] text-[#4f6881] dark:bg-white/6 dark:text-[#93abc0]">
                                <tr>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Category / Genre</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Shelf / Location</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.data.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-[#6a8094] dark:text-[#9eb4c8]">
                                            No books matched your search.
                                        </td>
                                    </tr>
                                )}
                                {books.data.map((book) => (
                                    <tr key={book.id} className="border-t border-[#e4edf4] align-top dark:border-white/10">
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-[#1d3f5a] dark:text-[#d7e9fb]">{book.title}</p>
                                            <p className="text-xs text-[#6a8399] dark:text-[#9eb5c9]">{book.author} | ISBN: {book.isbn || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#3f5d73] dark:text-[#b5cde0]">
                                            <p>{book.category || 'Uncategorized'}</p>
                                            <p>{book.genre || 'No genre'}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-wrap gap-1.5 text-xs">
                                                <span className={`rounded-full px-2 py-0.5 font-semibold ${statusPillClass('available')}`}>Available: {book.status.available}</span>
                                                <span className={`rounded-full px-2 py-0.5 font-semibold ${statusPillClass('checked_out')}`}>Checked out: {book.status.checked_out}</span>
                                                <span className={`rounded-full px-2 py-0.5 font-semibold ${statusPillClass('on_hold')}`}>On hold: {book.status.on_hold}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#45637a] dark:text-[#b7cfe3]">
                                            <p>{book.shelf_label}</p>
                                            <p>{book.location_label}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            {book.is_reserved_by_member ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button className="rounded-lg bg-[#e6f3ec] px-2.5 py-1 text-xs font-semibold text-[#2f7859] transition hover:bg-[#d9ecdf] dark:bg-[#17362c] dark:text-[#9fe3c4]">
                                                            Reserved
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogTitle>Reservation details</DialogTitle>
                                                        <DialogDescription>
                                                            You have an active reservation for this title. You can keep it in the queue or cancel it if you no longer need it.
                                                        </DialogDescription>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <button className="rounded-xl border border-[#c7d8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#355f4f] transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/8 dark:text-[#c8e6da]">
                                                                    Close
                                                                </button>
                                                            </DialogClose>
                                                            <button
                                                                type="button"
                                                                onClick={() => cancelReservation(book.reservation_id)}
                                                                className="rounded-xl border border-[#d7a9a4] bg-[#fff5f4] px-3 py-1.5 text-xs font-semibold text-[#b04c40] transition hover:bg-[#ffe9e7] dark:border-[#7c3f3a] dark:bg-[#331d1b] dark:text-[#f0aca3]"
                                                            >
                                                                Cancel reservation
                                                            </button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : book.can_reserve ? (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <button className="rounded-lg bg-[#226ea8] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[#1f5f90]">
                                                            Reserve
                                                        </button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogTitle>Reserve this title?</DialogTitle>
                                                        <DialogDescription>
                                                            Reserving this book will place you in the queue and, when a copy is prepared for you, you can choose when to claim it and set your own due date.
                                                        </DialogDescription>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <button className="rounded-xl border border-[#c7d8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#355f4f] transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/8 dark:text-[#c8e6da]">
                                                                    Not now
                                                                </button>
                                                            </DialogClose>
                                                            <button
                                                                type="button"
                                                                onClick={() => reserveBook(book.id)}
                                                                className="rounded-xl bg-[linear-gradient(90deg,#226ea8_0%,#1d5b8a_100%)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
                                                            >
                                                                Confirm reservation
                                                            </button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            ) : (
                                                <span className="inline-flex rounded-lg bg-[#eef2f6] px-2.5 py-1 text-xs font-semibold text-[#5a6f82] dark:bg-[#263541] dark:text-[#a7bdd1]">Available now</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {books.links?.length > 3 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e4edf4] px-4 py-3 dark:border-white/10">
                            {books.links.map((link, index) => (
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
