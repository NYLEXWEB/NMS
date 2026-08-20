'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Plus, FilePlus, Menu, X, Sparkles } from 'lucide-react';
import { navItems } from './Sidebar';

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
            <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        aria-label="Toggle Navigation Menu"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <div>
                        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
                        <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/clients?action=new"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span className="hidden sm:inline">Add Client</span>
                        <span className="sm:hidden">Client</span>
                    </Link>
                    <Link
                        href="/invoices/new"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
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
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
                                    N
                                </div>
                                <div>
                                    <h2 className="font-extrabold text-slate-900 text-sm">NYLEX NMS</h2>
                                    <p className="text-[10px] text-slate-400">Management System</p>
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
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${isActive
                                                ? 'bg-blue-600 text-white font-bold'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1">
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
