'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Briefcase,
    User,
    Calendar,
    IndianRupee,
    Plus,
    FileText,
    Mail,
    Copy,
    Check,
    ExternalLink,
    Code,
    CreditCard,
    RefreshCw,
    Clock,
    Sparkles,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Log Payment Modal
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentType: 'Advance',
        paymentMethod: 'UPI',
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Completion Email Modal
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [copied, setCopied] = useState(false);
    const [emailTemplateData, setEmailTemplateData] = useState({
        completionDate: new Date().toISOString().split('T')[0],
        liveUrl: '',
        githubUrl: '',
        hostingProvider: '',
        domainRegisteredEmail: '',
    });

    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}`);
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                const proj = json.data.project;
                setEmailTemplateData({
                    completionDate: proj.startDate
                        ? new Date(proj.startDate).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0],
                    liveUrl: proj.liveUrl || 'https://example.com',
                    githubUrl: proj.githubUrl || 'https://github.com/nylex/repository',
                    hostingProvider: proj.hostingProvider || 'Vercel / Hostinger',
                    domainRegisteredEmail: proj.domainRegisteredEmail || 'client@example.com',
                });
            } else {
                toast.error(json.error || 'Failed to load project details');
            }
        } catch (err) {
            toast.error('Error fetching project');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const json = await res.json();
            if (json.success) {
                toast.success(`Project status updated to '${newStatus}'`);
                fetchProjectData();
            } else {
                toast.error(json.error || 'Failed to update status');
            }
        } catch (err) {
            toast.error('Error updating status');
        }
    };

    const handleLogPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
            toast.error('Valid payment amount is required.');
            return;
        }

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...paymentForm,
                    projectId: id,
                    clientId: data.project.clientId._id || data.project.clientId,
                }),
            });

            const json = await res.json();
            if (json.success) {
                toast.success('Payment recorded successfully!');
                setIsPaymentModalOpen(false);
                setPaymentForm({
                    amount: '',
                    paymentType: 'Advance',
                    paymentMethod: 'UPI',
                    date: new Date().toISOString().split('T')[0],
                    notes: '',
                });
                fetchProjectData();
            } else {
                toast.error(json.error || 'Failed to log payment');
            }
        } catch (err) {
            toast.error('Error logging payment');
        }
    };

    const handleGenerateEmail = async () => {
        try {
            const res = await fetch('/api/email-templates');
            const json = await res.json();
            let baseTemplate = json.data?.templateText;

            if (!baseTemplate) {
                baseTemplate = `Dear Sir,

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
            }

            const formattedDate = emailTemplateData.completionDate
                ? format(new Date(emailTemplateData.completionDate), 'dd MMMM yyyy')
                : format(new Date(), 'dd MMMM yyyy');

            // Replace tags
            let finalEmail = baseTemplate
                .replace(/\[PROJECT_COMPLETION_DATE\]/g, formattedDate)
                .replace(/\[PROJECT_LIVE_URL\]/g, emailTemplateData.liveUrl || 'N/A')
                .replace(/\[PROJECT_GITHUB_URL\]/g, emailTemplateData.githubUrl || 'N/A')
                .replace(/\[HOSTING_PROVIDER\]/g, emailTemplateData.hostingProvider || 'N/A')
                .replace(/\[DOMAIN_REGISTERED_EMAIL\]/g, emailTemplateData.domainRegisteredEmail || 'N/A');

            setGeneratedEmail(finalEmail);
            setIsEmailModalOpen(true);
        } catch (err) {
            toast.error('Failed to load email template');
        }
    };

    const handleCopyEmail = () => {
        navigator.clipboard.writeText(generatedEmail);
        setCopied(true);
        toast.success('Email copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-sm">Loading project details...</p>
            </div>
        );
    }

    if (!data?.project) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Project Not Found</h3>
                <button
                    onClick={() => router.push('/projects')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                >
                    Return to Projects
                </button>
            </div>
        );
    }

    const { project, payments, invoices, totalReceived, pendingAmount } = data;
    const client = project.clientId;

    return (
        <div className="space-y-6">
            {/* Top Header Controls */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.push('/projects')}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Projects
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                        <CreditCard className="w-3.5 h-3.5" /> Log Payment
                    </button>

                    <Link
                        href={`/invoices/new?projectId=${id}&clientId=${client?._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                        <FileText className="w-3.5 h-3.5" /> Create Invoice
                    </Link>

                    <button
                        onClick={handleGenerateEmail}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Generate Completion Email
                    </button>
                </div>
            </div>

            {/* Overview & Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                                {project.projectName}
                            </h1>
                            <StatusBadge status={project.status} />
                        </div>
                        <p className="text-xs font-medium text-slate-500 mt-1">
                            Client:{' '}
                            {client ? (
                                <Link
                                    href={`/clients/${client._id}`}
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    {client.clientName} ({client.businessName})
                                </Link>
                            ) : (
                                'N/A'
                            )}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-500">Project Status:</span>
                        <select
                            value={project.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="bg-transparent text-xs font-bold text-slate-900 dark:text-white cursor-pointer focus:outline-hidden"
                        >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Review">Review</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                {/* 3 Financial Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                            Total Project Amount
                        </span>
                        <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                            ₹{project.projectAmount.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
                            Total Received
                        </span>
                        <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                            ₹{totalReceived.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                        <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">
                            Pending Amount
                        </span>
                        <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                            ₹{pendingAmount.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment History */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                            Recorded Payments ({payments?.length || 0})
                        </h3>
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            + Add Payment
                        </button>
                    </div>

                    {payments?.length === 0 ? (
                        <p className="text-slate-400 text-xs py-4 text-center">
                            No payments logged for this project yet.
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {payments.map((pm: any) => (
                                <div
                                    key={pm._id}
                                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 flex items-center justify-between text-xs"
                                >
                                    <div>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            ₹{pm.amount.toLocaleString('en-IN')}
                                        </span>
                                        <span className="ml-2 font-medium text-slate-700 dark:text-slate-300">
                                            ({pm.paymentType})
                                        </span>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Method: {pm.paymentMethod} • {format(new Date(pm.date), 'dd MMM yyyy')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Links & Technical Config */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Deployment & Access Details
                    </h3>

                    <div className="space-y-3 text-xs">
                        <div>
                            <span className="text-slate-400 font-semibold block">Live Website URL</span>
                            {project.liveUrl ? (
                                <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
                                >
                                    {project.liveUrl} <ExternalLink className="w-3 h-3" />
                                </a>
                            ) : (
                                <span className="text-slate-400 italic">Not set</span>
                            )}
                        </div>

                        <div>
                            <span className="text-slate-400 font-semibold block">Source Code (GitHub)</span>
                            {project.githubUrl ? (
                                <a
                                    href={project.githubUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-800 dark:text-slate-200 font-medium hover:underline inline-flex items-center gap-1 mt-0.5"
                                >
                                    <Code className="w-3 h-3 text-slate-500" /> {project.githubUrl}
                                </a>
                            ) : (
                                <span className="text-slate-400 italic">Not set</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div>
                                <span className="text-slate-400 font-semibold block">Hosting Provider</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {project.hostingProvider || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-semibold block">Registered Domain Email</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {project.domainRegisteredEmail || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Log Payment Modal */}
            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Record Payment for Project"
            >
                <form onSubmit={handleLogPayment} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Payment Amount (₹) *
                        </label>
                        <input
                            type="number"
                            required
                            min="1"
                            placeholder="e.g. 5000"
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Payment Stage / Type
                            </label>
                            <select
                                value={paymentForm.paymentType}
                                onChange={(e) => setPaymentForm({ ...paymentForm, paymentType: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            >
                                <option value="Advance">Advance Payment</option>
                                <option value="Balance">Balance Payment</option>
                                <option value="Complete">Complete Payment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Payment Method
                            </label>
                            <select
                                value={paymentForm.paymentMethod}
                                onChange={(e) =>
                                    setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                            >
                                <option value="UPI">UPI</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Cash">Cash</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                            Payment Date
                        </label>
                        <input
                            type="date"
                            value={paymentForm.date}
                            onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                        >
                            Record Payment
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Generated Project Completion Email Modal */}
            <Modal
                isOpen={isEmailModalOpen}
                onClose={() => setIsEmailModalOpen(false)}
                title="Copy Ready Project Completion Email"
                maxWidth="xl"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                        <span>Dynamic tags replaced from project configuration. You can edit before copying.</span>
                        <button
                            onClick={handleCopyEmail}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-xs transition-colors shrink-0"
                        >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied!' : 'Copy Email'}
                        </button>
                    </div>

                    <textarea
                        rows={16}
                        value={generatedEmail}
                        onChange={(e) => setGeneratedEmail(e.target.value)}
                        className="w-full p-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-blue-500"
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsEmailModalOpen(false)}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
