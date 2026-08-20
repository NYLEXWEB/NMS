'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users,
    Briefcase,
    TrendingUp,
    Clock,
    Plus,
    FilePlus,
    CalendarClock,
    ChevronRight,
    ArrowUpRight,
    RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dashboard');
            const json = await res.json();
            if (json.success) {
                setStats(json.data);
            } else {
                toast.error('Failed to load dashboard metrics');
            }
        } catch (err) {
            toast.error('Error connecting to system database');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm font-medium">Loading NYLEX Dashboard...</p>
            </div>
        );
    }

    const {
        totalRevenue = 0,
        activeProjectsCount = 0,
        totalClientsCount = 0,
        pendingFollowUpsCount = 0,
        upcomingFollowUps = [],
        recentProjects = [],
    } = stats || {};

    return (
        <div className="space-y-6">
            {/* Quick Action Top Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs">
                <div>
                    <h2 className="text-base font-extrabold text-slate-900">Workspace Overview</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage your clients, project timelines, and real-time revenue stats.
                    </p>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Link
                        href="/clients?action=new"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4 text-blue-600" /> Add Client
                    </Link>
                    <Link
                        href="/invoices/new"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                    >
                        <FilePlus className="w-4 h-4" /> Generate Invoice
                    </Link>
                </div>
            </div>

            {/* Top 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Total Realized Revenue</span>
                        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-extrabold text-slate-900">
                            ₹{totalRevenue.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
                            <ArrowUpRight className="w-3 h-3" /> Realized from payments
                        </p>
                    </div>
                </div>

                {/* Active Projects */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Active Projects</span>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Briefcase className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-extrabold text-slate-900">{activeProjectsCount}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">In progress or pending</p>
                    </div>
                </div>

                {/* Total Clients */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Total Clients</span>
                        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Users className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-extrabold text-slate-900">{totalClientsCount}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Tracked in database</p>
                    </div>
                </div>

                {/* Pending Follow-ups */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <span>Pending Follow-ups</span>
                        <span className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Clock className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-3">
                        <p className="text-2xl font-extrabold text-amber-600">{pendingFollowUpsCount}</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Scheduled client touchpoints</p>
                    </div>
                </div>
            </div>

            {/* Dashboard Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 Columns): Recent Active Projects */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                Active & Recent Projects
                            </h2>
                            <Link
                                href="/projects"
                                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                                View All <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {recentProjects.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                No projects recorded yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-2.5 px-3">Project Name</th>
                                            <th className="py-2.5 px-3">Client</th>
                                            <th className="py-2.5 px-3">Amount</th>
                                            <th className="py-2.5 px-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentProjects.map((p: any) => (
                                            <tr
                                                key={p._id}
                                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                                            >
                                                <td className="py-3 px-3">
                                                    <Link
                                                        href={`/projects/${p._id}`}
                                                        className="font-bold text-slate-900 hover:text-blue-600"
                                                    >
                                                        {p.projectName}
                                                    </Link>
                                                    <div className="text-xs text-slate-400">{p.serviceType}</div>
                                                </td>
                                                <td className="py-3 px-3 text-xs text-slate-700 font-medium">
                                                    {p.clientId?.clientName || 'N/A'}
                                                    <div className="text-slate-400 text-[11px]">
                                                        {p.clientId?.businessName}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-xs font-extrabold text-slate-900">
                                                    ₹{p.projectAmount?.toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <StatusBadge status={p.status} size="sm" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right (1 Column): Upcoming & Overdue Follow-ups */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <CalendarClock className="w-4 h-4 text-amber-500" />
                                Follow-ups Checklist
                            </h2>
                            <Link
                                href="/clients"
                                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                                View Clients <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {upcomingFollowUps.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-xs">
                                No pending follow-ups scheduled!
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingFollowUps.map((c: any) => (
                                    <Link
                                        key={c._id}
                                        href={`/clients/${c._id}`}
                                        className="block p-3 rounded-lg border border-slate-100 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100/70 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-slate-900">{c.clientName}</span>
                                            <StatusBadge status={c.status} size="sm" />
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{c.businessName}</p>
                                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 font-semibold">
                                            <Clock className="w-3 h-3 text-amber-500" />
                                            {c.nextFollowUpDate
                                                ? format(new Date(c.nextFollowUpDate), 'dd MMM yyyy')
                                                : 'Scheduled'}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
