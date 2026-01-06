import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function ItemBreakdown({ breakdown }) {
    const items = Object.entries(breakdown).map(([key, data]) => ({
        type: key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        quantity: data.quantity,
        subtotal: data.subtotal,
    })).sort((a, b) => b.subtotal - a.subtotal);

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <p className="text-slate-500">Tidak ada data untuk rincian item.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-sm font-bold text-slate-900">Rincian per Layanan</h2>
            </div>

            <div className="divide-y divide-slate-100">
                {items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                            <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                            <p className="text-xs text-slate-500">{item.quantity} transaksi</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{formatCurrency(item.subtotal)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-900 text-sm">Total</span>
                <span className="font-bold text-primary-600 text-sm">
                    {formatCurrency(items.reduce((sum, item) => sum + item.subtotal, 0))}
                </span>
            </div>
        </div>
    );
}
