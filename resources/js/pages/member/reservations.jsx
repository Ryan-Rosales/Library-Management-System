import AppLayout from '@/layouts/app-layout';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

function statusClass(status) {
    if (status === 'queued') return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300';
    if (status === 'fulfilled') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300';
}

export default function MemberReservations({ reservations }) {
    const breadcrumbs = [
        { title: 'Member', href: '/member/dashboard' },
        { title: 'Reservations', href: '/member/reservations' },
    ];

    const [isClaimDialogOpen, setClaimDialogOpen] = useState(false);
    const [activeReservation, setActiveReservation] = useState(null);
    const [claimAt, setClaimAt] = useState('');
    const [dueAt, setDueAt] = useState('');

    const cancelReservation = (id) => {
        if (!window.confirm('Cancel this reservation?')) {
            return;
        }

        router.patch(route('member.reservations.cancel', id), {}, { preserveScroll: true });
    };

    const openClaimDialog = (reservation) => {
        setActiveReservation(reservation);
        setClaimAt('');
        setDueAt('');
        setClaimDialogOpen(true);
    };

    const closeClaimDialog = () => {
        setClaimDialogOpen(false);
        setActiveReservation(null);
        setClaimAt('');
        setDueAt('');
    };

    const submitClaim = (event) => {
        event.preventDefault();

        if (!activeReservation) {
            return;
        }

        router.post(
            route('member.reservations.claim', activeReservation.id),
            {
                claim_at: claimAt,
                due_at: dueAt,
            },
            {
                preserveScroll: true,
                onSuccess: () => closeClaimDialog(),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reservations" />
            <div className="page-enter relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-[linear-gradient(130deg,#f7fbff_0%,#eef8f3_48%,#edf4ff_100%)] px-4 py-5 dark:bg-[linear-gradient(130deg,#081723_0%,#0a1f1a_48%,#0a1726_100%)] md:px-7 md:py-7">
                <h1 className="relative z-10 text-4xl font-semibold text-[#1a3348] dark:text-[#dbeefe]" style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}>
                    My Reservations
                </h1>

                <section className="relative z-10 mt-4 overflow-hidden rounded-3xl border border-white/70 bg-white/88 shadow-[0_24px_52px_rgba(29,62,92,0.12)] backdrop-blur dark:border-white/12 dark:bg-[#111d2ac9]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-[#f2f8fd] text-xs font-semibold uppercase tracking-[0.08em] text-[#4f6881] dark:bg-white/6 dark:text-[#93abc0]">
                                <tr>
                                    <th className="px-4 py-3">Book</th>
                                    <th className="px-4 py-3">Queue</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservations.data.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#6a8094] dark:text-[#9eb4c8]">
                                            No reservations yet.
                                        </td>
                                    </tr>
                                )}
                                {reservations.data.map((item) => (
                                    <tr key={item.id} className="border-t border-[#e4edf4] dark:border-white/10">
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-[#1d3f5a] dark:text-[#d7e9fb]">{item.title}</p>
                                            <p className="text-xs text-[#6a8399] dark:text-[#9eb5c9]">{item.author} | ISBN: {item.isbn || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-[#45637a] dark:text-[#b7cfe3]">
                                            <p>Position: #{item.queue_position || '-'}</p>
                                            <p>Queued: {item.queued_at || 'N/A'}</p>
                                            <p>Claim by: {item.claim_by || 'N/A'}</p>
                                            <p>Return by: {item.return_by || 'N/A'}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(item.status)}`}>{item.status}</span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            {item.status === 'queued' && (
                                                <button onClick={() => cancelReservation(item.id)} className="rounded-lg border border-[#d7a9a4] bg-[#fff5f4] px-2.5 py-1 text-xs font-semibold text-[#b04c40] transition hover:bg-[#ffe9e7] dark:border-[#7c3f3a] dark:bg-[#331d1b] dark:text-[#f0aca3]">
                                                    Cancel
                                                </button>
                                            )}
                                            {item.status === 'fulfilled' && (
                                                <button
                                                    onClick={() => openClaimDialog(item)}
                                                    className="rounded-lg bg-[#226ea8] px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-[#1f5f90]"
                                                >
                                                    Claim &amp; borrow
                                                </button>
                                            )}
                                            {item.status !== 'queued' && item.status !== 'fulfilled' && (
                                                <span className="text-xs text-[#6d8297] dark:text-[#9fb4c8]">No action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {reservations.links?.length > 3 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#e4edf4] px-4 py-3 dark:border-white/10">
                            {reservations.links.map((link, index) => (
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
                <Dialog open={isClaimDialogOpen} onOpenChange={setClaimDialogOpen}>
                    <DialogContent>
                        <DialogTitle>Claim reserved copy</DialogTitle>
                        <DialogDescription>
                            Choose when you will claim this reserved book and set your due date. These dates will be used for your loan record.
                        </DialogDescription>

                        {activeReservation && (
                            <form onSubmit={submitClaim} className="mt-4 space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#1d3f5a] dark:text-[#d7e9fb]">{activeReservation.title}</p>
                                    <p className="text-xs text-[#6a8399] dark:text-[#9eb5c9]">{activeReservation.author}</p>
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">CLAIM DATE</label>
                                    <input
                                        type="date"
                                        value={claimAt}
                                        onChange={(event) => setClaimAt(event.target.value)}
                                        className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-semibold tracking-wide text-[#4f625c] dark:text-[#9cb7ad]">DUE DATE</label>
                                    <input
                                        type="date"
                                        value={dueAt}
                                        onChange={(event) => setDueAt(event.target.value)}
                                        className="w-full rounded-xl border border-[#d4ddd8] bg-white px-3 py-2.5 text-sm text-[#22332c] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4]"
                                    />
                                </div>

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <button
                                            type="button"
                                            onClick={closeClaimDialog}
                                            className="rounded-xl border border-[#c7d8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#355f4f] transition hover:bg-[#f2faf6] dark:border-white/20 dark:bg-white/8 dark:text-[#c8e6da]"
                                        >
                                            Not now
                                        </button>
                                    </DialogClose>
                                    <button
                                        type="submit"
                                        disabled={!claimAt || !dueAt}
                                        className="rounded-xl bg-[linear-gradient(90deg,#226ea8_0%,#1d5b8a_100%)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Confirm claim
                                    </button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
