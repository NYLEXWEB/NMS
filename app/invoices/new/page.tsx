'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Plus,
    Trash2,
    FileText,
    Building,
    User,
    Calendar,
    IndianRupee,
    CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

function NewInvoiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const preselectedClientId = searchParams.get('clientId') || '';
    const preselectedProjectId = searchParams.get('projectId') || '';

    const [clients, setClients] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [clientId, setClientId] = useState(preselectedClientId);
    const [projectId, setProjectId] = useState(preselectedProjectId);
    const [paymentType, setPaymentType] = useState('Advance');
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState('Paid');
    const [recordPayment, setRecordPayment] = useState(true);

    const [items, setItems] = useState<any[]>([
        { description: 'Web Design & Development - Initial Advance', quantity: 1, rate: 5000, amount: 5000 },
    ]);

    const [gst, setGst] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [notes, setNotes] = useState('Thank you for choosing NYLEX. Payment due upon receipt.');

    useEffect(() => {
        async function loadData() {
            try {
                const [cRes, pRes, sRes] = await Promise.all([
                    fetch('/api/clients'),
                    fetch('/api/projects'),
                    fetch('/api/settings'),
                ]);

                const cJson = await cRes.json();
                const pJson = await pRes.json();
                const sJson = await sRes.json();

                if (cJson.success) setClients(cJson.data);
                if (pJson.success) setProjects(pJson.data);
                if (sJson.success) setSettings(sJson.data);
            } catch (err) {
                toast.error('Failed to load form metadata');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // Update line item
    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'rate') {
            const q = Number(newItems[index].quantity) || 0;
            const r = Number(newItems[index].rate) || 0;
            newItems[index].amount = q * r;
        }
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([
            ...items,
            { description: 'Additional Service / Module', quantity: 1, rate: 0, amount: 0 },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, idx) => idx !== index));
    };

    // Subtotal & Total
    const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const total = subtotal + Number(gst) - Number(discount);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientId) {
            toast.error('Please select a client for this invoice.');
            return;
        }
        if (items.length === 0 || subtotal <= 0) {
            toast.error('Please add at least one line item with a valid amount.');
            return;
        }

        try {
            const payload = {
                clientId,
                projectId: projectId || undefined,
                paymentType,
                paymentMethod,
                invoiceDate,
                items,
                subtotal,
                gst: Number(gst),
                discount: Number(discount),
                total,
                status,
                notes,
                recordPayment: status === 'Paid' ? recordPayment : false,
            };

            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (json.success) {
                toast.success(`Invoice ${json.data.invoiceNumber} created successfully!`);
                router.push(`/invoices/${json.data._id}`);
            } else {
                toast.error(json.error || 'Failed to generate invoice');
            }
        } catch (err) {
            toast.error('Error generating invoice');
        }
    };

    const selectedClientObj = clients.find((c) => c._id === clientId);

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Top Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Cancel & Return
                </button>
                <h1 className="text-xl font-extrabold text-slate-900">
                    Generate New Invoice
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Billed From & Billed To Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
                        {/* FROM: NYLEX */}
                        <div>
                            <span className="text-xs uppercase font-bold text-slate-400">Billed From</span>
                            <div className="mt-2 text-xs space-y-1">
                                <p className="font-extrabold text-sm text-blue-600">
                                    {settings?.businessName || 'NYLEXWEB'}
                                </p>
                                <p className="text-slate-600 font-medium">
                                    {settings?.companyName || 'NYLEX Web Design & Development'}
                                </p>
                                <p className="text-slate-500">{settings?.phone || '+91 89214 42748'}</p>
                                <p className="text-slate-500">{settings?.email || 'buildwithnylex@gmail.com'}</p>
                            </div>
                        </div>

                        {/* TO: Client Selector */}
                        <div>
                            <label className="block text-xs uppercase font-bold text-slate-400 mb-2">
                                Billed To (Select Client) *
                            </label>
                            <select
                                required
                                value={clientId}
                                onChange={(e) => setClientId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200/80 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                            >
                                <option value="">-- Choose Client --</option>
                                {clients.map((c) => (
                                    <option key={c._id} value={c._id}>
                                        {c.clientName} ({c.businessName})
                                    </option>
                                ))}
                            </select>

                            {selectedClientObj && (
                                <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-0.5 border border-slate-100">
                                    <p className="font-bold text-slate-900">
                                        {selectedClientObj.clientName}
                                    </p>
                                    <p className="text-slate-500">{selectedClientObj.businessName}</p>
                                    <p className="text-slate-500">{selectedClientObj.phone}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Invoice Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Link Project (Optional)
                            </label>
                            <select
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200/80 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                            >
                                <option value="">None / Custom Invoice</option>
                                {projects
                                    .filter((p) => !clientId || (p.clientId?._id || p.clientId) === clientId)
                                    .map((p) => (
                                        <option key={p._id} value={p._id}>
                                            {p.projectName}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Payment Type
                            </label>
                            <select
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200/80 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                            >
                                <option value="Advance">Advance Payment</option>
                                <option value="Balance">Balance Payment</option>
                                <option value="Complete">Complete Payment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Payment Method
                            </label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200/80 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                            >
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-700 mb-1">
                                Invoice Date
                            </label>
                            <input
                                type="date"
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200/80 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Dynamic Line Items Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Line Items</h3>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Item
                        </button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-xs"
                            >
                                <div className="col-span-6 sm:col-span-6">
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={item.description}
                                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                        placeholder="e.g. Website Design & Development Advance"
                                        className="w-full px-2.5 py-1.5 border border-slate-200/80 bg-white rounded-lg text-xs font-medium"
                                    />
                                </div>

                                <div className="col-span-2 sm:col-span-2">
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">
                                        Qty
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-slate-200/80 bg-white rounded-lg text-xs text-center font-semibold"
                                    />
                                </div>

                                <div className="col-span-3 sm:col-span-3">
                                    <label className="block text-[10px] text-slate-400 uppercase font-bold mb-0.5">
                                        Rate (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={item.rate}
                                        onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                                        className="w-full px-2.5 py-1.5 border border-slate-200/80 bg-white rounded-lg text-xs text-right font-semibold"
                                    />
                                </div>

                                <div className="col-span-1 text-right pt-4">
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Subtotal & Calculations */}
                    <div className="flex flex-col items-end pt-4 border-t border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between w-64">
                            <span className="text-slate-500 font-medium">Subtotal:</span>
                            <span className="font-bold text-slate-900">
                                ₹{subtotal.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between w-64">
                            <span className="text-slate-500 font-medium">GST (₹):</span>
                            <input
                                type="number"
                                min="0"
                                value={gst}
                                onChange={(e) => setGst(Number(e.target.value))}
                                className="w-24 px-2 py-1 border border-slate-200/80 rounded-lg text-right text-xs font-semibold"
                            />
                        </div>

                        <div className="flex items-center justify-between w-64">
                            <span className="text-slate-500 font-medium">Discount (₹):</span>
                            <input
                                type="number"
                                min="0"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                className="w-24 px-2 py-1 border border-slate-200/80 rounded-lg text-right text-xs font-semibold"
                            />
                        </div>

                        <div className="flex items-center justify-between w-64 pt-2 border-t border-slate-200/80 font-extrabold text-sm text-blue-600">
                            <span>Total Invoice Amount:</span>
                            <span>₹{total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* Status & Auto Payment Record Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Invoice Payment Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200/80 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                            >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                            </select>
                        </div>

                        {status === 'Paid' && (
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="recordPayment"
                                    checked={recordPayment}
                                    onChange={(e) => setRecordPayment(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500/20"
                                />
                                <label htmlFor="recordPayment" className="text-xs font-semibold text-slate-700">
                                    Automatically log payment record to revenue analytics
                                </label>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Save & Generate Invoice PDF
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Invoice Generator...</div>}>
            <NewInvoiceContent />
        </Suspense>
    );
}
