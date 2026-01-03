import React from 'react';
import { PhosphorLogo } from 'phosphor-react';

/**
 * IconBox - Premium icon wrapper component
 * Renders icons in rounded boxes with two style variants
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Phosphor icon component
 * @param {'primary' | 'secondary'} props.variant - Style variant
 * @param {'sm' | 'md' | 'lg'} props.size - Size variant
 * @param {string} props.className - Additional CSS classes
 */
export default function IconBox({
    icon: Icon,
    variant = 'primary',
    size = 'md',
    className = ''
}) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const variantClasses = {
        primary: 'bg-primary-500 text-white shadow-icon',
        secondary: 'bg-primary-50 text-primary-500 border border-slate-200',
    };

    return (
        <div
            className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        rounded-md flex items-center justify-center flex-shrink-0
        ${className}
      `}
        >
            {Icon && <Icon size={iconSizes[size]} weight="regular" />}
        </div>
    );
}
