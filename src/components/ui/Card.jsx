import React from 'react';

/**
 * Card component - container with border and shadow
 */
export default function Card({ children, className = '', ...props }) {
    return (
        <div
            className={`bg-white border border-slate-200 rounded-md p-3 shadow-subtle ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
