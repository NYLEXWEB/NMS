'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, FilePlus, Menu, X, Sparkles, Command } from 'lucide-react';
import { navSections } from './Sidebar';

const titleMap: Record<string, { title: string; subtitle: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Overview of clients, follow-ups, and revenue' },
    '/clients': { title: 'Client Management', subtitle: 'Track leads, follow-ups, and client status' },
    '/projects': { title: 'Project Management', subtitle: 'Track active, pending, and completed projects' },
    '/invoices': { title: 'Invoice History & Billing', subtitle: 'Generate and manage printable PDF invoices' },
    '/revenue': { title: 'Revenue & Reports', subtitle: 'Financial breakdown by payment type and method' },
    '/templates': { title: 'Template Library', subtitle: 'Explore and manage website design templates' },
    '/email-templates': { title: 'Completion Email Generator', subtitle: 'Generate and edit completion emails' },
    '/settings': { title: 'Settings', subtitle: 'Company information & invoice defaults' },
};

export const Header = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Match root path or subpath
    let currentKey = '/dashboard';
    Object.keys(titleMap).forEach((key) => {
        if (pathname === key || (key !== '/dashboard' && pathname?.startsWith(key))) {
            currentKey = key;
        }
    });

    const { title, subtitle } = titleMap[currentKey] || {
        title: 'NYLEX Management System',
        subtitle: 'Internal workspace',
    };

    return (
        <>
            <header className="glass-panel sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-200/80 shadow-xs">
                <div className="flex items-center gap-3">
                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        aria-label="Toggle Navigation Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <div>
                        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                        <p className="text-xs text-slate-400 hidden sm:block font-medium mt-0.5">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Quick Command Hint */}
                    <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/70 border border-slate-200/60 rounded-xl text-xs text-slate-400 font-medium">
                        <Command className="w-3.5 h-3.5 text-slate-400" />
                        <span>K</span>
                        <span className="text-[11px] text-slate-400 ml-1">Quick Console</span>
                    </div>

                    <Link
                        href="/clients?action=new"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all shadow-2xs"
                    >
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span className="hidden sm:inline">Add Client</span>
                        <span className="sm:hidden">Client</span>
                    </Link>
                    <Link
                        href="/invoices/new"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white gradient-brand hover:opacity-95 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FilePlus className="w-4 h-4" />
                        <span className="hidden sm:inline">New Invoice</span>
                        <span className="sm:hidden">Invoice</span>
                    </Link>
                </div>
            </header>

            {/* Mobile Slide-Over Drawer Navigation */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="relative flex-1 max-w-xs w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
                        {/* Drawer Header */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-blue-500/20">
                                    N
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-slate-900 text-sm">NYLEX NMS</h2>
                                    <p className="text-[10px] text-slate-400">Management Console</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation Links */}
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
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${isActive
                                                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                                <span>{item.name}</span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1 font-medium">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                NYLEX Mobile
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">v1.0.0</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
