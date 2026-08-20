'use client';

import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, Building, Phone, Mail, Globe, MapPin, FileText, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        companyName: 'NYLEX',
        businessName: 'NYLEXWEB',
        phone: '+91 89214 42748',
        email: 'buildwithnylex@gmail.com',
        website: 'https://nylexweb.com',
        address: 'Kerala, India',
        taxId: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings');
            const json = await res.json();
            if (json.success && json.data) {
                setFormData({
                    companyName: json.data.companyName || 'NYLEX',
                    businessName: json.data.businessName || 'NYLEXWEB',
                    phone: json.data.phone || '+91 89214 42748',
                    email: json.data.email || 'buildwithnylex@gmail.com',
                    website: json.data.website || 'https://nylexweb.com',
                    address: json.data.address || 'Kerala, India',
                    taxId: json.data.taxId || '',
                });
            }
        } catch (err) {
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Company settings saved successfully');
            } else {
                toast.error(json.error || 'Failed to save settings');
            }
        } catch (err) {
            toast.error('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading system settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-blue-600" /> Company Settings & Branding
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Configure contact details used in generated invoices, completion emails, and system branding.
                    </p>
                </div>
            </div>

            {/* Form Card */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Company Name (Brand Header) *
                        </label>
                        <div className="relative">
                            <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Business Legal Name (Billed From) *
                        </label>
                        <div className="relative">
                            <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={formData.businessName}
                                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Primary Phone Number *
                        </label>
                        <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Official Email Address *
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Website URL
                        </label>
                        <div className="relative">
                            <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            GSTIN / Tax ID (Optional)
                        </label>
                        <div className="relative">
                            <FileText className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={formData.taxId}
                                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                placeholder="e.g. 32AAAAA0000A1Z5"
                                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Office Address / Location
                    </label>
                    <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <textarea
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs font-medium"
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
