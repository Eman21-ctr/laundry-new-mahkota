import React from 'react';

/**
 * Input component with label and error states
 */
export default function Input({
    label,
    error,
    type = 'text',
    className = '',
    containerClassName = '',
    ...props
}) {
    const inputClasses = `
    w-full h-10 px-3 py-2 text-sm
    border rounded
    transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    disabled:bg-slate-100 disabled:cursor-not-allowed
    ${error ? 'border-red-500' : 'border-slate-300'}
  `;

    return (
        <div className={`flex flex-col gap-1 ${containerClassName}`}>
            {label && (
                <label className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`${inputClasses} ${className}`}
                {...props}
            />
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </div>
    );
}
