import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import MemberPasswordReminderDialog from '@/components/member-password-reminder-dialog';
import SystemToaster from '@/components/system-toaster';
import { type BreadcrumbItem } from '@/types';

interface AppLayoutProps {
    children: React.ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <>
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}
        </AppLayoutTemplate>
        <MemberPasswordReminderDialog />
        <SystemToaster />
    </>
);
