import DeleteUser from '@/components/delete-user';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Delete account',
        href: '/settings/delete-account',
    },
];

export default function DeleteAccountPage() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Delete account" />

            <SettingsLayout>
                <div className="min-h-[34rem] rounded-2xl border border-[#d5e7df] bg-white/75 p-6 shadow-sm dark:border-white/12 dark:bg-white/6 md:p-7">
                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
