import AppLayout from '@/layouts/app-layout';
import GlassSelect from '@/components/ui/glass-select';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit3, Filter, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const emptyForm = {
    title: '',
    isbn: '',
    author: '',
    category: '',
    genre: '',
    shelf: '',
    published_at: '',
    status: 'available',
};

function getBookStatusBadge(status) {
    switch (status) {
        case 'available':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        case 'being_processed':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        case 'reference_only':
            return 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300';
    }
}

function formatBookStatus(status) {
    if (status === 'being_processed') {
        return 'Being Processed';
    }

    if (status === 'reference_only') {
        return 'Reference only';
    }

    return 'Available';
}

function formatPublishedDate(value) {
    if (!value) {
        return '-';
    }

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return String(value).slice(0, 10);
    }

    return parsed.toLocaleDateString();
}

export default function BooksPage({ books, filters, options }) {
    const breadcrumbs = [
        { title: 'Catalog', href: '/books' },
        { title: 'Books', href: '/books' },
    ];

    const [editingBookId, setEditingBookId] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters?.category || '');
    const [shelfFilter, setShelfFilter] = useState(filters?.shelf || '');

    const { data, setData, post, put, processing, errors, reset } = useForm(emptyForm);

    const submit = (event) => {
        event.preventDefault();

        if (editingBookId) {
            put(route('books.update', editingBookId), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingBookId(null);
                    reset();
                },
            });
            return;
        }

        post(route('books.store'), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const editBook = (book) => {
        setEditingBookId(book.id);
        setData({
            title: book.title || '',
            isbn: book.isbn || '',
            author: book.author || '',
            category: book.category || '',
            genre: book.genre || '',
            shelf: book.shelf || '',
            published_at: book.published_at ? String(book.published_at).slice(0, 10) : '',
            status: book.status,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingBookId(null);
        reset();
    };

    const removeBook = (id) => {
        if (!window.confirm('Delete this book record?')) {
            return;
        }

        router.delete(route('books.destroy', id), {
            preserveScroll: true,
        });
    };

    const applySearch = (event) => {
        event.preventDefault();

        const payload = {
            search: search || undefined,
            status: statusFilter || undefined,
            category: categoryFilter || undefined,
            shelf: shelfFilter || undefined,
        };

        router.get(
            route('books'),
            payload,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetSearchFilters = () => {
        setSearch('');
        setStatusFilter('');
        setCategoryFilter('');
        setShelfFilter('');

        router.get(
            route('books'),
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
            <Head title="Books" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-7 md:py-7">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">CATALOG</p>
                        <h1 className="mt-1 text-5xl font-semibold text-[#1a2b24] dark:text-[#def5ec]" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                            Books
                        </h1>
                    </div>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-6 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '70ms' }}>
                    <div className="mb-4 flex items-center gap-2 text-[#2c6d52] dark:text-[#96e2c2]">
                        <Plus size={18} />
                        <h2 className="text-xl font-semibold">{editingBookId ? 'Edit Book' : 'Add Book'}</h2>
                    </div>

                    <form onSubmit={submit} className="grid gap-3 md:grid-cols-4">
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">TITLE</label>
                            <input
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                placeholder="Book title"
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">ISBN</label>
                            <input
                                value={data.isbn}
                                onChange={(event) => setData('isbn', event.target.value)}
                                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                placeholder="Optional"
                            />
                            {errors.isbn && <p className="mt-1 text-xs text-red-600">{errors.isbn}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">AUTHOR</label>
                            <GlassSelect
                                value={data.author}
                                onValueChange={(value) => setData('author', value)}
                                placeholder="Select author"
                                options={[
                                    { value: '', label: 'Select author' },
                                    ...options.authors.map((author) => ({ value: author, label: author })),
                                ]}
                            />
                            {errors.author && <p className="mt-1 text-xs text-red-600">{errors.author}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">CATEGORY</label>
                            <GlassSelect
                                value={data.category}
                                onValueChange={(value) => setData('category', value)}
                                placeholder="Select category"
                                options={[
                                    { value: '', label: 'Select category' },
                                    ...options.categories.map((category) => ({ value: category, label: category })),
                                ]}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">GENRE</label>
                            <GlassSelect
                                value={data.genre}
                                onValueChange={(value) => setData('genre', value)}
                                placeholder="Select genre"
                                options={[
                                    { value: '', label: 'Select genre' },
                                    ...options.genres.map((genre) => ({ value: genre, label: genre })),
                                ]}
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">STATUS</label>
                            <GlassSelect
                                value={data.status}
                                onValueChange={(nextStatus) => {
                                    setData('status', nextStatus);
                                    if (nextStatus === 'being_processed') {
                                        setData('shelf', '');
                                    }
                                }}
                                options={[
                                    { value: 'available', label: 'Available' },
                                    { value: 'being_processed', label: 'Being Processed' },
                                    { value: 'reference_only', label: 'Reference only' },
                                ]}
                            />
                            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">SHELF</label>
                            <TooltipProvider delayDuration={100}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={data.status === 'being_processed' ? 'cursor-not-allowed' : ''}>
                                            <GlassSelect
                                                value={data.shelf}
                                                onValueChange={(value) => setData('shelf', value)}
                                                disabled={data.status === 'being_processed'}
                                                className={data.status === 'being_processed' ? 'cursor-not-allowed opacity-70' : ''}
                                                placeholder="Select shelf"
                                                options={[
                                                    { value: '', label: 'Select shelf' },
                                                    ...options.shelves.map((shelf) => ({ value: shelf.value, label: shelf.label })),
                                                ]}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    {data.status === 'being_processed' && <TooltipContent>Not yet ready for the public</TooltipContent>}
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">PUBLISHED DATE</label>
                            <input
                                type="date"
                                value={data.published_at}
                                onChange={(event) => setData('published_at', event.target.value)}
                                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                            />
                            {errors.published_at && <p className="mt-1 text-xs text-red-600">{errors.published_at}</p>}
                        </div>

                        <div className="md:col-span-4 flex flex-wrap items-center gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Plus size={14} />
                                {editingBookId ? 'Update Book' : 'Add Book'}
                            </button>

                            {editingBookId && (
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="inline-flex items-center gap-2 rounded-xl border border-[#c7d8d1] bg-white px-4 py-2.5 text-sm font-semibold text-[#355f4f] transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/10 dark:text-[#c8e6da]"
                                >
                                    <X size={14} />
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="page-enter-item relative z-10 mt-5 rounded-3xl border border-white/70 bg-white/82 p-6 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '120ms' }}>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold text-[#1d3029] dark:text-[#d9f3e8]">Books Table</h2>
                        <form onSubmit={applySearch} className="grid w-full gap-2 sm:grid-cols-2 xl:grid-cols-[1.4fr_0.8fr_0.9fr_0.9fr_auto_auto]">
                            <div className="relative sm:col-span-2 xl:col-span-1">
                                <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#688177]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white py-2 pl-9 pr-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    placeholder="Title, author, ISBN..."
                                />
                            </div>

                            <GlassSelect
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                                className="min-w-0"
                                placeholder="All statuses"
                                options={[
                                    { value: '', label: 'All statuses' },
                                    ...options.statuses.map((status) => ({ value: status.value, label: status.label })),
                                ]}
                            />

                            <GlassSelect
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                                className="min-w-0"
                                placeholder="All categories"
                                options={[
                                    { value: '', label: 'All categories' },
                                    ...options.categories.map((category) => ({ value: category, label: category })),
                                ]}
                            />

                            <GlassSelect
                                value={shelfFilter}
                                onValueChange={setShelfFilter}
                                className="min-w-0"
                                placeholder="All shelves"
                                options={[
                                    { value: '', label: 'All shelves' },
                                    ...options.shelves.map((shelfOption) => ({ value: shelfOption.value, label: shelfOption.label })),
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
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Author</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3">Shelf</th>
                                    <th className="px-4 py-3">Published Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-[#627a72] dark:text-[#9ab1a8]" colSpan={7}>
                                            No books found yet.
                                        </td>
                                    </tr>
                                )}

                                {books.data.map((book) => (
                                    <tr key={book.id} className="border-t border-[#e6efea] dark:border-white/10">
                                        <td className="px-4 py-3 font-semibold text-[#1f322b] dark:text-[#d7eee4]">{book.title}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{book.author}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{book.category || '-'}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{book.shelf || '-'}</td>
                                        <td className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">{formatPublishedDate(book.published_at)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getBookStatusBadge(book.status)}`}>
                                                {formatBookStatus(book.status)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => editBook(book)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#cde1d7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2f6c53] hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/10 dark:text-[#bde8d3]"
                                                >
                                                    <Edit3 size={12} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => removeBook(book.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#efc7c7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#b04848] hover:bg-[#fff2f2] dark:border-[#703535] dark:bg-white/10 dark:text-[#efb0b0]"
                                                >
                                                    <Trash2 size={12} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        {books.links.map((link, index) => (
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
