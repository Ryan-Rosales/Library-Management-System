export default function AppLogo() {
    return (
        <>
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/35 bg-white/80 shadow-[0_10px_22px_rgba(37,115,87,0.25)] dark:border-white/15 dark:bg-white/10">
                <img src="/images/yes.png" alt="Libraria" className="h-full w-full object-cover" />
            </div>
            <div className="ml-1 grid min-w-0 flex-1 text-left text-sm group-data-[collapsible=icon]:hidden">
                <span className="mb-0.5 truncate leading-none font-semibold text-[#1c3b31] dark:text-[#d4f2e4]">Libraria</span>
            </div>
        </>
    );
}
