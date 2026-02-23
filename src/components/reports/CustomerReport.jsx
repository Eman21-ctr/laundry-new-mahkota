import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { MagnifyingGlass, User, Receipt, TrendUp } from 'phosphor-react';

export default function CustomerReport({ transactions }) {
    const [search, setSearch] = useState('');

    const customerStats = useMemo(() => {
        const stats = {};

        transactions.forEach(t => {
            const customerId = t.customer_id || t.customer_phone || t.customer_name;
            if (!stats[customerId]) {
                stats[customerId] = {
                    id: customerId,
                    name: t.customer_name,
                    phone: t.customer_phone,
                    totalSpent: 0,
                    transactionCount: 0,
                };
            }
            stats[customerId].totalSpent += parseFloat(t.total_amount);
            stats[customerId].transactionCount += 1;
        });

        return Object.values(stats)
            .map(s => ({
                ...s,
                averagePerTransaction: s.totalSpent / s.transactionCount
            }))
            .sort((a, b) => b.totalSpent - a.totalSpent);
    }, [transactions]);

    const filteredStats = useMemo(() => {
        if (!search) return customerStats;
        const lowSearch = search.toLowerCase();
        return customerStats.filter(s =>
            s.name.toLowerCase().includes(lowSearch) ||
            (s.phone && s.phone.includes(lowSearch))
        );
    }, [customerStats, search]);

    if (customerStats.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                <p className="text-slate-500">Tidak ada data transaksi pelanggan untuk periode ini.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User size={18} className="text-primary-500" />
                    Laporan Transaksi Pelanggan
                </h2>

                <div className="relative">
                    <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Cari pelanggan..."
                        className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full md:w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pelanggan</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Transaksi</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Rata-rata</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total Belanja</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredStats.map((stat, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                            {stat.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700">{stat.name}</p>
                                            <p className="text-xs text-slate-400">{stat.phone || '-'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                                        <Receipt size={14} />
                                        {stat.transactionCount}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <p className="text-sm text-slate-600 font-medium">{formatCurrency(stat.averagePerTransaction)}</p>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-bold text-slate-900">{formatCurrency(stat.totalSpent)}</p>
                                        {index === 0 && (
                                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold uppercase mt-0.5">
                                                <TrendUp size={10} /> top spender
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredStats.length === 0 && (
                <div className="p-8 text-center">
                    <p className="text-slate-500 text-sm">Tidak ada pelanggan yang cocok dengan pencarian.</p>
                </div>
            )}

            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center whitespace-nowrap">
                <span className="font-bold text-slate-900 text-sm">Total Pelanggan</span>
                <span className="font-bold text-primary-600 text-sm">
                    {filteredStats.length} orang
                </span>
            </div>
        </div>
    );
}
