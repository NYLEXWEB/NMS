'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Phone,
    MessageSquare,
    Mail,
    MapPin,
    Building,
    Calendar,
    Clock,
    Plus,
    Briefcase,
    FileText,
    CreditCard,
    Send,
    Edit,
    RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ACTIVITY_TYPES = ['WhatsApp', 'Call', 'Meeting', 'Follow-up', 'Note', 'Status Change'];
const CLIENT_STATUSES = [
    'Interested',
    'Follow-up',
    'Negotiation',
    'Confirmed',
    'Project Started',
    'Project Completed',
    'Lost',
    'Not Interested',
];

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'timeline' | 'projects' | 'invoices'>('timeline');

    // New Activity Modal State
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [activityForm, setActivityForm] = useState({
        type: 'WhatsApp',
        description: '',
        date: new Date().toISOString().split('T')[0],
        nextFollowUpDate: '',
        followUpNote: '',
    });

    // Edit Followup Form State
    const [isFollowupEditing, setIsFollowupEditing] = useState(false);
    const [followupData, setFollowupData] = useState({
        nextFollowUpDate: '',
        followUpNote: '',
    });

    // Create Project Modal State
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [projectForm, setProjectForm] = useState({
        projectName: '',
        serviceType: 'Web Design & Development',
        projectAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        deadline: '',
        status: 'Pending',
        liveUrl: '',
        githubUrl: '',
        hostingProvider: '',
        domainRegisteredEmail: '',
        notes: '',
    });

    const fetchClientDetails = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/clients/${id}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                const cl = json.data.client;
                setFollowupData({
                    nextFollowUpDate: cl.nextFollowUpDate
                        ? new Date(cl.nextFollowUpDate).toISOString().split('T')[0]
                        : '',
                    followUpNote: cl.followUpNote || '',
                });
            } else {
                toast.error(json.error || 'Failed to load client details');
            }
        } catch (err) {
            toast.error('Error fetching client details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientDetails();
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`Client status updated to '${newStatus}'`);
                fetchClientDetails();
            } else {
                toast.error(json.error || 'Failed to update status');
            }
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    const handleAddActivity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activityForm.description) {
            toast.error('Activity description is required.');
            return;
        }

        try {
            const res = await fetch(`/api/clients/${id}/activities`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(activityForm),
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Activity added to timeline');
                setIsActivityModalOpen(false);
                setActivityForm({
                    type: 'WhatsApp',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                    nextFollowUpDate: '',
                    followUpNote: '',
                });
                fetchClientDetails();
            } else {
                toast.error(json.error || 'Failed to add activity');
            }
        } catch (err) {
            toast.error('Error recording activity');
        }
    };

    const handleUpdateFollowup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(followupData),
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Follow-up details updated');
                setIsFollowupEditing(false);
                fetchClientDetails();
            } else {
                toast.error(json.error || 'Failed to update follow-up');
            }
        } catch (err) {
            toast.error('Error updating follow-up');
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectForm.projectName || !projectForm.projectAmount) {
            toast.error('Project Name and Amount are required.');
            return;
        }

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...projectForm, clientId: id }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Project created successfully');
                setIsProjectModalOpen(false);
                fetchClientDetails();
            } else {
                toast.error(json.error || 'Failed to create project');
            }
        } catch (err) {
            toast.error('Error creating project');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading client workspace...</p>
            </div>
        );
    }

    if (!data?.client) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Client Not Found</h3>
                <button
                    onClick={() => router.push('/clients')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                    Return to Client List
                </button>
            </div>
        );
    }

    const { client, activities, projects, payments, invoices } = data;

    return (
        <div className="space-y-6">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push('/clients')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Clients List
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsActivityModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                    >
                        <Plus className="w-3.5 h-3.5" /> Log Activity
                    </button>
                    <button
                        onClick={() => setIsProjectModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                        <Briefcase className="w-3.5 h-3.5" /> Create Project
                    </button>
                </div>
            </div>

            {/* Main Header & Overview Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {client.clientName}
                            </h1>
                            <StatusBadge status={client.status} />
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                            <Building className="w-4 h-4 text-slate-400" />
                            {client.businessName} • <span className="text-blue-600">{client.businessCategory}</span>
                        </p>
                    </div>

                    {/* Quick Status Dropdown */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-500">Change Status:</span>
                        <select
                            value={client.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-hidden"
                        >
                            {CLIENT_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                    {st}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Client Fields Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-5 text-xs">
                    <div>
                        <span className="text-slate-400 uppercase font-semibold">Phone</span>
                        <p className="text-slate-900 dark:text-white font-medium mt-0.5 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-blue-500" />
                            {client.phone}
                        </p>
                    </div>

                    <div>
                        <span className="text-slate-400 uppercase font-semibold">WhatsApp</span>
                        <p className="text-slate-900 dark:text-white font-medium mt-0.5 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                            {client.whatsapp || client.phone}
                        </p>
                    </div>

                    <div>
                        <span className="text-slate-400 uppercase font-semibold">Email</span>
                        <p className="text-slate-900 dark:text-white font-medium mt-0.5 flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-indigo-500" />
                            {client.email || 'N/A'}
                        </p>
                    </div>

                    <div>
                        <span className="text-slate-400 uppercase font-semibold">Location</span>
                        <p className="text-slate-900 dark:text-white font-medium mt-0.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {client.location || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Follow-Up Banner */}
                <div className="mt-5 p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                            <span className="font-bold text-amber-900 dark:text-amber-200">
                                Next Follow-up:{' '}
                                {client.nextFollowUpDate
                                    ? format(new Date(client.nextFollowUpDate), 'dd MMMM yyyy')
                                    : 'Not Scheduled'}
                            </span>
                            <p className="text-amber-700 dark:text-amber-400 mt-0.5">
                                {client.followUpNote || 'No specific follow-up note saved.'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsFollowupEditing(!isFollowupEditing)}
                        className="px-3 py-1 bg-amber-600 text-white rounded-md font-semibold hover:bg-amber-700 transition-colors shrink-0"
                    >
                        {isFollowupEditing ? 'Cancel' : 'Edit Follow-up'}
                    </button>
                </div>

                {/* Follow-up inline form */}
                {isFollowupEditing && (
                    <form
                        onSubmit={handleUpdateFollowup}
                        className="mt-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                    Next Follow-up Date
                                </label>
                                <input
                                    type="date"
                                    value={followupData.nextFollowUpDate}
                                    onChange={(e) =>
                                        setFollowupData({ ...followupData, nextFollowUpDate: e.target.value })
                                    }
                                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-md text-xs"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                    Follow-up Note
                                </label>
                                <input
                                    type="text"
                                    value={followupData.followUpNote}
                                    onChange={(e) =>
                                        setFollowupData({ ...followupData, followUpNote: e.target.value })
                                    }
                                    placeholder="e.g. Call regarding quotation feedback"
                                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-md text-xs"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700"
                            >
                                Save Follow-up Date
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
                <button
                    onClick={() => setActiveTab('timeline')}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'timeline'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <Clock className="w-4 h-4" /> Activity Timeline ({activities?.length || 0})
                </button>

                <button
                    onClick={() => setActiveTab('projects')}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'projects'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <Briefcase className="w-4 h-4" /> Projects ({projects?.length || 0})
                </button>

                <button
                    onClick={() => setActiveTab('invoices')}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'invoices'
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                >
                    <FileText className="w-4 h-4" /> Invoices & Payments ({invoices?.length || 0})
                </button>
            </div>

            {/* Tab 1: Activity Timeline */}
            {activeTab === 'timeline' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Chronological Activity & Log History
                        </h3>
                        <button
                            onClick={() => setIsActivityModalOpen(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Log
                        </button>
                    </div>

                    {activities?.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                            No activity logs recorded yet. Click 'Add Log' to record calls, meetings, or notes.
                        </div>
                    ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                            {activities.map((act: any) => (
                                <div key={act._id} className="relative group">
                                    <span className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900 flex items-center justify-center text-white text-[9px]" />
                                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] rounded-md">
                                                {act.type}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {format(new Date(act.date), 'dd MMMM yyyy, HH:mm')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium whitespace-pre-line mt-1">
                                            {act.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 2: Projects List */}
            {activeTab === 'projects' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Client Projects
                        </h3>
                        <button
                            onClick={() => setIsProjectModalOpen(true)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5" /> Create Project
                        </button>
                    </div>

                    {projects?.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                            No projects created for this client yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((proj: any) => (
                                <div
                                    key={proj._id}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={`/projects/${proj._id}`}
                                            className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600"
                                        >
                                            {proj.projectName}
                                        </Link>
                                        <StatusBadge status={proj.status} size="sm" />
                                    </div>
                                    <p className="text-xs text-slate-500">{proj.serviceType}</p>
                                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            ₹{proj.projectAmount.toLocaleString('en-IN')}
                                        </span>
                                        <Link
                                            href={`/projects/${proj._id}`}
                                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                        >
                                            View Details & Billing →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tab 3: Invoices & Payments Summary */}
            {activeTab === 'invoices' && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            Generated Invoices & Payments
                        </h3>
                        <Link
                            href={`/invoices/new?clientId=${id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                        >
                            <Plus className="w-3.5 h-3.5" /> Generate Invoice
                        </Link>
                    </div>

                    {invoices?.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                            No invoices generated for this client yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase">
                                        <th className="py-2.5 px-3">Invoice Number</th>
                                        <th className="py-2.5 px-3">Type</th>
                                        <th className="py-2.5 px-3">Date</th>
                                        <th className="py-2.5 px-3">Amount</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {invoices.map((inv: any) => (
                                        <tr key={inv._id} className="hover:bg-slate-50">
                                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                                                <Link href={`/invoices/${inv._id}`} className="hover:text-blue-600">
                                                    {inv.invoiceNumber}
                                                </Link>
                                            </td>
                                            <td className="py-3 px-3 text-xs text-slate-600">{inv.paymentType}</td>
                                            <td className="py-3 px-3 text-xs text-slate-500">
                                                {format(new Date(inv.invoiceDate), 'dd MMM yyyy')}
                                            </td>
                                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white text-xs">
                                                ₹{inv.total.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-3 px-3">
                                                <StatusBadge status={inv.status} size="sm" />
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <Link
                                                    href={`/invoices/${inv._id}`}
                                                    className="text-xs text-blue-600 font-semibold hover:underline"
                                                >
                                                    View PDF
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Add Activity Log Modal */}
            <Modal
                isOpen={isActivityModalOpen}
                onClose={() => setIsActivityModalOpen(false)}
                title="Add Activity to Client Timeline"
            >
                <form onSubmit={handleAddActivity} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Activity Type
                        </label>
                        <select
                            value={activityForm.type}
                            onChange={(e) => setActivityForm({ ...activityForm, type: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        >
                            {ACTIVITY_TYPES.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Activity Date
                        </label>
                        <input
                            type="date"
                            value={activityForm.date}
                            onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Description / Notes *
                        </label>
                        <textarea
                            rows={3}
                            required
                            placeholder="e.g. Sent initial proposal document on WhatsApp."
                            value={activityForm.description}
                            onChange={(e) =>
                                setActivityForm({ ...activityForm, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Update Next Follow-up (Optional)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <input
                                    type="date"
                                    value={activityForm.nextFollowUpDate}
                                    onChange={(e) =>
                                        setActivityForm({ ...activityForm, nextFollowUpDate: e.target.value })
                                    }
                                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                                />
                            </div>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Follow-up Note"
                                    value={activityForm.followUpNote}
                                    onChange={(e) =>
                                        setActivityForm({ ...activityForm, followUpNote: e.target.value })
                                    }
                                    className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setIsActivityModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                        >
                            Save Activity
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Create Project Modal */}
            <Modal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                title={`Create New Project for ${client.clientName}`}
                maxWidth="lg"
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Project Name *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Apex Photography Portfolio Website"
                                value={projectForm.projectName}
                                onChange={(e) =>
                                    setProjectForm({ ...projectForm, projectName: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Service Type
                            </label>
                            <input
                                type="text"
                                value={projectForm.serviceType}
                                onChange={(e) =>
                                    setProjectForm({ ...projectForm, serviceType: e.target.value })
                                }
                                placeholder="e.g. Web Design & Development"
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Project Amount (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="e.g. 15000"
                                value={projectForm.projectAmount}
                                onChange={(e) =>
                                    setProjectForm({ ...projectForm, projectAmount: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Initial Status
                            </label>
                            <select
                                value={projectForm.status}
                                onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Review">Review</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={projectForm.startDate}
                                onChange={(e) =>
                                    setProjectForm({ ...projectForm, startDate: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Target Deadline
                            </label>
                            <input
                                type="date"
                                value={projectForm.deadline}
                                onChange={(e) =>
                                    setProjectForm({ ...projectForm, deadline: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Live URL (if deployed)
                            </label>
                            <input
                                type="url"
                                placeholder="https://apexphotography.com"
                                value={projectForm.liveUrl}
                                onChange={(e) =>
                                    setProjectForm({ ...projectForm, liveUrl: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                GitHub Repository URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://github.com/nylex/apex-photo"
                                value={projectForm.githubUrl}
                                onChange={(e) =>
                                    setProjectForm({ ...projectForm, githubUrl: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsProjectModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                        >
                            Create Project
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
