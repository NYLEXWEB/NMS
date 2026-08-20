'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    FileText,
    TrendingUp,
    LayoutTemplate,
    Mail,
    Settings,
    Sparkles,
} from 'lucide-react';

export const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Revenue', href: '/revenue', icon: TrendingUp },
    { name: 'Templates', href: '/templates', icon: LayoutTemplate },
    { name: 'Email Templates', href: '/email-templates', icon: Mail },
    { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
    onNavItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavItemClick }) => {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200 shrink-0 h-screen sticky top-0">
            {/* Brand Header */}
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold tracking-wider shadow-xs">
                    N
                </div>
                <div>
                    <h1 className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">
                        NYLEX NMS
                    </h1>
                    <p className="text-[11px] text-slate-500 font-medium">Management System</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={onNavItemClick}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Internal Tool Footer Tag */}
            <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    NYLEX Internal
                </span>
                <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
            </div>
        </aside>
    );
};
