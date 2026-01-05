import React from 'react';

/**
 * Badge component for status display
 */
export default function Badge({ children, variant = 'default', className = '' }) {
    const variantClasses = {
        default: 'bg-slate-100 text-slate-700',
        proses: 'bg-amber-100 text-amber-700',
        selesai: 'bg-green-100 text-green-700',
        diambil: 'bg-gray-100 text-gray-700',
        owner: 'bg-primary-50 text-primary-700',
        kasir: 'bg-slate-100 text-slate-700',
        active: 'bg-green-50 text-green-700',
        inactive: 'bg-red-50 text-red-700',
        tunai: 'bg-blue-50 text-blue-700',
        qris: 'bg-purple-50 text-purple-700',
        transfer: 'bg-indigo-50 text-indigo-700',
    };

    return (
        <span
            className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
        ${variantClasses[variant] || variantClasses.default}
        ${className}
      `}
        >
            {children}
        </span>
    );
}
