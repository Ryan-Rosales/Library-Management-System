import SystemToaster from '@/components/system-toaster';

export default function LibraryAuthLayout({ leftPanel, formPanel }) {
    return (
        <>
            <main className="auth-baseline page-enter relative h-dvh min-h-dvh overflow-hidden bg-[linear-gradient(125deg,#f5fbf7_0%,#eef6ff_45%,#f6fbff_100%)] dark:bg-[linear-gradient(125deg,#081411_0%,#0b1a1d_40%,#0f1f2a_100%)]">
                <div className="pointer-events-none absolute left-12 top-10 h-72 w-72 rounded-full bg-[#9fe3c8]/40 blur-3xl dark:bg-[#40b889]/20" />
                <div className="pointer-events-none absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-[#c7ddff]/50 blur-3xl dark:bg-[#5c8de4]/25" />
                <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#ffe7c7]/45 blur-3xl dark:bg-[#4d6f9d]/18" />

                <div className="auth-baseline-grid relative grid h-full min-h-0 w-full overflow-hidden bg-white/55 shadow-[0_40px_120px_rgba(46,76,67,0.25)] backdrop-blur-xl dark:bg-black/30 dark:shadow-[0_45px_120px_rgba(2,8,8,0.65)] lg:grid-cols-[1.3fr_0.92fr]">
                    <section className="auth-left-pane hidden min-h-0 overflow-hidden lg:block">{leftPanel}</section>
                    <section className="auth-right-pane relative flex min-h-0 w-full flex-col overflow-hidden bg-[linear-gradient(180deg,#f9fffd_0%,#f4f8fb_100%)] dark:bg-[linear-gradient(180deg,#101b20_0%,#111a1f_100%)]">
                        <div className="pointer-events-none absolute right-10 top-10 h-44 w-44 rounded-full bg-[#dff8eb] blur-3xl dark:bg-[#2a7f66]/30" />
                        <div className="pointer-events-none absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-[#dbe9ff]/80 blur-3xl dark:bg-[#40639a]/30" />
                        <div className="relative z-10 h-full min-h-0 w-full">{formPanel}</div>
                    </section>
                </div>
            </main>
            <SystemToaster />
        </>
    );
}
