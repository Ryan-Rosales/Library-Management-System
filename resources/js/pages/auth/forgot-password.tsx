import { Head, Link, useForm } from '@inertiajs/react';
import { BriefcaseBusiness, LoaderCircle, Mail, UserRound } from 'lucide-react';
import type { FormEventHandler } from 'react';

import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import LibraryBrandPanel from '@/components/auth/LibraryBrandPanel';
import InputError from '@/components/input-error';
import LibraryAuthLayout from '@/layouts/auth/LibraryAuthLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        requester_role: 'member',
        reason: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <>
            <Head title="Forgot password">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Manrope:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
                <style>{`body { font-family: 'Manrope', ui-sans-serif, system-ui, sans-serif; }`}</style>
            </Head>

            <LibraryAuthLayout
                leftPanel={<LibraryBrandPanel />}
                formPanel={
                    <div className="auth-login-shell relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[520px] flex-col justify-center px-2 py-2 sm:px-4 sm:py-2.5 lg:ml-0 lg:mr-auto">
                        <div className="auth-login-card page-enter-item relative rounded-[24px] border border-white/70 bg-white/75 p-3 shadow-[0_18px_44px_rgba(39,77,63,0.16)] backdrop-blur-lg dark:border-white/15 dark:bg-[#0d1a1fcc] dark:shadow-[0_24px_60px_rgba(3,9,14,0.6)] sm:p-3.5">
                            <AppearanceToggleDropdown className="absolute right-3 top-3 rounded-full border border-[#d7e4de] bg-white/80 shadow-[0_10px_24px_rgba(53,94,79,0.12)] backdrop-blur-sm dark:border-white/20 dark:bg-white/10" />

                            <div className="mb-3 page-enter-item" style={{ animationDelay: '90ms' }}>
                                <p className="mb-2 inline-flex rounded-full border border-[#cde6da] bg-[#effaf4] px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] text-[#327f5d]">
                                    PASSWORD HELP
                                </p>
                                <h2
                                    className="auth-login-title text-[2.05rem] leading-[0.98] font-semibold text-[#1c2a24] dark:text-[#e6fbf2] sm:text-[2.35rem]"
                                    style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                                >
                                    Request password change
                                </h2>
                                <p className="mt-1 text-xs text-[#667772] dark:text-[#a7bbb3] sm:text-sm">
                                    Submit your role and reason so your request can be reviewed by the right team.
                                </p>
                            </div>

                            {status && (
                                <p className="mb-3 rounded-xl border border-[#b9e8ce] bg-[#edfbf3] px-3 py-2 text-center text-xs font-semibold text-[#2f7c59] dark:border-[#3e7f64] dark:bg-[#173229] dark:text-[#9de8c8]">
                                    {status}
                                </p>
                            )}

                            <form className="page-enter-item mt-3 space-y-3" style={{ animationDelay: '170ms' }} onSubmit={submit}>
                                <div>
                                    <label htmlFor="email" className="mb-1 block text-[11px] font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad] sm:text-xs">
                                        EMAIL ADDRESS
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            autoFocus
                                            autoComplete="email"
                                            value={data.email}
                                            onChange={(event) => setData('email', event.target.value)}
                                            placeholder="member@library.ph"
                                            className="w-full rounded-2xl border border-[#d4ddd8] bg-white px-3.5 py-2.5 pr-11 text-sm text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                                        />
                                        <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8ea19a]" />
                                    </div>
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <label className="mb-1 block text-[11px] font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad] sm:text-xs">I AM A</label>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => setData('requester_role', 'member')}
                                            className={`group rounded-2xl border p-2.5 text-center transition-all duration-300 hover:-translate-y-0.5 ${
                                                data.requester_role === 'member'
                                                    ? 'border-[#4eb889]/60 bg-[linear-gradient(180deg,#ecfff5_0%,#dcf9eb_100%)] text-[#1f6a49] shadow-[0_12px_24px_rgba(54,145,100,0.2)] dark:border-[#75d6ac]/60 dark:bg-[linear-gradient(180deg,#10352c_0%,#123e32_100%)] dark:text-[#9de8c8]'
                                                    : 'border-[#d9e1dd] bg-white/80 text-[#65706b] shadow-[0_8px_20px_rgba(118,133,126,0.08)] hover:border-[#a7cbb9] hover:shadow-[0_14px_28px_rgba(118,133,126,0.16)] dark:border-white/15 dark:bg-white/5 dark:text-[#9fb5ac] dark:hover:border-[#6b9d8a] dark:hover:bg-white/10 dark:hover:shadow-[0_14px_28px_rgba(2,14,14,0.35)]'
                                            }`}
                                        >
                                            <span
                                                className={`mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-lg transition ${
                                                    data.requester_role === 'member'
                                                        ? 'bg-[#d8f5e7] text-[#257653] dark:bg-[#1d4a3d] dark:text-[#9feecb]'
                                                        : 'bg-[#eef4f0] text-[#6a7771] group-hover:bg-[#e4f2ea] group-hover:text-[#2f7a57] dark:bg-[#1a2930] dark:text-[#89a099] dark:group-hover:bg-[#21353a] dark:group-hover:text-[#9de4c4]'
                                                }`}
                                            >
                                                <UserRound size={14} />
                                            </span>
                                            <span className="text-sm font-semibold">Member</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('requester_role', 'staff')}
                                            className={`group rounded-2xl border p-2.5 text-center transition-all duration-300 hover:-translate-y-0.5 ${
                                                data.requester_role === 'staff'
                                                    ? 'border-[#4eb889]/60 bg-[linear-gradient(180deg,#ecfff5_0%,#dcf9eb_100%)] text-[#1f6a49] shadow-[0_12px_24px_rgba(54,145,100,0.2)] dark:border-[#75d6ac]/60 dark:bg-[linear-gradient(180deg,#10352c_0%,#123e32_100%)] dark:text-[#9de8c8]'
                                                    : 'border-[#d9e1dd] bg-white/80 text-[#65706b] shadow-[0_8px_20px_rgba(118,133,126,0.08)] hover:border-[#a7cbb9] hover:shadow-[0_14px_28px_rgba(118,133,126,0.16)] dark:border-white/15 dark:bg-white/5 dark:text-[#9fb5ac] dark:hover:border-[#6b9d8a] dark:hover:bg-white/10 dark:hover:shadow-[0_14px_28px_rgba(2,14,14,0.35)]'
                                            }`}
                                        >
                                            <span
                                                className={`mx-auto mb-1.5 grid h-7 w-7 place-items-center rounded-lg transition ${
                                                    data.requester_role === 'staff'
                                                        ? 'bg-[#d8f5e7] text-[#257653] dark:bg-[#1d4a3d] dark:text-[#9feecb]'
                                                        : 'bg-[#eef4f0] text-[#6a7771] group-hover:bg-[#e4f2ea] group-hover:text-[#2f7a57] dark:bg-[#1a2930] dark:text-[#89a099] dark:group-hover:bg-[#21353a] dark:group-hover:text-[#9de4c4]'
                                                }`}
                                            >
                                                <BriefcaseBusiness size={14} />
                                            </span>
                                            <span className="text-sm font-semibold">Staff</span>
                                        </button>
                                    </div>
                                    <InputError message={errors.requester_role} />
                                </div>

                                <div>
                                    <label htmlFor="reason" className="mb-1 block text-[11px] font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad] sm:text-xs">
                                        REASON {data.requester_role === 'staff' ? '(REQUIRED)' : '(OPTIONAL)'}
                                    </label>
                                    <textarea
                                        id="reason"
                                        name="reason"
                                        value={data.reason}
                                        onChange={(event) => setData('reason', event.target.value)}
                                        className="min-h-24 w-full rounded-2xl border border-[#d4ddd8] bg-white px-3.5 py-2.5 text-sm text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                                        placeholder={
                                            data.requester_role === 'staff'
                                                ? 'State why your password needs to be changed.'
                                                : 'Add details so staff can verify and process your request faster.'
                                        }
                                    />
                                    <InputError message={errors.reason} />
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-1 flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(34,126,92,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(34,126,92,0.45)] dark:shadow-[0_18px_35px_rgba(6,32,25,0.8)] disabled:cursor-not-allowed disabled:bg-[#cbd7d1] disabled:shadow-none"
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit password request
                                </button>
                            </form>

                            <div className="mt-3 text-center text-xs text-[#6b7571] dark:text-[#9aada6] sm:text-sm">
                                Remembered your password?{' '}
                                <Link href={route('login')} className="font-semibold text-[#2f7c59] dark:text-[#8fe4c0] hover:underline">
                                    Return to login
                                </Link>
                            </div>
                        </div>
                    </div>
                }
            />
        </>
    );
}
