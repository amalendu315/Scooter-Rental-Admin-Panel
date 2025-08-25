'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    AlertCircle,
    BarChart2,
    Bike,
    CreditCard,
    FileText,
    LayoutDashboard,
    Settings,
    Users,
    Users2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

const ZapGoLogo = () => (
    <div className="flex items-center gap-2 px-4">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 text-primary"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
        <span className="text-xl font-bold font-headline">ZapGo Admin</span>
    </div>
);

const NavItem = ({ href, icon, children }: { href: string; icon: ReactNode; children: ReactNode }) => {
    const pathname = usePathname();
    const isActive = pathname.startsWith(href);
    return (
        <Link
            href={href}
            className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-muted text-primary'
            )}
        >
            {icon}
            {children}
        </Link>
    );
};


export function Sidebar() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'ADMIN';

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: '/riders', label: 'Riders', icon: <Users2 className="h-4 w-4" /> },
        { href: '/vehicles', label: 'Vehicles', icon: <Bike className="h-4 w-4" /> },
        { href: '/rentals', label: 'Rentals', icon: <FileText className="h-4 w-4" /> },
        { href: '/payments', label: 'Payments', icon: <CreditCard className="h-4 w-4" /> },
        { href: '/alerts', label: 'Alerts', icon: <AlertCircle className="h-4 w-4" /> },
        { href: '/reports', label: 'Reports', icon: <BarChart2 className="h-4 w-4" /> },
    ];

    const adminLinks = [
        { href: '/staff', label: 'Staff', icon: <Users className="h-4 w-4" /> },
        { href: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    ];

    return (
        <div className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-16 items-center border-b px-4 lg:h-[68px] lg:px-6">
                    <ZapGoLogo />
                </div>
                <div className="flex-1">
                    <nav className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
                        {navLinks.map((link) => (
                            <NavItem key={link.href} href={link.href} icon={link.icon}>{link.label}</NavItem>
                        ))}
                        {isAdmin && (
                            <>
                                <hr className="my-2"/>
                                {adminLinks.map((link) => (
                                    <NavItem key={link.href} href={link.href} icon={link.icon}>{link.label}</NavItem>
                                ))}
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
}
