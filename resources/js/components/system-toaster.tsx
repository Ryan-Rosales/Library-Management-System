import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

type ToastMessage = {
    id: number;
    type: ToastType;
    message: string;
};

type FlashPayload = {
    success?: string;
    error?: string;
    info?: string;
};

type SharedPageProps = {
    flash?: FlashPayload;
    errors?: Record<string, string>;
};

type RouterStartDetail = {
    visit?: {
        method?: string;
    };
};

const toneClass: Record<ToastType, string> = {
    success: 'border-[#7bd7b1] bg-[linear-gradient(135deg,#ecfcf4_0%,#e8f5ff_100%)] text-[#225c45] dark:border-[#3e856a] dark:bg-[linear-gradient(135deg,#122e27_0%,#142632_100%)] dark:text-[#bdecd9]',
    error: 'border-[#e5a5a5] bg-[linear-gradient(135deg,#fff3f3_0%,#ffeaea_100%)] text-[#7f2f2f] dark:border-[#7f4141] dark:bg-[linear-gradient(135deg,#361f21_0%,#2f1a1f_100%)] dark:text-[#f0c0c0]',
    info: 'border-[#a9cbea] bg-[linear-gradient(135deg,#f2f8ff_0%,#eef4ff_100%)] text-[#2e4d72] dark:border-[#47688c] dark:bg-[linear-gradient(135deg,#1a2738_0%,#172432_100%)] dark:text-[#bcd4f0]',
};

const iconMap = {
    success: CheckCircle2,
    error: TriangleAlert,
    info: Info,
};

const DYNAMIC_ACTION_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export function emitSystemToast(type: ToastType, message: string) {
    window.dispatchEvent(new CustomEvent('app:toast', { detail: { type, message } }));
}

export default function SystemToaster() {
    const { flash = {} } = usePage<SharedPageProps>().props;
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const nextId = useRef(1);
    const lastVisitMethod = useRef('get');
    const seenFlash = useRef<{ success?: string; error?: string; info?: string }>({});

    const addToast = (type: ToastType, message?: string) => {
        if (!message) {
            return;
        }

        const id = nextId.current++;
        setToasts((current) => [...current, { id, type, message }]);

        window.setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3600);
    };

    const latestFlash = useMemo(() => ({
        success: flash.success,
        error: flash.error,
        info: flash.info,
    }), [flash.success, flash.error, flash.info]);

    useEffect(() => {
        if (latestFlash.success && latestFlash.success !== seenFlash.current.success) {
            addToast('success', latestFlash.success);
            seenFlash.current.success = latestFlash.success;
        }
        if (latestFlash.error && latestFlash.error !== seenFlash.current.error) {
            addToast('error', latestFlash.error);
            seenFlash.current.error = latestFlash.error;
        }
        if (latestFlash.info && latestFlash.info !== seenFlash.current.info) {
            addToast('info', latestFlash.info);
            seenFlash.current.info = latestFlash.info;
        }
    }, [latestFlash]);

    useEffect(() => {
        const removeStart = router.on('start', (event) => {
            const startDetail = (event as Event & { detail?: RouterStartDetail }).detail;
            lastVisitMethod.current = (startDetail?.visit?.method ?? 'get').toLowerCase();
        });

        const removeSuccess = router.on('success', (event) => {
            const visitMethod = lastVisitMethod.current;
            if (!DYNAMIC_ACTION_METHODS.has(visitMethod)) {
                return;
            }

            const pageProps = (event.detail.page.props ?? {}) as SharedPageProps;
            const hasErrors = !!pageProps.errors && Object.keys(pageProps.errors).length > 0;
            const hasFlashSuccess = !!pageProps.flash?.success;

            if (!hasErrors && !hasFlashSuccess) {
                addToast('success', 'Action completed successfully.');
            }
        });

        const removeInvalid = router.on('invalid', () => {
            addToast('error', 'Action failed. Please check the form and try again.');
        });

        const handleManualToast = (event: Event) => {
            const customEvent = event as CustomEvent<{ type: ToastType; message: string }>;
            const toastType = customEvent.detail?.type ?? 'info';
            const toastMessage = customEvent.detail?.message;
            addToast(toastType, toastMessage);
        };

        window.addEventListener('app:toast', handleManualToast);

        return () => {
            removeStart();
            removeSuccess();
            removeInvalid();
            window.removeEventListener('app:toast', handleManualToast);
        };
    }, []);

    if (toasts.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed left-1/2 top-5 z-[100] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-2 sm:top-6">
            {toasts.map((toast) => {
                const Icon = iconMap[toast.type];

                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_14px_34px_rgba(25,54,46,0.18)] backdrop-blur ${toneClass[toast.type]}`}
                    >
                        <div className="flex items-start gap-2.5">
                            <Icon size={16} className="mt-0.5 shrink-0" />
                            <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
                            <button
                                type="button"
                                aria-label="Dismiss notification"
                                className="ml-auto shrink-0 rounded-md p-0.5 opacity-70 transition hover:bg-black/6 hover:opacity-100 dark:hover:bg-white/8"
                                onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
