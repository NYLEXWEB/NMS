'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    TrendingUp,
    IndianRupee,
    CreditCard,
    PieChart as PieIcon,
    Calendar,
    Plus,
    RefreshCw,
    ArrowUpRight,
    Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Modal } from '@/components/ui/Modal';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export default function RevenuePage() {
    const [data, setData] = useState<any>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Log Payment Modal
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        clientId: '',
        projectId: '',
        amount: '',
        paymentType: 'Advance',
        paymentMethod: 'UPI',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            const [rRes, cRes, pRes] = await Promise.all([
                fetch('/api/revenue'),
                fetch('/api/clients'),
                fetch('/api/projects'),
            ]);

            const rJson = await rRes.json();
            const cJson = await cRes.json();
            const pJson = await pRes.json();

            if (rJson.success) setData(rJson.data);
            if (cJson.success) setClients(cJson.data);
            if (pJson.success) setProjects(pJson.data);
        } catch (err) {
            toast.error('Failed to load revenue analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
    }, []);

    const handleLogPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentForm.clientId || !paymentForm.amount) {
            toast.error('Client and Amount are required.');
            return;
        }

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentForm),
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Payment logged successfully');
                setIsPaymentModalOpen(false);
                setPaymentForm({
                    clientId: '',
                    projectId: '',
                    amount: '',
                    paymentType: 'Advance',
                    paymentMethod: 'UPI',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                });
                fetchRevenueData();
            } else {
                toast.error(json.error || 'Failed to log payment');
            }
        } catch (err) {
            toast.error('Error logging payment');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Calculating revenue analytics...</p>
            </div>
        );
    }

    const totalRevenue = data?.totalRevenue || 0;
    const thisMonthRevenue = data?.thisMonthRevenue || 0;
    const thisYearRevenue = data?.thisYearRevenue || 0;
    const totalPendingAmount = data?.totalPendingAmount || 0;

    const advanceObj = data?.byType?.find((t: any) => t.name === 'Advance Payment');
    const balanceObj = data?.byType?.find((t: any) => t.name === 'Balance Payment');

    const totalAdvance = advanceObj?.amount || 0;
    const totalBalance = balanceObj?.amount || 0;

    const methodBreakdown = data?.byMethod || [];
    const typeBreakdown = data?.byType || [];
    const payments = data?.recentPayments || [];

    const chartColors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Revenue & Payment Analytics
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Strictly computed from verified actual payment transactions
                    </p>
                </div>

                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                    <Plus className="w-4 h-4" /> Log Direct Payment
                </button>
            </div>

            {/* Top Financial Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                        <span>Total Realized Revenue</span>
                        <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-md">
                            <IndianRupee className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                        ₹{(totalRevenue || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                        <ArrowUpRight className="w-3 h-3" /> Actual payments received
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                        <span>Total Advance Payments</span>
                        <span className="p-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-md">
                            <CreditCard className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
                        ₹{(totalAdvance || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Upfront initial project deposits</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                        <span>Total Balance Payments</span>
                        <span className="p-1.5 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded-md">
                            <TrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
                        ₹{(totalBalance || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Final project completion payments</p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                        <span>Total Pending Receivables</span>
                        <span className="p-1.5 bg-amber-50 dark:bg-amber-950 text-amber-600 rounded-md">
                            <Clock className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                        ₹{(totalPendingAmount || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Uncollected project balances</p>
                </div>
            </div>

            {/* Analytics Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Method Bar Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-blue-500" /> Revenue by Payment Method
                    </h3>

                    {methodBreakdown.length === 0 ? (
                        <p className="text-xs text-slate-400 py-8 text-center">No payment methods recorded yet.</p>
                    ) : (
                        <div className="h-56 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={methodBreakdown} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <XAxis type="number" fontSize={10} tickFormatter={(v) => `₹${v}`} />
                                    <YAxis type="category" dataKey="name" fontSize={10} width={90} />
                                    <Tooltip formatter={(value: any) => [`₹${Number(value || 0).toLocaleString('en-IN')}`, 'Revenue']} />
                                    <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                                        {methodBreakdown.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Payment Stage Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Payment Stage Distribution
                    </h3>

                    <div className="space-y-4 pt-2">
                        {typeBreakdown.map((tb: any) => {
                            const amt = tb.amount || 0;
                            const percentage = totalRevenue > 0 ? Math.round((amt / totalRevenue) * 100) : 0;
                            return (
                                <div key={tb.name} className="space-y-1">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="text-slate-700 dark:text-slate-300">{tb.name}</span>
                                        <span className="text-slate-900 dark:text-white">
                                            ₹{amt.toLocaleString('en-IN')} ({percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Payment Transactions Log Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        All Recorded Transactions ({payments.length})
                    </h3>
                </div>

                {payments.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                        No payments recorded yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4">Project</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Method</th>
                                    <th className="py-3 px-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {payments.map((pm: any) => (
                                    <tr key={pm._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 text-xs text-slate-500">
                                            {pm.date ? format(new Date(pm.date), 'dd MMM yyyy') : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            {pm.clientId?.clientName || 'N/A'}
                                            <p className="text-[11px] text-slate-400 font-normal">
                                                {pm.clientId?.businessName}
                                            </p>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">
                                            {pm.projectId?.projectName || 'Direct / N/A'}
                                        </td>
                                        <td className="py-3 px-4 text-xs font-medium">{pm.paymentType}</td>
                                        <td className="py-3 px-4 text-xs text-slate-500">{pm.paymentMethod}</td>
                                        <td className="py-3 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                                            ₹{(pm.amount || 0).toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Log Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Log Direct Payment"
            >
                <form onSubmit={handleLogPayment} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Select Client *
                        </label>
                        <select
                            required
                            value={paymentForm.clientId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, clientId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        >
                            <option value="">-- Select Client --</option>
                            {clients.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.clientName} ({c.businessName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Select Project (Optional)
                        </label>
                        <select
                            value={paymentForm.projectId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, projectId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        >
                            <option value="">None / Direct Payment</option>
                            {projects
                                .filter((p) => !paymentForm.clientId || (p.clientId?._id || p.clientId) === paymentForm.clientId)
                                .map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.projectName}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Payment Amount (₹) *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 10000"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Payment Type
                            </label>
                            <select
                                value={paymentForm.paymentType}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            >
                                <option value="Advance">Advance</option>
                                <option value="Balance">Balance</option>
                                <option value="Complete">Complete</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Payment Method
                            </label>
                            <select
                                value={paymentForm.paymentMethod}
                                onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            >
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Payment Date
                        </label>
                        <input
                            type="date"
                            value={paymentForm.date}
                            onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                        >
                            Record Payment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
