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
            // Client Statuses
            case 'Interested':
                return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
            case 'Follow-up':
                return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
            case 'Negotiation':
                return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
            case 'Confirmed':
                return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
            case 'Project Started':
            case 'In Progress':
                return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
            case 'Project Completed':
            case 'Completed':
            case 'Paid':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
            case 'Lost':
            case 'Not Interested':
                return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
            case 'Pending':
            case 'Draft':
                return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
            case 'Review':
            case 'Sent':
                return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

    return (
        <span
            className={`inline-flex items-center rounded-full border ${px} ${getBadgeStyle(
                status
            )} transition-colors duration-150`}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75" />
            {status}
        </span>
    );
};
