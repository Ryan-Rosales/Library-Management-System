import { Link } from '@inertiajs/react';
import { LoaderCircle, Mail, X, BookOpen, Users, Lock, Zap, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import RoleSelector from './RoleSelector';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

export default function LoginFormPanel({ data, setData, errors, processing, status, canResetPassword, onSubmit }) {
    const [selectedRole, setSelectedRole] = useState('admin');
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    const handleRoleChange = (nextRole) => {
        setSelectedRole(nextRole);
        setData('role', nextRole);
    };

    return (
        <div className="auth-login-shell relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[520px] flex-col justify-center px-2 py-2 sm:px-4 sm:py-2.5 lg:ml-0 lg:mr-auto">
            <div className="auth-login-card page-enter-item relative rounded-[24px] border border-white/70 bg-white/75 p-3 shadow-[0_18px_44px_rgba(39,77,63,0.16)] backdrop-blur-lg dark:border-white/15 dark:bg-[#0d1a1fcc] dark:shadow-[0_24px_60px_rgba(3,9,14,0.6)] sm:p-3.5">
                <AppearanceToggleDropdown className="absolute right-3 top-3 rounded-full border border-[#d7e4de] bg-white/80 shadow-[0_10px_24px_rgba(53,94,79,0.12)] backdrop-blur-sm dark:border-white/20 dark:bg-white/10" />

                <div className="mb-3 page-enter-item" style={{ animationDelay: '90ms' }}>
                    <p className="mb-2 inline-flex rounded-full border border-[#cde6da] bg-[#effaf4] px-2.5 py-1 text-[11px] font-semibold tracking-[0.1em] text-[#327f5d]">
                        LIBRARY PORTAL
                    </p>
                    <h2
                        className="auth-login-title text-[2.05rem] leading-[0.98] font-semibold text-[#1c2a24] dark:text-[#e6fbf2] sm:text-[2.35rem]"
                        style={{ fontFamily: 'Cormorant Garamond, Georgia, Times New Roman, serif' }}
                    >
                        Welcome back
                    </h2>
                    <p className="mt-1 text-xs text-[#667772] dark:text-[#a7bbb3] sm:text-sm">Sign in to your Libraria account</p>
                </div>

                <div className="page-enter-item" style={{ animationDelay: '130ms' }}>
                    <RoleSelector selectedRole={selectedRole} onChange={handleRoleChange} />
                    <p className="mt-1.5 text-center text-[11px] font-semibold tracking-[0.11em] text-[#4f625c] dark:text-[#9cb7ad]">
                        SIGNING IN AS <span className="uppercase text-[#2f7c59] dark:text-[#8fe4c0]">{selectedRole}</span>
                    </p>
                </div>

                <form className="page-enter-item mt-3 space-y-3" style={{ animationDelay: '170ms' }} onSubmit={onSubmit}>
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
                                placeholder="admin@library.ph"
                                className="w-full rounded-2xl border border-[#d4ddd8] bg-white px-3.5 py-2.5 pr-11 text-sm text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                            />
                            <Mail size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8ea19a]" />
                        </div>
                        {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-1 block text-[11px] font-bold tracking-wide text-[#4f625c] dark:text-[#9cb7ad] sm:text-xs">
                            PASSWORD
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type="password"
                                required
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(event) => setData('password', event.target.value)}
                                placeholder="Enter your password"
                                className="w-full rounded-2xl border border-[#d4ddd8] bg-white px-3.5 py-2.5 text-sm text-[#22332c] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-[#94a5a0] hover:border-[#b9cdc3] focus:border-[#53b586] focus:outline-none focus:ring-4 focus:ring-[#d9f4e8] dark:border-white/20 dark:bg-[#112128] dark:text-[#d8efe4] dark:placeholder:text-[#7d988f] dark:hover:border-[#4f7f73] dark:focus:border-[#61c999] dark:focus:ring-[#1f5f4a]/60"
                            />
                        </div>
                        {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                        <label className="inline-flex items-center gap-2 text-[#5a6d67] dark:text-[#9eb5ac]">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(event) => setData('remember', event.target.checked)}
                                className="h-4 w-4 rounded border-[#c2d4cb] text-[#2b8e63] focus:ring-[#2b8e63] dark:border-[#4d6a60]"
                            />
                            Remember me
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="font-semibold text-[#2f7c59] transition hover:text-[#1e5f44] dark:text-[#80ddb7] dark:hover:text-[#a6efd0]"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="mt-1 flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(34,126,92,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(34,126,92,0.45)] dark:shadow-[0_18px_35px_rgba(6,32,25,0.8)] disabled:cursor-not-allowed disabled:bg-[#cbd7d1] disabled:shadow-none"
                    >
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        Sign in
                    </button>

                    {status && <p className="text-center text-sm font-medium text-[#2f7c59]">{status}</p>}
                </form>

                <div className="mt-3 text-center text-xs text-[#6b7571] dark:text-[#9aada6] sm:text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href={route('register')} className="font-semibold text-[#2f7c59] dark:text-[#8fe4c0] hover:underline">
                        Request membership
                    </Link>
                </div>
                <div className="mt-1.5 text-center text-xs text-[#6b7571] dark:text-[#9aada6] sm:text-sm">
                    Butuan City Public Library{' '}
                    <button
                        onClick={() => setShowHelpDialog(true)}
                        className="ml-1 inline-flex items-center gap-1 font-semibold text-[#2f7c59] transition hover:text-[#1e5f44] dark:text-[#8fe4c0] dark:hover:text-[#a6efd0] hover:underline"
                    >
                        <HelpCircle size={14} />
                        Help
                    </button>
                </div>
            </div>

            {/* Help Dialog */}
            {showHelpDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-[24px] border border-white/70 bg-white/95 shadow-[0_20px_60px_rgba(39,77,63,0.25)] backdrop-blur-lg dark:border-white/15 dark:bg-[#0d1a1fdd] dark:shadow-[0_30px_80px_rgba(3,9,14,0.8)] animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-start justify-between border-b border-[#e5f0eb] p-6 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#effaf4] dark:bg-[#1f5f4a]">
                                    <BookOpen className="h-6 w-6 text-[#2f7c59] dark:text-[#8fe4c0]" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-[#1c2a24] dark:text-[#e6fbf2]">
                                        Libraria System
                                    </h2>
                                    <p className="text-xs text-[#667772] dark:text-[#a7bbb3]">Library Management Platform</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHelpDialog(false)}
                                className="rounded-full p-2 text-[#667772] transition hover:bg-[#f0f5f3] dark:text-[#a7bbb3] dark:hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
                            <div>
                                <h3 className="mb-2 text-sm font-semibold text-[#1c2a24] dark:text-[#e6fbf2]">About This System</h3>
                                <p className="text-sm leading-relaxed text-[#4f625c] dark:text-[#b8d1c5]">
                                    Welcome to <span className="font-semibold text-[#2f7c59] dark:text-[#8fe4c0]">Libraria</span>, the comprehensive library management system for Butuan City Public Library. This platform streamlines book catalog management, member services, and administrative operations.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="rounded-lg border border-[#e5f0eb] bg-[#f9fef9] p-4 dark:border-white/10 dark:bg-[#1f5f4a]/20">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-[#2f7c59] dark:text-[#8fe4c0]" />
                                        <h4 className="font-semibold text-[#1c2a24] dark:text-[#e6fbf2]">Members</h4>
                                    </div>
                                    <p className="text-xs text-[#4f625c] dark:text-[#b8d1c5]">
                                        Browse the book catalog, request memberships, and manage your library account.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-[#e5f0eb] bg-[#f9fef9] p-4 dark:border-white/10 dark:bg-[#1f5f4a]/20">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-[#2f7c59] dark:text-[#8fe4c0]" />
                                        <h4 className="font-semibold text-[#1c2a24] dark:text-[#e6fbf2]">Staff</h4>
                                    </div>
                                    <p className="text-xs text-[#4f625c] dark:text-[#b8d1c5]">
                                        Manage membership requests and help members with password resets.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-[#e5f0eb] bg-[#f9fef9] p-4 dark:border-white/10 dark:bg-[#1f5f4a]/20">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-[#2f7c59] dark:text-[#8fe4c0]" />
                                        <h4 className="font-semibold text-[#1c2a24] dark:text-[#e6fbf2]">Admin</h4>
                                    </div>
                                    <p className="text-xs text-[#4f625c] dark:text-[#b8d1c5]">
                                        Full system control including books, users, and staff account management.
                                    </p>
                                </div>

                                <div className="rounded-lg border border-[#e5f0eb] bg-[#f9fef9] p-4 dark:border-white/10 dark:bg-[#1f5f4a]/20">
                                    <div className="mb-2 flex items-center gap-2">
                                        <BookOpen className="h-5 w-5 text-[#2f7c59] dark:text-[#8fe4c0]" />
                                        <h4 className="font-semibold text-[#1c2a24] dark:text-[#e6fbf2]">Features</h4>
                                    </div>
                                    <p className="text-xs text-[#4f625c] dark:text-[#b8d1c5]">
                                        Book catalog, user management, settings, and account control in one place.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-[#1c2a24] dark:text-[#e6fbf2]">Quick Tips</h3>
                                <ul className="space-y-2 text-xs text-[#4f625c] dark:text-[#b8d1c5]">
                                    <li className="flex gap-2">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f7c59] dark:bg-[#8fe4c0] mt-1 flex-shrink-0"></span>
                                        <span>Select your role (Admin, Staff, or Member) before signing in</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f7c59] dark:bg-[#8fe4c0] mt-1 flex-shrink-0"></span>
                                        <span>Use your email address and password to sign in</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f7c59] dark:bg-[#8fe4c0] mt-1 flex-shrink-0"></span>
                                        <span>Check "Remember me" to stay signed in on this device</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2f7c59] dark:bg-[#8fe4c0] mt-1 flex-shrink-0"></span>
                                        <span>If you're a new member, click "Request membership" to apply</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-lg bg-[#effaf4] p-4 dark:bg-[#1f5f4a]/30">
                                <p className="text-xs font-semibold text-[#2f7c59] dark:text-[#8fe4c0]">
                                    📧 Need Help? Contact the Butuan City Public Library for assistance.
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-[#e5f0eb] p-4 dark:border-white/10">
                            <button
                                onClick={() => setShowHelpDialog(false)}
                                className="w-full rounded-lg bg-[linear-gradient(90deg,#2fa06f_0%,#2085c1_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_16px_rgba(34,126,92,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(34,126,92,0.35)] dark:shadow-[0_12px_24px_rgba(6,32,25,0.6)]"
                            >
                                Got it, thanks!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
