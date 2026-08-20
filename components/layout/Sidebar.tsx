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
    ShieldCheck,
} from 'lucide-react';

export const navSections = [
    {
        title: 'OVERVIEW',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Clients', href: '/clients', icon: Users },
            { name: 'Projects', href: '/projects', icon: Briefcase },
        ],
    },
    {
        title: 'FINANCE & ASSETS',
        items: [
            { name: 'Invoices', href: '/invoices', icon: FileText },
            { name: 'Revenue', href: '/revenue', icon: TrendingUp },
            { name: 'Design Library', href: '/templates', icon: LayoutTemplate },
            { name: 'Email Templates', href: '/email-templates', icon: Mail },
        ],
    },
    {
        title: 'PREFERENCES',
        items: [
            { name: 'Settings', href: '/settings', icon: Settings },
        ],
    },
];

interface SidebarProps {
    onNavItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavItemClick }) => {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white text-slate-800 flex flex-col border-r border-slate-200/80 shrink-0 h-screen sticky top-0 shadow-xs z-30">
            {/* Brand Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center text-white font-extrabold text-lg tracking-wider shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
                        N
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="font-extrabold text-slate-900 tracking-tight text-base leading-none">
                                NYLEX
                            </h1>
                            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-md">
                                NMS
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold mt-1">Management Console</p>
                    </div>
                </div>
            </div>

            {/* Navigation Groups */}
            <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                {navSections.map((section, idx) => (
                    <div key={idx} className="space-y-1">
                        <h2 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                            {section.title}
                        </h2>
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive =
                                pathname === item.href ||
                                (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onNavItemClick}
                                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${isActive
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-white scale-110' : 'text-slate-400'}`} />
                                    <span>{item.name}</span>
                                    {isActive && (
                                        <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Bottom Profile Badge */}
            <div className="p-3.5 m-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                    NX
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">NYLEX Admin</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        Online Workspace
                    </p>
                </div>
            </div>
        </aside>
    );
};
