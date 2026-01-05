import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function SummaryCards({ stats }) {
    const cards = [
        {
            label: 'Total Pemasukan',
            value: formatCurrency(stats.totalRevenue),
            variant: 'text-emerald-600'
        },
        {
            label: 'Total Pengeluaran',
            value: formatCurrency(stats.totalExpenses || 0),
            variant: 'text-red-600'
        },
        {
            label: 'Laba Bersih',
            value: formatCurrency(stats.netProfit || 0),
            variant: (stats.netProfit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'
        },
        {
            label: 'Total Transaksi',
            value: (stats.totalTransactions + (stats.totalExpenseCount || 0)).toString(),
            variant: 'text-slate-900',
            note: '(Masuk + Keluar)'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        {card.label}
                    </div>
                    <div className={`text-lg md:text-xl font-bold ${card.variant}`}>
                        {card.value}
                    </div>
                    {card.note && (
                        <div className="text-xs text-slate-400 mt-1">
                            {card.note}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
