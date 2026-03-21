import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, Layers3 } from 'lucide-react';

export default function LibrarySection({ title, category }) {
    const breadcrumbs = [
        { title: category, href: '#' },
        { title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f2fbf6_0%,#edf5ff_46%,#f5f8ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#091512_0%,#0d1a1f_46%,#0f1624_100%)] md:px-7 md:py-7">
                <div className="pointer-events-none absolute left-12 top-0 h-72 w-72 rounded-full bg-[#8ce9c6]/35 blur-3xl dark:bg-[#46aa8f]/20" />

                <div className="page-enter-item relative z-10 mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <p className="text-sm font-semibold tracking-[0.14em] text-[#2f7c59] dark:text-[#8edaba]">{category.toUpperCase()}</p>
                        <h1
                            className="mt-1 text-5xl font-semibold text-[#1a2b24] dark:text-[#def5ec]"
                            style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                        >
                            {title}
                        </h1>
                    </div>
                </div>

                <div className="page-enter-item relative z-10 rounded-3xl border border-white/70 bg-white/82 p-6 shadow-[0_24px_50px_rgba(33,72,60,0.12)] backdrop-blur dark:border-white/15 dark:bg-[#0f1d24cc] dark:shadow-[0_24px_55px_rgba(3,9,14,0.6)]" style={{ animationDelay: '80ms' }}>
                    <div className="mb-5 flex items-center justify-between">
                        <div className="inline-flex items-center gap-3 rounded-2xl bg-[#ecf9f2] px-3 py-2 text-[#2d7757] dark:bg-[#173630] dark:text-[#98e5c4]">
                            <Layers3 size={16} />
                            <span className="text-sm font-semibold">{title} Module</span>
                        </div>
                        <button className="inline-flex items-center gap-1 rounded-full border border-[#d3e6dd] bg-white px-3 py-1.5 text-xs font-semibold text-[#356d58] transition hover:bg-[#eef8f3] dark:border-white/20 dark:bg-white/10 dark:text-[#9be4c4] dark:hover:bg-white/15">
                            Configure
                            <ArrowUpRight size={12} />
                        </button>
                    </div>

                    <p className="max-w-2xl text-sm leading-relaxed text-[#627a72] dark:text-[#9ab1a8]">
                        This page is connected and ready for development. You can now add tables, forms, and workflows specific to {title.toLowerCase()} while keeping the same premium UI system.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
