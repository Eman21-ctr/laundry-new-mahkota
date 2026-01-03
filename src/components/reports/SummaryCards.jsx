import React from 'react';
import { Receipt, Money, Scales, ChartBar } from 'phosphor-react';
import IconBox from '../ui/IconBox';
import { formatCurrency } from '../../utils/formatters';

export default function SummaryCards({ stats }) {
    const cards = [
        {
            label: 'Total Transaksi',
            value: stats.totalTransactions,
            icon: Receipt,
            variant: 'primary',
            suffix: ''
        },
        {
            label: 'Total Pendapatan',
            value: formatCurrency(stats.totalRevenue),
            icon: Money,
            variant: 'success',
            suffix: ''
        },
        {
            label: 'Total Berat',
            value: stats.totalWeight.toFixed(2),
            icon: Scales,
            variant: 'warning',
            suffix: ' kg'
        },
        {
            label: 'Rata-rata/Transaksi',
            value: formatCurrency(stats.averagePerTransaction),
            icon: ChartBar,
            variant: 'info',
            suffix: ''
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <IconBox icon={card.icon} variant={card.variant} size="sm" />
                        <span className="text-xs font-medium text-slate-500 line-clamp-1">{card.label}</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900 truncate">
                        {card.value}{card.suffix}
                    </div>
                </div>
            ))}
        </div>
    );
}
