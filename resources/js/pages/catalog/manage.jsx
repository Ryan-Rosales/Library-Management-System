import AppLayout from '@/layouts/app-layout';
import GlassSelect from '@/components/ui/glass-select';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

function defaultValueByType(field) {
    if (field.type === 'select') {
        return field.options?.[0]?.value ?? '';
    }

    return '';
}

function buildInitialData(fields) {
    return fields.reduce((acc, field) => {
        acc[field.name] = defaultValueByType(field);
        return acc;
    }, {});
}

function getValueByPath(item, path) {
    return path.split('.').reduce((value, key) => (value ? value[key] : null), item);
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'available':
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
        case 'issued':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        case 'reserved':
            return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300';
        case 'being_processed':
            return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
        case 'reference_only':
            return 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300';
        default:
            return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300';
    }
}

function formatStatusLabel(status) {
    if (!status) {
        return '-';
    }

    if (status === 'issued') {
        return 'Borrowed';
    }

    return String(status)
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function CatalogManagePage({ title, records, filters, routes, fields, columns }) {
    const breadcrumbs = [
        { title: 'Catalog', href: '/books' },
        { title, href: route(routes.index) },
    ];

    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState(filters?.search || '');
    const initialData = useMemo(() => buildInitialData(fields), [fields]);

    const { data, setData, post, put, processing, errors, reset } = useForm(initialData);

    const submit = (event) => {
        event.preventDefault();

        if (editingId) {
            put(route(routes.update, editingId), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingId(null);
                    reset();
                },
            });
            return;
        }

        post(route(routes.store), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const editRecord = (item) => {
        const nextData = {};

        fields.forEach((field) => {
            const value = getValueByPath(item, field.name);
            nextData[field.name] = value ?? defaultValueByType(field);
        });

        setEditingId(item.id);
        setData(nextData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        reset();
    };

    const removeRecord = (id) => {
        if (!window.confirm(`Delete this ${title.toLowerCase()} record?`)) {
            return;
        }

        router.delete(route(routes.destroy, id), { preserveScroll: true });
    };

    const applySearch = (event) => {
        event.preventDefault();
        router.get(
            route(routes.index),
            { search },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const renderField = (field) => {
        if (field.type === 'textarea') {
            return (
                <textarea
                    value={data[field.name] || ''}
                    onChange={(event) => setData(field.name, event.target.value)}
                    className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                    placeholder={field.label}
                    rows={3}
                />
            );
        }

        if (field.type === 'select') {
            return (
                <GlassSelect
                    value={data[field.name] || ''}
                    onValueChange={(value) => setData(field.name, value)}
                    options={(field.options || []).map((option) => ({ value: option.value, label: option.label }))}
                />
            );
        }

        return (
            <input
                type={field.type || 'text'}
                value={data[field.name] || ''}
                onChange={(event) => setData(field.name, event.target.value)}
                className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                placeholder={field.label}
            />
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-6 md:py-6">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">CATALOG</p>
                        <h1 className="mt-1 text-4xl font-semibold text-[#1a2b24] dark:text-[#def5ec] md:text-5xl" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                            {title}
                        </h1>
                    </div>
                </div>

                <section className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '70ms' }}>
                    <div className="mb-4 flex items-center gap-2 text-[#2c6d52] dark:text-[#96e2c2]">
                        <Plus size={18} />
                        <h2 className="text-lg font-semibold">{editingId ? `Edit ${title}` : `Add ${title.slice(0, -1)}`}</h2>
                    </div>

                    <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
                        {fields.map((field) => (
                            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-3' : ''}>
                                <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">{field.label}</label>
                                {renderField(field)}
                                {errors[field.name] && <p className="mt-1 text-xs text-red-600">{errors[field.name]}</p>}
                            </div>
                        ))}

                        <div className="md:col-span-3 flex flex-wrap items-center gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Plus size={14} />
                                {editingId ? 'Update' : 'Add'}
                            </button>

                            {editingId && (
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

                <section className="page-enter-item relative z-10 mt-5 rounded-3xl border border-white/70 bg-white/82 p-5 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '120ms' }}>
                    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold text-[#1d3029] dark:text-[#d9f3e8]">{title} Table</h2>
                        <form onSubmit={applySearch} className="flex w-full max-w-sm items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6a837a]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="w-full rounded-xl border border-[#d4ddd8] bg-white py-2 pl-9 pr-3 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    placeholder={`Search ${title.toLowerCase()}...`}
                                />
                            </div>
                            <button className="rounded-xl bg-[#2f8e63] px-3 py-2 text-sm font-semibold text-white">Find</button>
                        </form>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#dce8e2] dark:border-white/10">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#edf8f2] text-left text-[#2b5444] dark:bg-[#14332d] dark:text-[#a9dfc7]">
                                <tr>
                                    {columns.map((column) => (
                                        <th key={column.key} className="px-4 py-3">
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.data.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-[#627a72] dark:text-[#9ab1a8]" colSpan={columns.length + 1}>
                                            No records found yet.
                                        </td>
                                    </tr>
                                )}

                                {records.data.map((item) => (
                                    <tr key={item.id} className="border-t border-[#e6efea] dark:border-white/10">
                                        {columns.map((column) => {
                                            const rawValue = getValueByPath(item, column.key);
                                            const value = rawValue ?? '-';

                                            if (column.key === 'status') {
                                                return (
                                                    <td key={`${item.id}-${column.key}`} className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadgeClass(rawValue)}`}>
                                                            {formatStatusLabel(rawValue)}
                                                        </span>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td key={`${item.id}-${column.key}`} className="px-4 py-3 text-[#5f756d] dark:text-[#9cb2ab]">
                                                    {String(value)}
                                                </td>
                                            );
                                        })}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => editRecord(item)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-[#cde1d7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#2f6c53] hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/10 dark:text-[#bde8d3]"
                                                >
                                                    <Edit3 size={12} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => removeRecord(item.id)}
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
                        {records.links.map((link, index) => (
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
