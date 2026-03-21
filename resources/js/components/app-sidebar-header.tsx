import { Breadcrumbs } from '@/components/breadcrumbs';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { Bell, KeyRound } from 'lucide-react';
import { useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const notifications = page.props.notifications || {
        passwordChangeRequests: [],
        membershipRequests: [],
        activityNotifications: [],
        memberNotifications: [],
        passwordPendingCount: 0,
        unreadCount: 0,
    };
    const role = page.props.auth?.user?.role;
    const isAdmin = role === 'admin';
    const isStaff = role === 'staff';
    const isMember = role === 'member';
    const canViewPasswordRequests = role === 'admin' || role === 'staff';
    const pendingPasswordCount = notifications.passwordPendingCount ?? notifications.passwordChangeRequests.length;
    const [isOpen, setIsOpen] = useState(false);

    const openPasswordRequest = (requestId: number) => {
        setIsOpen(false);

        router.post(route('password-change-requests.mark-read', requestId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('settings.user-account-control', { request: requestId }));
            },
        });
    };

    const openMembershipRequest = (requestId: number) => {
        setIsOpen(false);

        router.post(route('membership-requests.mark-read', requestId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                router.visit(route('membership-requests.index', { request: requestId }));
            },
        });
    };

    const openMemberNotification = (notificationId: number) => {
        setIsOpen(false);

        router.post(route('member.notifications.read', notificationId), {}, {
            preserveScroll: true,
        });
    };

    const openActivityNotification = (notificationId: number) => {
        setIsOpen(false);

        router.post(route('activity.notifications.read', notificationId), {}, {
            preserveScroll: true,
        });
    };

    const openUserAccountControl = () => {
        const firstPendingRequest = notifications.passwordChangeRequests[0];

        if (firstPendingRequest) {
            router.visit(route('settings.user-account-control', { request: firstPendingRequest.id }));
            return;
        }

        router.visit(route('settings.user-account-control'));
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-white/60 bg-white/65 px-6 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 dark:border-white/10 dark:bg-white/5 md:px-4">
            <div className="flex w-full items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <SidebarTrigger className="-ml-1 rounded-lg hover:bg-white/80 dark:hover:bg-white/12" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                aria-label="Notifications"
                                className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-white/80 text-[#3f5f53] shadow-[0_10px_24px_rgba(38,74,61,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_12px_26px_rgba(38,74,61,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fc8a1]/65 dark:border-white/20 dark:bg-white/10 dark:text-[#cae7db] dark:hover:bg-white/15 dark:hover:shadow-[0_12px_28px_rgba(3,9,14,0.7)] dark:focus-visible:ring-[#8adfc0]/60"
                            >
                                <Bell className="h-4 w-4" />
                                {notifications.unreadCount > 0 && (
                                    <span className="absolute right-1.5 top-1.5 inline-flex h-2.5 w-2.5 rounded-full border border-white/90 bg-rose-500 dark:border-[#0d1f28]" />
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80 p-2">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-sm font-semibold">Notifications</p>
                                {notifications.unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (isMember) {
                                                router.post(route('member.notifications.read-all'));
                                                return;
                                            }

                                            router.post(route('password-change-requests.mark-all-read'));
                                        }}
                                        className="text-xs font-semibold text-[#2f7c59] hover:underline dark:text-[#95e3c2]"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {!canViewPasswordRequests && !isMember && <p className="px-2 py-1.5 text-xs text-muted-foreground">No notifications available for this account.</p>}

                            {isMember && notifications.memberNotifications.length === 0 && (
                                <p className="px-2 py-1.5 text-xs text-muted-foreground">No notifications yet.</p>
                            )}

                            {isMember && notifications.memberNotifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => openMemberNotification(notification.id)}
                                    className="mb-1 block w-full rounded-lg border border-border/65 bg-background/70 px-2.5 py-2 text-left text-xs transition hover:border-[#7ec6a8]/55 hover:bg-[#eef8f3] dark:bg-white/5 dark:hover:bg-white/10"
                                >
                                    <div className="mb-0.5 flex items-center justify-between gap-2">
                                        <p className="font-semibold text-foreground">{notification.title}</p>
                                        {notification.seen_at === null && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                                    </div>
                                    <p className="text-foreground/85">{notification.message}</p>
                                    <p className="mt-1 text-[11px] text-muted-foreground">{notification.created_at || ''}</p>
                                </button>
                            ))}

                            {canViewPasswordRequests && notifications.passwordChangeRequests.length === 0 && notifications.membershipRequests.length === 0 && (
                                notifications.activityNotifications.length === 0 && (
                                <p className="px-2 py-1.5 text-xs text-muted-foreground">No pending notifications.</p>
                                )
                            )}

                            {canViewPasswordRequests && notifications.activityNotifications.length > 0 && (
                                <p className="px-2 pt-1 pb-1 text-[10px] font-semibold tracking-[0.09em] text-[#5b7469] uppercase dark:text-[#9cb9ae]">
                                    Team activity
                                </p>
                            )}

                            {canViewPasswordRequests && notifications.activityNotifications.map((notification) => {
                                const actorName = notification.meta?.actor_name;
                                const actorRole = notification.meta?.actor_role;

                                return (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() => openActivityNotification(notification.id)}
                                        className="mb-1 block w-full rounded-lg border border-border/65 bg-background/70 px-2.5 py-2 text-left text-xs transition hover:border-[#7ec6a8]/55 hover:bg-[#eef8f3] dark:bg-white/5 dark:hover:bg-white/10"
                                    >
                                        <div className="mb-0.5 flex items-center justify-between gap-2">
                                            <p className="font-semibold text-foreground">{notification.title}</p>
                                            <div className="flex items-center gap-1.5">
                                                {actorRole && (
                                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                                        actorRole === 'admin'
                                                            ? 'bg-[#fef2e6] text-[#8a5a20] dark:bg-[#3c2b18] dark:text-[#f0c68d]'
                                                            : 'bg-[#e6f1fb] text-[#256090] dark:bg-[#1a3142] dark:text-[#a6d4fb]'
                                                    }`}>
                                                        {actorRole}
                                                    </span>
                                                )}
                                                {notification.seen_at === null && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                                            </div>
                                        </div>
                                        {actorName && <p className="text-muted-foreground">By: {actorName}</p>}
                                        <p className="mt-1 text-foreground/85">{notification.message}</p>
                                        <p className="mt-1 text-[11px] text-muted-foreground">{notification.created_at || ''}</p>
                                    </button>
                                );
                            })}

                            {canViewPasswordRequests && notifications.passwordChangeRequests.length > 0 && (
                                <p className="px-2 pb-1 text-[10px] font-semibold tracking-[0.09em] text-[#5b7469] uppercase dark:text-[#9cb9ae]">
                                    Password change requests
                                </p>
                            )}

                            {canViewPasswordRequests && notifications.passwordChangeRequests.map((notification) => {
                                const content = (
                                    <>
                                        <div className="mb-0.5 flex items-center justify-between gap-2">
                                            <p className="font-semibold text-foreground">{notification.requester_name || notification.requester_email}</p>
                                            <span className="rounded-full bg-[#e6f7ef] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#226a4a] dark:bg-[#1a3c2f] dark:text-[#b2ead1]">
                                                {notification.requester_role}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground">{notification.requester_email}</p>
                                        {notification.reason && <p className="mt-1 line-clamp-2 text-foreground/85">Reason: {notification.reason}</p>}
                                    </>
                                );

                                if (isAdmin || isStaff) {
                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            onClick={() => openPasswordRequest(notification.id)}
                                            className="mb-1 block rounded-lg border border-border/65 bg-background/70 px-2.5 py-2 text-xs transition hover:border-[#7ec6a8]/55 hover:bg-[#eef8f3] dark:bg-white/5 dark:hover:bg-white/10"
                                        >
                                            {content}
                                        </button>
                                    );
                                }

                                return (
                                    <div key={notification.id} className="mb-1 rounded-lg border border-border/65 bg-background/70 px-2.5 py-2 text-xs dark:bg-white/5">
                                        {content}
                                    </div>
                                );
                            })}

                            {isStaff && notifications.membershipRequests.length > 0 && (
                                <p className="px-2 pt-1 pb-1 text-[10px] font-semibold tracking-[0.09em] text-[#5b7469] uppercase dark:text-[#9cb9ae]">
                                    Membership requests
                                </p>
                            )}

                            {isStaff && notifications.membershipRequests.map((notification) => {
                                const addressParts = [notification.street_address, notification.barangay_name, notification.city_municipality_name, notification.province_name, notification.region_name]
                                    .filter(Boolean)
                                    .join(', ');

                                return (
                                    <button
                                        key={notification.id}
                                        type="button"
                                        onClick={() => openMembershipRequest(notification.id)}
                                        className="mb-1 rounded-lg border border-border/65 bg-background/70 px-2.5 py-2 text-xs dark:bg-white/5"
                                    >
                                        <div className="mb-0.5 flex items-center justify-between gap-2">
                                            <p className="font-semibold text-foreground">{notification.name}</p>
                                            <span className="rounded-full bg-[#e6f1fb] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#256090] dark:bg-[#1a3142] dark:text-[#a6d4fb]">
                                                member
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground">{notification.email} - {notification.contact_number}</p>
                                        <p className="mt-1 line-clamp-2 text-foreground/85">Address: {addressParts}</p>
                                    </button>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {canViewPasswordRequests && (
                        <button
                            type="button"
                            aria-label="User account control pending requests"
                            title="Open user account control"
                            onClick={openUserAccountControl}
                            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-white/80 text-[#3f5f53] shadow-[0_10px_24px_rgba(38,74,61,0.14)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-white hover:shadow-[0_12px_26px_rgba(38,74,61,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6fc8a1]/65 dark:border-white/20 dark:bg-white/10 dark:text-[#cae7db] dark:hover:bg-white/15 dark:hover:shadow-[0_12px_28px_rgba(3,9,14,0.7)] dark:focus-visible:ring-[#8adfc0]/60"
                        >
                            <KeyRound className="h-4 w-4" />
                            {pendingPasswordCount > 0 && (
                                <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full border border-white/90 bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white shadow-sm dark:border-[#0d1f28]">
                                    {pendingPasswordCount > 99 ? '99+' : pendingPasswordCount}
                                </span>
                            )}
                        </button>
                    )}

                    <AppearanceToggleDropdown className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/65 bg-white/80 p-0 shadow-[0_10px_24px_rgba(38,74,61,0.14)] backdrop-blur dark:border-white/20 dark:bg-white/10" />
                </div>
            </div>
        </header>
    );
}
