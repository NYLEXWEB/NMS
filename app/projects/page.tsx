'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
    Briefcase,
    Plus,
    Search,
    Filter,
    Calendar,
    ChevronRight,
    RefreshCw,
    Building,
    IndianRupee,
    FileText,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';

function ProjectsContent() {
    const searchParams = useSearchParams();
    const currentStatus = searchParams.get('status') || 'All';

    const [projects, setProjects] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(currentStatus);

    // Create Project Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '',
        projectName: '',
        serviceType: 'Website Development',
        projectAmount: '',
        advancePaid: '',
        status: 'In Progress',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        targetCompletionDate: '',
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (statusFilter && statusFilter !== 'All') query.append('status', statusFilter);

            const [projRes, clientRes] = await Promise.all([
                fetch(`/api/projects?${query.toString()}`),
                fetch('/api/clients'),
            ]);

            const projJson = await projRes.json();
            const clientJson = await clientRes.json();

            if (projJson.success) setProjects(projJson.data);
            if (clientJson.success) setClients(clientJson.data);
        } catch (err) {
            toast.error('Failed to load project database');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, statusFilter]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.clientId || !formData.projectName || !formData.projectAmount) {
            toast.error('Client, Project Name, and Total Amount are required.');
            return;
        }

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    projectAmount: Number(formData.projectAmount),
                    advancePaid: Number(formData.advancePaid || 0),
                }),
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Project created successfully');
                setIsModalOpen(false);
                setFormData({
                    clientId: '',
                    projectName: '',
                    serviceType: 'Website Development',
                    projectAmount: '',
                    advancePaid: '',
                    status: 'In Progress',
                    startDate: format(new Date(), 'yyyy-MM-dd'),
                    targetCompletionDate: '',
                });
                fetchData();
            } else {
                toast.error(json.error || 'Failed to create project');
            }
        } catch (err) {
            toast.error('Error creating project');
        }
    };

    const STATUS_OPTIONS = [
        'All',
        'In Progress',
        'Pending',
        'Review',
        'Completed',
        'On Hold',
    ];

    const SERVICE_TYPES = [
        'Website Development',
        'E-Commerce Store',
        'UI/UX Design',
        'SEO & Marketing',
        'Custom Web App',
        'Maintenance & Support',
    ];

    return (
        <div className="space-y-6">
            {/* Top Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4.5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search project name or client..."
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
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
            </div>

            {/* Projects Grid */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                    Loading project records...
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3 shadow-xs">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">
                        No Projects Found
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
                        Create a project to link clients, generate invoices, and manage payment schedules.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
                    >
                        <Plus className="w-4 h-4" /> Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((p) => {
                        const total = p.projectAmount || 0;
                        const advance = p.advancePaid || 0;
                        const balance = total - advance;

                        return (
                            <Link
                                key={p._id}
                                href={`/projects/${p._id}`}
                                className="glass-card rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-blue-200/80"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-extrabold text-slate-900 text-base leading-snug hover:text-blue-600 transition-colors">
                                            {p.projectName}
                                        </h3>
                                        <StatusBadge status={p.status} size="sm" />
                                    </div>
                                    <p className="text-xs text-slate-400 font-semibold">{p.serviceType}</p>
                                </div>

                                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-1">
                                    <div className="text-xs font-bold text-slate-800 truncate">
                                        {p.clientId?.clientName || 'Unassigned Client'}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                        <Building className="w-3 h-3 text-slate-400" />
                                        {p.clientId?.businessName || 'Business N/A'}
                                    </div>
                                </div>

                                {/* Financial Summary Pills */}
                                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                    <div className="p-2.5 bg-slate-100/60 rounded-xl border border-slate-200/40">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
                                        <span className="font-extrabold text-slate-900">₹{total.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
                                        <span className="text-[10px] text-emerald-600 font-bold uppercase block">Balance Due</span>
                                        <span className="font-extrabold text-emerald-700">₹{balance.toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                                    <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        {p.startDate ? format(new Date(p.startDate), 'dd MMM yyyy') : 'No date'}
                                    </span>
                                    <span className="font-bold text-blue-600 flex items-center gap-0.5">
                                        Details <ChevronRight className="w-3 h-3" />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Project"
                maxWidth="lg"
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Associated Client *
                        </label>
                        <select
                            required
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                        >
                            <option value="">Select a client from database...</option>
                            {clients.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.clientName} ({c.businessName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Project Title / Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Apex Bakery E-Commerce Website"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Service Category
                            </label>
                            <select
                                value={formData.serviceType}
                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                            >
                                {SERVICE_TYPES.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Project Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-bold text-slate-900"
                            >
                                {STATUS_OPTIONS.filter((s) => s !== 'All').map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Total Agreed Amount (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="e.g. 25000"
                                value={formData.projectAmount}
                                onChange={(e) => setFormData({ ...formData, projectAmount: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Initial Advance Deposit (₹)
                            </label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g. 10000"
                                value={formData.advancePaid}
                                onChange={(e) => setFormData({ ...formData, advancePaid: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Target Completion Date
                            </label>
                            <input
                                type="date"
                                value={formData.targetCompletionDate}
                                onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs font-medium"
                            />
                        </div>
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
                            Save Project
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Projects...</div>}>
            <ProjectsContent />
        </Suspense>
    );
}
