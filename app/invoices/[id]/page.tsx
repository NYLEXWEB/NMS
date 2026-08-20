'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Printer,
    Download,
    Mail,
    CheckCircle,
    Building,
    User,
    Calendar,
    IndianRupee,
    RefreshCw,
    Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const invoiceId = resolvedParams.id;
    const router = useRouter();

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchInvoice() {
            try {
                const res = await fetch(`/api/invoices/${invoiceId}`);
                const json = await res.json();
                if (json.success) {
                    setInvoice(json.data);
                } else {
                    toast.error(json.error || 'Failed to load invoice');
                }
            } catch (err) {
                toast.error('Error fetching invoice details');
            } finally {
                setLoading(false);
            }
        }
        fetchInvoice();
    }, [invoiceId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm font-semibold">Loading Invoice Document...</p>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-lg font-bold text-slate-900">Invoice Not Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                    The requested invoice ID does not exist or has been deleted.
                </p>
                <Link
                    href="/invoices"
                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                    Back to Invoices
                </Link>
            </div>
        );
    }

    const client = invoice.clientId || {};
    const company = {
        name: 'NYLEXWEB',
        fullName: 'NYLEX Web Design & Development',
        phone: '+91 89214 42748',
        email: 'buildwithnylex@gmail.com',
        address: 'Kerala, India',
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Top Action Bar (Hidden during Print) */}
            <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Invoices
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                        <Printer className="w-4 h-4" /> Print / Save PDF
                    </button>
                    {client.email && (
                        <a
                            href={`mailto:${client.email}?subject=Invoice%20${invoice.invoiceNumber}%20from%20NYLEX&body=Dear%20${encodeURIComponent(
                                client.clientName
                            )},%0A%0APlease%20find%20attached%20invoice%20${invoice.invoiceNumber
                                }%20for%20total%20amount%20Rs.%20${invoice.total}.`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Send className="w-4 h-4" /> Email Client
                        </a>
                    )}
                </div>
            </div>

            {/* Printable Invoice Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-12 shadow-xs text-slate-900 space-y-8 font-sans">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 pb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-blue-600 tracking-tight">
                            {company.name}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium">{company.fullName}</p>
                        <p className="text-xs text-slate-500 font-medium mt-1">Phone: {company.phone}</p>
                        <p className="text-xs text-slate-500 font-medium">Email: {company.email}</p>
                    </div>

                    <div className="text-left sm:text-right">
                        <h2 className="text-xl font-extrabold tracking-wider text-slate-900">
                            INVOICE
                        </h2>
                        <p className="text-xs font-bold text-slate-600 mt-0.5">
                            #{invoice.invoiceNumber}
                        </p>
                        <div className="mt-2 text-xs">
                            <span className="text-slate-400">Date: </span>
                            <span className="font-bold">
                                {format(new Date(invoice.invoiceDate), 'dd MMMM yyyy')}
                            </span>
                        </div>
                        <div className="mt-1 text-xs">
                            <span className="text-slate-400">Type: </span>
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-lg">
                                {invoice.paymentType}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Billed From & Billed To */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-b border-slate-100 pb-6">
                    <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Billed From
                        </span>
                        <p className="font-extrabold text-slate-900 text-sm">{company.name}</p>
                        <p className="text-slate-600 font-medium mt-0.5">{company.fullName}</p>
                        <p className="text-slate-500 mt-1">{company.address}</p>
                    </div>

                    <div>
                        <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Billed To (Client)
                        </span>
                        <p className="font-extrabold text-slate-900 text-sm">
                            {client.clientName || 'N/A'}
                        </p>
                        <p className="text-slate-700 font-semibold mt-0.5">{client.businessName}</p>
                        <p className="text-slate-500 mt-1">{client.phone}</p>
                        <p className="text-slate-500">{client.email}</p>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-y border-slate-200/80 font-bold text-slate-500 uppercase">
                                <th className="py-3 px-4">Item & Description</th>
                                <th className="py-3 px-4 text-center">Qty</th>
                                <th className="py-3 px-4 text-right">Rate</th>
                                <th className="py-3 px-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {invoice.items?.map((item: any, idx: number) => (
                                <tr key={idx}>
                                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                                        {item.description}
                                    </td>
                                    <td className="py-3.5 px-4 text-center text-slate-600 font-medium">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                                        ₹{item.rate?.toLocaleString('en-IN')}
                                    </td>
                                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                                        ₹{item.amount?.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Summary */}
                <div className="flex flex-col items-end space-y-2 text-xs pt-2">
                    <div className="w-full sm:w-72 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between text-slate-600 font-medium">
                            <span>Subtotal:</span>
                            <span className="font-bold text-slate-900">
                                ₹{invoice.subtotal?.toLocaleString('en-IN')}
                            </span>
                        </div>

                        {invoice.gst > 0 && (
                            <div className="flex items-center justify-between text-slate-600 font-medium">
                                <span>GST:</span>
                                <span>+₹{invoice.gst?.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        {invoice.discount > 0 && (
                            <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                <span>Discount:</span>
                                <span>-₹{invoice.discount?.toLocaleString('en-IN')}</span>
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-base font-extrabold text-blue-600">
                            <span>Total Due:</span>
                            <span>₹{invoice.total?.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-slate-400 font-medium">Payment Mode:</span>
                            <span className="font-bold text-slate-700">{invoice.paymentMethod}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div className="pt-6 border-t border-slate-100 text-xs text-slate-500">
                        <span className="font-bold text-slate-700 block mb-1">Notes / Terms:</span>
                        <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium leading-relaxed">
                            {invoice.notes}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center pt-8 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                    Thank you for choosing NYLEX. Computer generated official invoice document.
                </div>
            </div>
        </div>
    );
}
