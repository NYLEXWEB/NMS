'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Briefcase,
    Search,
    Plus,
    Filter,
    Building,
    Calendar,
    ChevronRight,
    IndianRupee,
    Code,
    RefreshCw,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';

function ProjectsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentSearch = searchParams.get('search') || '';
    const currentStatus = searchParams.get('status') || 'All';

    const [projects, setProjects] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState(currentSearch);
    const [statusFilter, setStatusFilter] = useState(currentStatus);

    // Create Project Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        projectName: '',
        clientId: '',
        serviceType: 'Web Design & Development',
        projectAmount: '',
        status: 'In Progress',
        startDate: new Date().toISOString().split('T')[0],
        targetCompletionDate: '',
        liveUrl: '',
        notes: '',
    });

    const fetchProjectsAndClients = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (statusFilter && statusFilter !== 'All') query.append('status', statusFilter);

            const [pRes, cRes] = await Promise.all([
                fetch(`/api/projects?${query.toString()}`),
                fetch('/api/clients'),
            ]);

            const pJson = await pRes.json();
            const cJson = await cRes.json();

            if (pJson.success) setProjects(pJson.data);
            if (cJson.success) setClients(cJson.data);
        } catch (err) {
            toast.error('Failed to load project database');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectsAndClients();
    }, [search, statusFilter]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.projectName || !formData.clientId || !formData.projectAmount) {
            toast.error('Project Name, Client, and Amount are required.');
            return;
        }

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Project created successfully');
                setIsModalOpen(false);
                setFormData({
                    projectName: '',
                    clientId: '',
                    serviceType: 'Web Design & Development',
                    projectAmount: '',
                    status: 'In Progress',
                    startDate: new Date().toISOString().split('T')[0],
                    targetCompletionDate: '',
                    liveUrl: '',
                    notes: '',
                });
                fetchProjectsAndClients();
            } else {
                toast.error(json.error || 'Failed to create project');
            }
        } catch (err) {
            toast.error('Error creating project');
        }
    };

    const STATUS_OPTIONS = [
        'All',
        'Lead',
        'Requirements Gathering',
        'Design Phase',
        'In Progress',
        'Testing & Review',
        'Completed',
        'On Hold',
    ];

    return (
        <div className="space-y-6">
            {/* Top Bar Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search project name, service..."
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
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                    Status: {opt}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" /> New Project
                    </button>
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                        Loading projects database...
                    </div>
                ) : projects.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                        <h3 className="text-base font-semibold text-slate-700">
                            No Projects Found
                        </h3>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Add a project to manage credentials, tracking, and completion emails.
                        </p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                        >
                            <Plus className="w-4 h-4" /> New Project
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <tr>
                                    <th className="py-3 px-4">Project / Service</th>
                                    <th className="py-3 px-4">Client</th>
                                    <th className="py-3 px-4">Amount</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Start Date</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {projects.map((p) => (
                                    <tr
                                        key={p._id}
                                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/projects/${p._id}`)}
                                    >
                                        <td className="py-3.5 px-4">
                                            <div className="font-bold text-slate-900 hover:text-blue-600">
                                                {p.projectName}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                <Code className="w-3 h-3 text-slate-400" />
                                                {p.serviceType}
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                                            {p.clientId?.clientName || 'N/A'}
                                            <div className="text-slate-400 text-[11px]">
                                                {p.clientId?.businessName}
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 text-xs font-extrabold text-slate-900">
                                            ₹{p.projectAmount?.toLocaleString('en-IN')}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <StatusBadge status={p.status} size="sm" />
                                        </td>

                                        <td className="py-3.5 px-4 text-xs text-slate-500">
                                            {p.startDate ? (
                                                <span className="flex items-center gap-1 font-medium text-slate-600">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    {format(new Date(p.startDate), 'dd MMM yyyy')}
                                                </span>
                                            ) : (
                                                '-'
                                            )}
                                        </td>

                                        <td className="py-3.5 px-4 text-right">
                                            <Link
                                                href={`/projects/${p._id}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="p-1 text-slate-400 hover:text-blue-600 inline-block"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Project Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create New Project"
            >
                <form onSubmit={handleCreateProject} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Malabar Bakery E-Commerce Website"
                            value={formData.projectName}
                            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Select Client *
                        </label>
                        <select
                            required
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                        >
                            <option value="">-- Choose Client --</option>
                            {clients.map((c) => (
                                <option key={c._id} value={c._id}>
                                    {c.clientName} ({c.businessName})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Service Type
                            </label>
                            <select
                                value={formData.serviceType}
                                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                            >
                                <option value="Web Design & Development">Web Design & Development</option>
                                <option value="E-Commerce Store">E-Commerce Store</option>
                                <option value="UI/UX Redesign">UI/UX Redesign</option>
                                <option value="Maintenance & Hosting">Maintenance & Hosting</option>
                                <option value="Custom Web App">Custom Web App</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Project Amount (₹) *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                placeholder="e.g. 25000"
                                value={formData.projectAmount}
                                onChange={(e) => setFormData({ ...formData, projectAmount: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-semibold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Target Completion Date
                            </label>
                            <input
                                type="date"
                                value={formData.targetCompletionDate}
                                onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Live Website URL (Optional)
                        </label>
                        <input
                            type="url"
                            placeholder="https://clientwebsite.com"
                            value={formData.liveUrl}
                            onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
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

export default function ProjectsPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Projects...</div>}>
            <ProjectsContent />
        </Suspense>
    );
}
