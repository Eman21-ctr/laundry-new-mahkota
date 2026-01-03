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

            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-4 py-2 font-semibold text-slate-600">Layanan</th>
                        <th className="px-4 py-2 font-semibold text-slate-600 text-right">Qty</th>
                        <th className="px-4 py-2 font-semibold text-slate-600 text-right">Pendapatan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-2 text-slate-700">{item.label}</td>
                            <td className="px-4 py-2 text-right text-slate-600">{item.quantity}</td>
                            <td className="px-4 py-2 text-right font-medium text-slate-900">
                                {formatCurrency(item.subtotal)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold">
                    <tr>
                        <td className="px-4 py-2 text-slate-900">Total</td>
                        <td className="px-4 py-2 text-right text-slate-900">
                            {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </td>
                        <td className="px-4 py-2 text-right text-primary-600">
                            {formatCurrency(items.reduce((sum, item) => sum + item.subtotal, 0))}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
