import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase().replace(/[\s-]/g, '_');

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-semibold',
  }[size];

  switch (normalized) {
    case 'approved':
    case 'allotted':
    case 'active':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </span>
      );

    case 'pending':
    case 'applied':
    case 'under_review':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </span>
      );

    case 'rejected':
    case 'cancelled':
    case 'closed':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </span>
      );

    case 'waitlisted':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Waitlisted
        </span>
      );

    case 'transferred':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
          Transferred
        </span>
      );

    case 'vacated':
    case 'not_applied':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          {normalized === 'not_applied' ? 'Not Applied' : 'Vacated'}
        </span>
      );

    case 'maintenance':
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          Maintenance
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
