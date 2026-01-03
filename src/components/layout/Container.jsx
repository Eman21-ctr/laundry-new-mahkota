import React from 'react';

/**
 * Container component with consistent padding
 */
export default function Container({ children, className = '' }) {
    return (
        <div className={`container-padding mx-auto ${className}`}>
            {children}
        </div>
    );
}
