'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Users,
    Search,
    Plus,
    Filter,
    Phone,
    Mail,
    MapPin,
    Building,
    Calendar,
    ChevronRight,
    RefreshCw,
    UserCheck,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';

function ClientsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || 'All';

    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [search, setSearch] = useState(currentSearch);
    const [statusFilter, setStatusFilter] = useState(currentStatus);

    // Create Client Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        businessName: '',
        phone: '',
        email: '',
        location: '',
        status: 'Interested',
        notes: '',
    });

    const fetchClients = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (statusFilter && statusFilter !== 'All') query.append('status', statusFilter);

            const res = await fetch(`/api/clients?${query.toString()}`);
            const json = await res.json();

            if (json.success) {
                setClients(json.data);
            } else {
                toast.error(json.error || 'Failed to fetch clients');
            }
        } catch (err) {
            toast.error('Error fetching clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [search, statusFilter]);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientName || !formData.businessName || !formData.phone) {
            toast.error('Client Name, Business Name, and Phone are required.');
            return;
        }

        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Client added successfully');
                setIsModalOpen(false);
                setFormData({
                    clientName: '',
                    businessName: '',
                    phone: '',
                    email: '',
                    location: '',
                    status: 'Interested',
                    notes: '',
                });
                fetchClients();
            } else {
                toast.error(json.error || 'Failed to create client');
            }
        } catch (err) {
            toast.error('Error creating client');
        }
    };

    const STATUS_OPTIONS = [
        'All',
        'Interested',
        'Follow-up',
        'Negotiation',
        'Confirmed',
        'Project Started',
        'Completed',
        'Inactive',
    ];

    const getInitials = (name: string) => {
        if (!name) return 'NX';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const avatarColors = [
        'bg-blue-100 text-blue-700 border-blue-200',
        'bg-emerald-100 text-emerald-700 border-emerald-200',
        'bg-purple-100 text-purple-700 border-purple-200',
        'bg-amber-100 text-amber-700 border-amber-200',
        'bg-indigo-100 text-indigo-700 border-indigo-200',
        'bg-teal-100 text-teal-700 border-teal-200',
    ];

    return (
        <div className="space-y-6">
            {/* Top Header Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by client, business, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs py-1.5 px-3">
                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-slate-700 font-bold focus:outline-hidden w-full sm:w-auto"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                    Status: {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" /> Add Client
                    </button>
                </div>
            </div>

            {/* Clients Data Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                        Loading clients database...
                    </div>
                ) : clients.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <Users className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-base font-bold text-slate-800">
                            No Clients Found
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                            Get started by creating your first client entry. Track follow-ups, project status, and notes.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                        >
                            <Plus className="w-4 h-4" /> Add Client
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-5">Client / Business</th>
                                    <th className="py-3.5 px-4">Contact</th>
                                    <th className="py-3.5 px-4">Location</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4">Next Follow-up</th>
                                    <th className="py-3.5 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {clients.map((c, idx) => {
                                    const avatarStyle = avatarColors[idx % avatarColors.length];

                                    return (
                                        <tr
                                            key={c._id}
                                            className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/clients/${c._id}`)}
                                        >
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs border ${avatarStyle} shrink-0`}>
                                                        {getInitials(c.clientName)}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                                                            {c.clientName}
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                            <Building className="w-3 h-3 text-slate-400" />
                                                            {c.businessName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-xs space-y-0.5">
                                                <div className="flex items-center gap-1 font-bold text-slate-800">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    {c.phone}
                                                </div>
                                                {c.email && (
                                                    <div className="flex items-center gap-1 text-slate-500 font-medium">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        {c.email}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                                                {c.location ? (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-slate-400" />
                                                        {c.location}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic">Not set</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <StatusBadge status={c.status} size="sm" />
                                            </td>

                                            <td className="py-3.5 px-4 text-xs">
                                                {c.nextFollowUpDate ? (
                                                    <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                                        <Calendar className="w-3 h-3 text-amber-500" />
                                                        {format(new Date(c.nextFollowUpDate), 'dd MMM yyyy')}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-5 text-right">
                                                <Link
                                                    href={`/clients/${c._id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg inline-block transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Client Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Client"
            >
                <form onSubmit={handleCreateClient} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Client Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={formData.clientName}
                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Business / Store Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Apex Bakery & Cafe"
                            value={formData.businessName}
                            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Phone Number *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="client@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Location / City
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Kozhikode, Kerala"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Initial Client Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold"
                            >
                                {STATUS_OPTIONS.filter((s) => s !== 'All').map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Initial Notes / Requirement Overview
                        </label>
                        <textarea
                            rows={3}
                            placeholder="e.g. Needs e-commerce catalog website with WhatsApp order integration."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                            Create Client
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function ClientsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Clients...</div>}>
            <ClientsContent />
        </Suspense>
    );
}
