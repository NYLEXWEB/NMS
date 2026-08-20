import React from 'react';

type BadgeType =
    | 'Interested'
    | 'Follow-up'
    | 'Negotiation'
    | 'Confirmed'
    | 'Project Started'
    | 'Project Completed'
    | 'Lost'
    | 'Not Interested'
    | 'Pending'
    | 'In Progress'
    | 'Review'
    | 'Completed'
    | 'Paid'
    | 'Unpaid'
    | 'Sent'
    | 'Draft'
    | string;

interface StatusBadgeProps {
    status: BadgeType;
    size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
    const getBadgeStyle = (statusStr: string) => {
        switch (statusStr) {
            case 'Interested':
                return 'bg-blue-50 text-blue-700 border-blue-200/80 dot-blue-500';
            case 'Follow-up':
                return 'bg-amber-50 text-amber-700 border-amber-200/80 dot-amber-500';
            case 'Negotiation':
                return 'bg-purple-50 text-purple-700 border-purple-200/80 dot-purple-500';
            case 'Confirmed':
                return 'bg-teal-50 text-teal-700 border-teal-200/80 dot-teal-500';
            case 'Project Started':
            case 'In Progress':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 dot-indigo-500';
            case 'Project Completed':
            case 'Completed':
            case 'Paid':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dot-emerald-500';
            case 'Unpaid':
            case 'Lost':
            case 'Not Interested':
                return 'bg-rose-50 text-rose-700 border-rose-200/80 dot-rose-500';
            case 'Pending':
            case 'Draft':
                return 'bg-slate-100 text-slate-700 border-slate-200/80 dot-slate-400';
            case 'Review':
            case 'Sent':
                return 'bg-sky-50 text-sky-700 border-sky-200/80 dot-sky-500';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-200 dot-slate-400';
        }
    };

    const getDotColor = (statusStr: string) => {
        switch (statusStr) {
            case 'Interested': return 'bg-blue-500';
            case 'Follow-up': return 'bg-amber-500';
            case 'Negotiation': return 'bg-purple-500';
            case 'Confirmed': return 'bg-teal-500';
            case 'Project Started':
            case 'In Progress': return 'bg-indigo-500';
            case 'Project Completed':
            case 'Completed':
            case 'Paid': return 'bg-emerald-500';
            case 'Unpaid':
            case 'Lost':
            case 'Not Interested': return 'bg-rose-500';
            case 'Pending':
            case 'Draft': return 'bg-slate-400';
            case 'Review':
            case 'Sent': return 'bg-sky-500';
            default: return 'bg-slate-400';
        }
    };

    const px = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

    return (
        <span
            className={`inline-flex items-center gap-1.5 font-bold rounded-full border ${px} ${getBadgeStyle(
                status
            )} shadow-2xs transition-all duration-150`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(status)} shrink-0`} />
            <span>{status}</span>
        </span>
    );
};
