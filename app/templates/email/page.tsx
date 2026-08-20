'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Save, RotateCcw, Copy, Check, Info, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_EMAIL_TEMPLATE = `Dear Sir,

We are pleased to inform you that your website project has been successfully completed and is now live.

Project Details

Project Completion Date: [PROJECT_COMPLETION_DATE]

Live Website

[PROJECT_LIVE_URL]

Source Code & Project Files

Complete Source Code:
[PROJECT_GITHUB_URL]

Hosting Details

Hosting Provider: [HOSTING_PROVIDER]

Domain Purchase Account

Registered Email: [DOMAIN_REGISTERED_EMAIL]

Free Support

A 7-day free support period is included from the project completion date ([PROJECT_COMPLETION_DATE]). During this period, we will provide assistance with fixes, technical support, and guidance related to the delivered website.

Contact Details

NYLEX – Web Design & Development

+91 89214 42748
buildwithnylex@gmail.com

Thank you for choosing NYLEX. We sincerely appreciate your trust and support. It was a pleasure working with you, and we look forward to serving you again in the future.

Kind Regards,

NYLEXWEB
Web Design & Development`;

export default function EmailTemplateEditorPage() {
    const [templateText, setTemplateText] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    const fetchTemplate = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/email-templates');
            const json = await res.json();
            if (json.success && json.data?.templateText) {
                setTemplateText(json.data.templateText);
            } else {
                setTemplateText(DEFAULT_EMAIL_TEMPLATE);
            }
        } catch (err) {
            toast.error('Failed to load email template');
            setTemplateText(DEFAULT_EMAIL_TEMPLATE);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplate();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/email-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateText }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success('Master email template saved!');
            } else {
                toast.error(json.error || 'Failed to save template');
            }
        } catch (err) {
            toast.error('Error saving template');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (confirm('Reset template text back to default NYLEX completion email format?')) {
            setTemplateText(DEFAULT_EMAIL_TEMPLATE);
            toast.info('Template reset to default format');
        }
    };

    const handleCopyTag = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        toast.success(`Copied tag: ${tag}`);
        setTimeout(() => setCopiedTag(null), 2000);
    };

    const TAGS = [
        { tag: '[PROJECT_COMPLETION_DATE]', label: 'Project Completion Date' },
        { tag: '[PROJECT_LIVE_URL]', label: 'Live Website URL' },
        { tag: '[PROJECT_GITHUB_URL]', label: 'GitHub Repository Link' },
        { tag: '[HOSTING_PROVIDER]', label: 'Hosting Provider Name' },
        { tag: '[DOMAIN_REGISTERED_EMAIL]', label: 'Domain Registered Email' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading email template editor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Mail className="w-5 h-5 text-purple-600" /> Project Completion Email Master Template
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Configure the template structure used when generating completion emails for clients.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset Default
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                    >
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>

            {/* Available Placeholders Guide */}
            <div className="bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-200">
                    <Info className="w-4 h-4 text-purple-600" /> Available Dynamic Replacement Tags:
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                    {TAGS.map((t) => (
                        <button
                            key={t.tag}
                            onClick={() => handleCopyTag(t.tag)}
                            className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-800 rounded-md font-mono text-[11px] text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 flex items-center gap-1.5 shadow-2xs"
                        >
                            <span>{t.tag}</span>
                            {copiedTag === t.tag ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                                <Copy className="w-3 h-3 text-slate-400" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Box */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Master Template Content (Markdown / Plain Text)
                </label>
                <textarea
                    rows={20}
                    value={templateText}
                    onChange={(e) => setTemplateText(e.target.value)}
                    className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                    >
                        {saving ? 'Saving...' : 'Save Template'}
                    </button>
                </div>
            </div>
        </div>
    );
}
