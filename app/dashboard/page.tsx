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
    Sparkles,
    CheckCircle2,
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
                <p className="text-sm font-semibold">Loading NYLEX Dashboard...</p>
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
            {/* Workspace Welcome Banner */}
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-200/80 shadow-xs">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-blue-200/60">
                            <Sparkles className="w-3 h-3 text-blue-600" /> NYLEX Executive Workspace
                        </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back to Console
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1 max-w-xl leading-relaxed">
                        Track real-time financial metrics, monitor client follow-up schedules, and manage live project deliverables effortlessly.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
                    <Link
                        href="/clients?action=new"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all shadow-2xs"
                    >
                        <Plus className="w-4 h-4 text-blue-600" /> Add Client
                    </Link>
                    <Link
                        href="/invoices/new"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white gradient-brand hover:opacity-95 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <FilePlus className="w-4 h-4" /> New Invoice
                    </Link>
                </div>
            </div>

            {/* Top 4 Premium Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Realized Revenue
                        </span>
                        <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-2xs">
                            <TrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            ₹{totalRevenue.toLocaleString('en-IN')}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-0.5 border border-emerald-200/60">
                                <ArrowUpRight className="w-3 h-3" /> Verifiable Payments
                            </span>
                        </div>
                    </div>
                </div>

                {/* Active Projects */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Active Projects
                        </span>
                        <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-2xs">
                            <Briefcase className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {activeProjectsCount}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-2">
                            In design & active development
                        </p>
                    </div>
                </div>

                {/* Total Clients */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Clients
                        </span>
                        <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-2xs">
                            <Users className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {totalClientsCount}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-2">
                            Registered client accounts
                        </p>
                    </div>
                </div>

                {/* Pending Follow-ups */}
                <div className="glass-card rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Pending Follow-ups
                        </span>
                        <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shadow-2xs">
                            <Clock className="w-4 h-4" />
                        </span>
                    </div>
                    <div className="mt-4">
                        <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
                            {pendingFollowUpsCount}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-2">
                            Scheduled client touchpoints
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 Columns): Active & Recent Projects Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-blue-600" /> Active & Recent Projects
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Current progress status across client deliverables
                                </p>
                            </div>
                            <Link
                                href="/projects"
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors"
                            >
                                View All <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {recentProjects.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-xs font-medium">
                                No active projects recorded.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <tr>
                                            <th className="py-3 px-4">Project / Service</th>
                                            <th className="py-3 px-4">Client</th>
                                            <th className="py-3 px-4">Value</th>
                                            <th className="py-3 px-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentProjects.map((p: any) => (
                                            <tr
                                                key={p._id}
                                                className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                                            >
                                                <td className="py-3.5 px-4">
                                                    <Link
                                                        href={`/projects/${p._id}`}
                                                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                                                    >
                                                        {p.projectName}
                                                    </Link>
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5">{p.serviceType}</div>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                                                    {p.clientId?.clientName || 'N/A'}
                                                    <div className="text-slate-400 text-[11px] font-normal">
                                                        {p.clientId?.businessName}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-xs font-extrabold text-slate-900">
                                                    ₹{p.projectAmount?.toLocaleString('en-IN')}
                                                </td>
                                                <td className="py-3.5 px-4">
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
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                                    <CalendarClock className="w-4 h-4 text-amber-500" /> Scheduled Follow-ups
                                </h3>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Client touchpoints requiring attention
                                </p>
                            </div>
                            <Link
                                href="/clients"
                                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                                All <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {upcomingFollowUps.length === 0 ? (
                            <div className="p-10 text-center space-y-2">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                                <p className="text-xs font-semibold text-slate-600">All follow-ups completed!</p>
                                <p className="text-[11px] text-slate-400">No scheduled touchpoints for today.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingFollowUps.map((c: any) => (
                                    <Link
                                        key={c._id}
                                        href={`/clients/${c._id}`}
                                        className="block p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-all shadow-2xs"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-extrabold text-xs text-slate-900">{c.clientName}</span>
                                            <StatusBadge status={c.status} size="sm" />
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{c.businessName}</p>
                                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-700 font-bold bg-amber-50 w-fit px-2 py-0.5 rounded-md border border-amber-200/60">
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
