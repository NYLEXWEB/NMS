'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Layout,
    Search,
    Plus,
    ExternalLink,
    Code,
    Copy,
    Check,
    Edit,
    Trash2,
    Tag,
    RefreshCw,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';

const CATEGORIES = [
    'All',
    'General',
    'Photography',
    'Retail',
    'Real Estate',
    'Healthcare',
    'Education',
    'E-Commerce',
    'Restaurant',
    'Branding',
    'Other',
];

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        previewUrl: '',
        githubUrl: '',
        thumbnailUrl: '',
        description: '',
        tags: '',
    });

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams();
            if (search) query.append('search', search);
            if (categoryFilter && categoryFilter !== 'All') query.append('category', categoryFilter);

            const res = await fetch(`/api/templates?${query.toString()}`);
            const json = await res.json();
            if (json.success) {
                setTemplates(json.data);
            } else {
                toast.error(json.error || 'Failed to load templates');
            }
        } catch (err) {
            toast.error('Error loading templates');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [search, categoryFilter]);

    const handleOpenAdd = () => {
        setEditingTemplate(null);
        setFormData({
            title: '',
            category: 'General',
            previewUrl: '',
            githubUrl: '',
            thumbnailUrl: '',
            description: '',
            tags: '',
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (tpl: any) => {
        setEditingTemplate(tpl);
        setFormData({
            title: tpl.title || '',
            category: tpl.category || 'General',
            previewUrl: tpl.previewUrl || '',
            githubUrl: tpl.githubUrl || '',
            thumbnailUrl: tpl.thumbnailUrl || '',
            description: tpl.description || '',
            tags: Array.isArray(tpl.tags) ? tpl.tags.join(', ') : tpl.tags || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title) {
            toast.error('Template title is required.');
            return;
        }

        try {
            const url = editingTemplate ? `/api/templates/${editingTemplate._id}` : '/api/templates';
            const method = editingTemplate ? 'PUT' : 'POST';

            const payload = {
                ...formData,
                tags: formData.tags
                    ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
                    : [],
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (json.success) {
                toast.success(editingTemplate ? 'Template updated' : 'Template created');
                setIsModalOpen(false);
                fetchTemplates();
            } else {
                toast.error(json.error || 'Operation failed');
            }
        } catch (err) {
            toast.error('Error saving template');
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete template '${title}'?`)) return;

        try {
            const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.success('Template deleted');
                fetchTemplates();
            } else {
                toast.error(json.error || 'Failed to delete');
            }
        } catch (err) {
            toast.error('Error deleting template');
        }
    };

    const handleCopyLink = (text: string, idStr: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(idStr);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Top Header & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search templates by title or tags..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden"
                    />
                </div>

                <div className="flex items-center gap-2.5">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-2 px-3 font-semibold text-slate-700 focus:outline-hidden flex-1 sm:flex-initial"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                Category: {cat}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleOpenAdd}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Template
                    </button>
                </div>
            </div>

            {/* Grid of Templates */}
            {loading ? (
                <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                    Loading design template library...
                </div>
            ) : templates.length === 0 ? (
                <div className="p-12 text-center space-y-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                    <Layout className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-semibold text-slate-700">
                        No Templates Found
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Save portfolio templates & live demos to share quickly with potential clients.
                    </p>
                    <button
                        onClick={handleOpenAdd}
                        className="inline-flex items-center gap-1 px-3.5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                    >
                        <Plus className="w-4 h-4" /> Add First Template
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((tpl) => (
                        <div
                            key={tpl._id}
                            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                {/* Thumbnail Header */}
                                <div className="h-40 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                    {tpl.thumbnailUrl ? (
                                        <img
                                            src={tpl.thumbnailUrl}
                                            alt={tpl.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center p-4 text-slate-400">
                                            <Layout className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                                            <span className="text-[11px] font-semibold">NYLEX Design Preview</span>
                                        </div>
                                    )}
                                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-white/95 backdrop-blur-xs font-bold text-[10px] text-blue-600 rounded-md shadow-xs">
                                        {tpl.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <h3 className="font-bold text-base text-slate-900">
                                        {tpl.title}
                                    </h3>
                                    {tpl.description && (
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {tpl.description}
                                        </p>
                                    )}

                                    {tpl.tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {tpl.tags.map((tag: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md flex items-center gap-0.5"
                                                >
                                                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    {tpl.previewUrl && (
                                        <a
                                            href={tpl.previewUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" /> Demo
                                        </a>
                                    )}
                                    {tpl.previewUrl && (
                                        <button
                                            onClick={() => handleCopyLink(tpl.previewUrl, tpl._id)}
                                            className="p-1 text-slate-400 hover:text-slate-700"
                                            title="Copy Demo Link"
                                        >
                                            {copiedId === tpl._id ? (
                                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                            ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => handleOpenEdit(tpl)}
                                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-md"
                                        title="Edit Template"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tpl._id, tpl.title)}
                                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                                        title="Delete Template"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Template Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTemplate ? 'Edit Design Template' : 'Add Design Template'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Template Title *
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Minimalist Photography Portfolio"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                            >
                                {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Live Preview URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://template-demo.vercel.app"
                                value={formData.previewUrl}
                                onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                GitHub Repository URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://github.com/nylex/template"
                                value={formData.githubUrl}
                                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Thumbnail Image URL
                            </label>
                            <input
                                type="url"
                                placeholder="https://images.unsplash.com/..."
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Tags (Comma separated)
                        </label>
                        <input
                            type="text"
                            placeholder="Next.js, Tailwind, Dark Mode, Minimal"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Description / Client Pitch Notes
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Highlight features like fast loading speed, mobile responsive design..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                            {editingTemplate ? 'Save Changes' : 'Create Template'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
