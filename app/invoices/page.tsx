'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    FileText,
    Search,
    FilePlus,
    Filter,
    Building,
    Calendar,
    IndianRupee,
    Printer,
    Download,
    Eye,
    RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';

function InvoicesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || 'All';

    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState(currentSearch);
    const [statusFilter, setStatusFilter] = useState(currentStatus);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (statusFilter && statusFilter !== 'All') query.append('status', statusFilter);

            const res = await fetch(`/api/invoices?${query.toString()}`);
            const json = await res.json();

            if (json.success) {
                setInvoices(json.data);
            } else {
                toast.error(json.error || 'Failed to load invoices');
            }
        } catch (err) {
            toast.error('Error connecting to invoice server');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [search, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search invoice number, client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden"
                    />
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 px-3">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-slate-700 font-semibold focus:outline-hidden w-full sm:w-auto"
                        >
                            <option value="All">Status: All</option>
                            <option value="Paid">Status: Paid</option>
                            <option value="Unpaid">Status: Unpaid</option>
                            <option value="Cancelled">Status: Cancelled</option>
                        </select>
                    </div>

                    <Link
                        href="/invoices/new"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                        <FilePlus className="w-4 h-4" /> New Invoice
                    </Link>
                </div>
            </div>

            {/* Invoices List Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                        Loading invoices...
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-base font-semibold text-slate-700">
                            No Invoices Found
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Generate your first PDF invoice with customizable line items, GST, and client details.
                        </p>
                        <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-1 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                        >
                            <FilePlus className="w-4 h-4" /> New Invoice
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Invoice #</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4">Payment Type</th>
                                    <th className="py-3 px-4">Date</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Total Amount</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {invoices.map((inv) => (
                                    <tr
                                        key={inv._id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/invoices/${inv._id}`)}
                                    >
                                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono text-xs">
                                            {inv.invoiceNumber}
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                                            {inv.clientId?.clientName || 'N/A'}
                                            <div className="text-slate-400 text-[11px]">
                                                {inv.clientId?.businessName}
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                                            {inv.paymentType} ({inv.paymentMethod})
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-slate-500">
                                            {inv.invoiceDate ? (
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {format(new Date(inv.invoiceDate), 'dd MMM yyyy')}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <StatusBadge status={inv.status} size="sm" />
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-extrabold text-slate-900">
                                            ₹{inv.total?.toLocaleString('en-IN')}
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Link
                                                    href={`/invoices/${inv._id}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View PDF
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function InvoicesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Invoices...</div>}>
            <InvoicesContent />
        </Suspense>
    );
}
