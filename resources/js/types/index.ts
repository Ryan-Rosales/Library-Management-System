import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    badgeCount?: number;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    notifications?: {
        passwordChangeRequests: Array<{
            id: number;
            requester_name: string | null;
            requester_email: string;
            requester_role: 'staff' | 'member';
            reason: string | null;
            created_at: string | null;
            seen_at: string | null;
        }>;
        membershipRequests: Array<{
            id: number;
            name: string;
            email: string;
            contact_number: string;
            region_name: string;
            province_name: string | null;
            city_municipality_name: string;
            barangay_name: string;
            street_address: string | null;
            review_outcome: 'approved' | 'rejected' | null;
            review_notes: string | null;
            created_at: string | null;
            seen_at: string | null;
        }>;
        activityNotifications: Array<{
            id: number;
            type: string;
            title: string;
            message: string;
            url: string | null;
            meta?: {
                actor_name?: string;
                actor_role?: 'admin' | 'staff';
                module?: string;
                action?: string;
                subject?: string;
            } | null;
            created_at: string | null;
            seen_at: string | null;
        }>;
        memberNotifications: Array<{
            id: number;
            type: string;
            title: string;
            message: string;
            url: string | null;
            created_at: string | null;
            seen_at: string | null;
        }>;
        membershipPendingCount: number;
        unreadCount: number;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role?: 'admin' | 'staff' | 'member';
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
