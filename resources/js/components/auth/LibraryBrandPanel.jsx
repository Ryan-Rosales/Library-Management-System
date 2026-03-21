const shelfPalette = [
    '#39a16f',
    '#2f9657',
    '#86b83d',
    '#206090',
    '#6b50c6',
    '#bc7b25',
    '#2b9c7d',
    '#8da42f',
    '#2f6db1',
    '#b33f6e',
    '#4aa68a',
    '#ab7e31',
];

const shelfBars = Array.from({ length: 32 }, (_, index) => ({
    color: shelfPalette[index % shelfPalette.length],
    height: 20 + ((index * 11) % 26),
}));

export default function LibraryBrandPanel({ loginStats }) {
    const stats = [
        { label: 'BOOKS', value: loginStats?.books || '0' },
        { label: 'MEMBERS', value: loginStats?.members || '0' },
        { label: 'ON LOAN', value: loginStats?.onLoan || '0' },
    ];

    return (
        <div className="auth-brand-pane page-enter relative flex h-full min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#0e7a58_0%,#0c3d32_38%,#092424_100%)] px-10 py-8 text-white dark:bg-[radial-gradient(circle_at_10%_10%,#0d5e46_0%,#082c30_38%,#06131a_100%)]">
            <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#6ef0be]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 bottom-8 h-80 w-80 rounded-full bg-[#50b4ff]/25 blur-3xl" />
            <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-[linear-gradient(120deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_42%)]" />

            <div className="auth-brand-strip page-enter-item relative z-10 flex items-center gap-4 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-md">
                <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-[#1f7a4f] shadow-lg shadow-[#1f7a4f]/45">
                    <img src="/images/Libraria.png" alt="Libraria" className="h-full w-full object-cover" />
                </div>
                <div>
                    <p className="text-2xl font-semibold tracking-tight text-white">Libraria</p>
                    <p className="text-xs font-semibold tracking-[0.16em] text-white/70">MANAGEMENT SYSTEM</p>
                </div>
            </div>

            <section className="auth-hero-section relative z-10 flex flex-1 items-center justify-center py-6">
                <div className="mx-auto w-full max-w-2xl text-center">
                    <h1
                        className="auth-hero-title page-enter-item text-5xl leading-[1.03] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.35)] xl:text-6xl"
                        style={{ animationDelay: '80ms', fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                    >
                        Your library,
                        <span className="block italic text-[#9af7d4]">always open.</span>
                    </h1>
                    <p className="auth-hero-copy page-enter-item mx-auto mt-5 max-w-xl text-xl leading-relaxed text-white/85" style={{ animationDelay: '130ms' }}>
                        Access thousands of books, manage loans, and discover your next best read from one platform.
                    </p>
                </div>
            </section>

            <section className="auth-stats-section page-enter-item relative z-10 border-t border-white/20 pt-5" style={{ animationDelay: '180ms' }}>
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
                            <p
                                className="text-3xl font-semibold text-white"
                                style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                            >
                                {item.value}
                            </p>
                            <p className="mt-1 text-xs font-semibold tracking-[0.15em] text-white/70">{item.label}</p>
                        </div>
                    ))}
                </div>

                <div className="auth-shelf-bar mt-5 grid h-16 grid-cols-[repeat(32,minmax(0,1fr))] items-end gap-1 overflow-hidden rounded-xl border border-white/15 bg-black/20 px-3 py-2">
                    {shelfBars.map((bar, index) => (
                        <span
                            key={`${bar.color}-${index}`}
                            className="w-full rounded-t"
                            style={{
                                backgroundColor: bar.color,
                                height: `${bar.height}px`,
                            }}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
