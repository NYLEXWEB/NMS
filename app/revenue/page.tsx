'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import {
    TrendingUp,
    Download,
    CreditCard,
    DollarSign,
    PieChart as PieChartIcon,
    BarChart3,
    Calendar,
    Plus,
    Filter,
    RefreshCw,
    Building,
    CheckCircle2,
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function RevenuePage() {
    const [data, setData] = useState<any>(null);
    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State for Manual Payment Entry
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        clientId: '',
        projectId: '',
        amount: '',
        paymentType: 'Advance',
        paymentMethod: 'UPI',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
    });

    const fetchRevenueData = async () => {
        setLoading(true);
        try {
            const [revRes, clientRes, projRes] = await Promise.all([
                fetch('/api/revenue'),
                fetch('/api/clients'),
                fetch('/api/projects'),
            ]);

            const revJson = await revRes.json();
            const clientJson = await clientRes.json();
            const projJson = await projRes.json();

            if (revJson.success) setData(revJson.data);
            if (clientJson.success) setClients(clientJson.data);
            if (projJson.success) setProjects(projJson.data);
        } catch (err) {
            toast.error('Failed to load revenue report');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRevenueData();
    }, []);

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentForm.clientId || !paymentForm.projectId || !paymentForm.amount) {
            toast.error('Client, Project, and Amount are required');
            return;
        }

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...paymentForm,
                    amount: Number(paymentForm.amount),
                }),
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Payment recorded successfully!');
                setIsModalOpen(false);
                setPaymentForm({
                    clientId: '',
                    projectId: '',
                    amount: '',
                    paymentType: 'Advance',
                    paymentMethod: 'UPI',
                    date: format(new Date(), 'yyyy-MM-dd'),
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
                <p className="text-sm font-semibold">Calculating Revenue Analytics...</p>
            </div>
        );
    }

    const {
        totalRevenue = 0,
        totalAdvance = 0,
        totalBalance = 0,
        totalComplete = 0,
        byType = [],
        byMethod = [],
        paymentsHistory = [],
    } = data || {};

    const COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

    return (
        <div className="space-y-6">
            {/* Top Action Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" /> Revenue & Financial Analytics
                    </h1>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Real-time breakdown of advance deposits, balance payments, and payment channel distribution.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus className="w-4 h-4" /> Record Payment
                </button>
            </div>

            {/* Top 4 Financial Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Realized Revenue
                        </span>
                        <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <TrendingUp className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 mt-3 tracking-tight">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Sum of verified transactions</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Upfront Advances
                        </span>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <CreditCard className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-blue-600 mt-3 tracking-tight">
                        ₹{(totalAdvance || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Initial project deposits</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Balance Payments
                        </span>
                        <span className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                            <DollarSign className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-purple-600 mt-3 tracking-tight">
                        ₹{(totalBalance || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Milestone & final settlements</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Complete Payments
                        </span>
                        <span className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                            <CheckCircle2 className="w-4 h-4" />
                        </span>
                    </div>
                    <p className="text-2xl font-extrabold text-amber-600 mt-3 tracking-tight">
                        ₹{(totalComplete || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Single upfront settlements</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue by Type */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-blue-600" /> Revenue Distribution by Type
                    </h3>

                    {byType.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium">
                            No payment category data available.
                        </div>
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byType}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {byType.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(val: any) => [`₹${(Number(val) || 0).toLocaleString('en-IN')}`, 'Amount']}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Revenue by Method */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">
                        Payment Channel Breakdown (Method)
                    </h3>

                    {byMethod.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-slate-400 text-xs font-medium">
                            No payment method data available.
                        </div>
                    ) : (
                        <div className="space-y-4 pt-2">
                            {byMethod.map((tb: any, idx: number) => {
                                const percentage = totalRevenue > 0 ? Math.round((tb.value / totalRevenue) * 100) : 0;
                                return (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-slate-700">{tb.name}</span>
                                            <span className="text-slate-900">
                                                ₹{tb.value.toLocaleString('en-IN')}{' '}
                                                <span className="text-slate-400 font-normal">({percentage}%)</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Payments History Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Recent Transactions History</h3>
                    <span className="text-xs text-slate-400 font-medium">
                        Showing last {paymentsHistory.length} payments
                    </span>
                </div>

                {paymentsHistory.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-xs font-medium">
                        No transactions recorded in database.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4">Project</th>
                                    <th className="py-3 px-4">Type</th>
                                    <th className="py-3 px-4">Method</th>
                                    <th className="py-3 px-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paymentsHistory.map((pm: any) => (
                                    <tr key={pm._id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="py-3.5 px-4 text-xs font-bold text-slate-900">
                                            {format(new Date(pm.date), 'dd MMM yyyy')}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                                            {pm.clientId?.clientName || 'N/A'}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                                            {pm.projectId?.projectName || 'Custom Invoice'}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                                            {pm.paymentType}
                                        </td>
                                        <td className="py-3.5 px-4 text-xs text-slate-500 font-medium">
                                            {pm.paymentMethod}
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 text-xs">
                                            ₹{pm.amount?.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Record Payment Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Record Direct Payment"
            >
                <form onSubmit={handleRecordPayment} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Associated Client *
                        </label>
                        <select
                            required
                            value={paymentForm.clientId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, clientId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold"
                        >
                            <option value="">Select a client...</option>
                            {clients.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.clientName} ({c.businessName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Associated Project *
                        </label>
                        <select
                            required
                            value={paymentForm.projectId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, projectId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold"
                        >
                            <option value="">Select a project...</option>
                            {projects
                                .filter((p) => !paymentForm.clientId || (p.clientId?._id || p.clientId) === paymentForm.clientId)
                                .map((p) => (
                                    <option key={p._id} value={p._id}>
                                        {p.projectName}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Amount Received (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                min="1"
                                placeholder="e.g. 5000"
                                value={paymentForm.amount}
                                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Payment Category
                            </label>
                            <select
                                value={paymentForm.paymentType}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold"
                            >
                                <option value="Advance">Advance</option>
                                <option value="Balance">Balance</option>
                                <option value="Complete">Complete</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Payment Method
                            </label>
                            <select
                                value={paymentForm.paymentMethod}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold"
                            >
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Payment Date
                            </label>
                            <input
                                type="date"
                                value={paymentForm.date}
                                onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Notes / Reference
                        </label>
                        <textarea
                            rows={2}
                            placeholder="e.g. GPay Transaction Ref: 39482..."
                            value={paymentForm.notes}
                            onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                        >
                            Save Transaction
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
