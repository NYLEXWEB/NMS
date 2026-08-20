'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Download,
    Printer,
    CheckCircle,
    Clock,
    Trash2,
    Building,
    Calendar,
    CreditCard,
    RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePdfDocument } from '@/components/invoices/InvoicePdfDocument';

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [invoice, setInvoice] = useState<any>(null);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        async function loadData() {
            try {
                const [iRes, sRes] = await Promise.all([
                    fetch(`/api/invoices/${id}`),
                    fetch('/api/settings'),
                ]);

                const iJson = await iRes.json();
                const sJson = await sRes.json();

                if (iJson.success) setInvoice(iJson.data);
                if (sJson.success) setSettings(sJson.data);
            } catch (err) {
                toast.error('Failed to load invoice details');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    const handleToggleStatus = async () => {
        const newStatus = invoice.status === 'Paid' ? 'Unpaid' : 'Paid';
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`Invoice marked as ${newStatus}`);
                setInvoice(json.data);
            } else {
                toast.error(json.error || 'Failed to update invoice');
            }
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete invoice '${invoice?.invoiceNumber}'?`)) return;

        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success('Invoice deleted');
                router.push('/invoices');
            } else {
                toast.error(json.error || 'Failed to delete invoice');
            }
        } catch (err) {
            toast.error('Error deleting invoice');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading invoice PDF preview...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invoice Not Found</h3>
                <button
                    onClick={() => router.push('/invoices')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                    Return to Invoice History
                </button>
            </div>
        );
    }

    const client = invoice.clientId || {};
    const company = settings || {
        companyName: 'NYLEX',
        businessName: 'NYLEXWEB',
        phone: '+91 89214 42748',
        email: 'buildwithnylex@gmail.com',
        website: 'https://nylexweb.com',
        address: 'Kerala, India',
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Top Header Actions (Hidden when printing) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 print:hidden">
                <button
                    onClick={() => router.push('/invoices')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Invoices
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleToggleStatus}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${invoice.status === 'Paid'
                                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                    >
                        Mark as {invoice.status === 'Paid' ? 'Unpaid' : 'Paid'}
                    </button>

                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-200"
                    >
                        <Printer className="w-3.5 h-3.5" /> Print
                    </button>

                    {isClient && (
                        <PDFDownloadLink
                            document={<InvoicePdfDocument invoice={invoice} settings={settings} />}
                            fileName={`${invoice.invoiceNumber}.pdf`}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                        >
                            {({ loading }) =>
                                loading ? (
                                    'Generating PDF...'
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5" /> Download PDF
                                    </>
                                )
                            }
                        </PDFDownloadLink>
                    )}

                    <button
                        onClick={handleDelete}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Invoice"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Invoice Document Preview Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 sm:p-12 shadow-sm text-slate-900 dark:text-slate-100 space-y-8 font-sans">
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-blue-600 uppercase">
                            {company.companyName}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">Web Design & Development</p>
                        <p className="text-xs text-slate-500 mt-2">{company.phone}</p>
                        <p className="text-xs text-slate-500">{company.email}</p>
                        <p className="text-xs text-slate-500">{company.website}</p>
                    </div>

                    <div className="text-left sm:text-right space-y-1">
                        <h2 className="text-xl font-bold tracking-wider text-slate-900 dark:text-white">
                            INVOICE
                        </h2>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            #{invoice.invoiceNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                            Date: {format(new Date(invoice.invoiceDate), 'dd MMMM yyyy')}
                        </p>
                        <div className="pt-2">
                            <StatusBadge status={invoice.status} />
                            <span className="ml-2 inline-block px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-md">
                                {invoice.paymentType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Address Blocks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                    <div>
                        <span className="uppercase font-bold text-slate-400 text-[10px] tracking-wider block mb-1">
                            Billed From
                        </span>
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {company.businessName}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">{company.address}</p>
                        <p className="text-slate-500">Phone: {company.phone}</p>
                        <p className="text-slate-500">Email: {company.email}</p>
                    </div>

                    <div>
                        <span className="uppercase font-bold text-slate-400 text-[10px] tracking-wider block mb-1">
                            Billed To
                        </span>
                        <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {client.clientName || 'Valued Client'}
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold">{client.businessName}</p>
                        {client.location && <p className="text-slate-500">{client.location}</p>}
                        <p className="text-slate-500">Phone: {client.phone}</p>
                        {client.email && <p className="text-slate-500">Email: {client.email}</p>}
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800 border-y border-slate-200 dark:border-slate-800 font-bold text-slate-500 uppercase">
                                <th className="py-3 px-4">Item Description</th>
                                <th className="py-3 px-4 text-center">Qty</th>
                                <th className="py-3 px-4 text-right">Rate</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {invoice.items?.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                                        {item.description}
                                    </td>
                                    <td className="py-3.5 px-4 text-center font-medium">{item.quantity}</td>
                                    <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">
                                        ₹{item.rate?.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                                        ₹{item.amount?.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-end pt-4">
                    <div className="w-full sm:w-72 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                ₹{invoice.subtotal?.toLocaleString('en-IN')}
                            </span>
                        </div>

                        {invoice.gst > 0 && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                <span>GST:</span>
                                <span>+ ₹{invoice.gst?.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        {invoice.discount > 0 && (
                            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                <span>Discount:</span>
                                <span>- ₹{invoice.discount?.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-base font-extrabold text-blue-600 dark:text-blue-400">
                            <span>Total Amount:</span>
                            <span>₹{invoice.total?.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                            <span>Payment Method:</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {invoice.paymentMethod}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notes & Terms */}
                {invoice.notes && (
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Notes</span>
                        <p>{invoice.notes}</p>
                    </div>
                )}

                {/* Computer generated footer */}
                <div className="text-center pt-8 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                    Thank you for choosing NYLEX. We sincerely appreciate your trust!
                </div>
            </div>
        </div>
    );
}
