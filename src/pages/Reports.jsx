import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import SummaryCards from '../components/reports/SummaryCards';
import ItemBreakdown from '../components/reports/ItemBreakdown';
import { getReportStats } from '../services/transactions';
import { getExpenseStats } from '../services/expenses';
import { startOfMonth, endOfMonth, startOfToday, endOfToday, format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Calendar, Funnel, FileArrowDown } from 'phosphor-react';
import Button from '../components/ui/Button';

export default function Reports() {
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    });
    const [activeFilter, setActiveFilter] = useState('month'); // 'today', 'month', 'custom'

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        setLoading(true);
        try {
            // Use start of the start day and end of the end day
            const startStr = new Date(dateRange.start);
            startStr.setHours(0, 0, 0, 0);

            const endStr = new Date(dateRange.end);
            endStr.setHours(23, 59, 59, 999);

            const [transactionData, expenseData] = await Promise.all([
                getReportStats(startStr.toISOString(), endStr.toISOString()),
                getExpenseStats(startStr.toISOString(), endStr.toISOString())
            ]);

            setStats({
                ...transactionData,
                totalExpenses: expenseData.totalExpenses,
                totalExpenseCount: expenseData.count || 0,
                netProfit: transactionData.totalRevenue - expenseData.totalExpenses,
                expenseBreakdown: expenseData.categoryBreakdown
            });
        } catch (error) {
            console.error('Error fetching report:', error);
            alert('Gagal mengambil data laporan');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    const handleQuickFilter = (type) => {
        setActiveFilter(type);
        if (type === 'custom') return;

        let start, end;
        const now = new Date();

        switch (type) {
            case 'today':
                start = startOfToday();
                end = endOfToday();
                break;
            case 'month':
                start = startOfMonth(now);
                end = endOfMonth(now);
                break;
            default:
                return;
        }

        setDateRange({
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd'),
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header />

                <Container className="flex-1 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Laporan</h1>
                            <p className="text-slate-500 text-sm">Analisis pendapatan dan performa laundry</p>
                        </div>

                        <div className="bg-white p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                            {['today', 'month', 'custom'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleQuickFilter(type)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === type
                                            ? 'bg-primary-500 text-white shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {type === 'today' && 'Hari Ini'}
                                    {type === 'month' && 'Bulan Ini'}
                                    {type === 'custom' && 'Custom'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Filters (Only show if Custom) */}
                    {activeFilter === 'custom' && (
                        <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 flex flex-col sm:flex-row items-end gap-4 shadow-sm animate-fade-in">
                            <div className="flex-1 w-full sm:w-auto">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mulai Dari</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-3 h-10 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 w-full sm:w-auto">
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sampai Dengan</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        className="w-full pl-10 pr-3 h-10 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <Button variant="primary" onClick={fetchReport} loading={loading} className="w-full sm:w-auto">
                                <Funnel size={18} weight="bold" />
                                Filter
                            </Button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : stats ? (
                        <div className="space-y-6">
                            <SummaryCards stats={stats} />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-1">
                                    <ItemBreakdown breakdown={stats.itemTypeBreakdown} />
                                </div>
                                <div className="lg:col-span-2 space-y-4">
                                    <div className="bg-white p-4 rounded-lg border border-slate-200 h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-sm font-bold text-slate-900">Daftar Transaksi Terakhir</h2>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary-600"
                                                onClick={() => {
                                                    if (!stats?.transactions?.length) return;
                                                    const headers = ['No. Transaksi', 'Pelanggan', 'HP', 'Status', 'Total', 'Bayar', 'Tgl Masuk'];
                                                    const rows = stats.transactions.map(t => [
                                                        t.transaction_number,
                                                        t.customer_name,
                                                        t.customer_phone,
                                                        t.status,
                                                        t.total_amount,
                                                        t.paid_amount,
                                                        new Date(t.date_in).toLocaleDateString()
                                                    ]);
                                                    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
                                                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                                    const url = URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.setAttribute('href', url);
                                                    link.setAttribute('download', `laporan-laundry-${dateRange.start}-ke-${dateRange.end}.csv`);
                                                    link.style.visibility = 'hidden';
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }}
                                            >
                                                <FileArrowDown size={18} /> Ekspor CSV
                                            </Button>
                                        </div>
                                        <div className="text-center py-12 text-slate-400 text-sm">
                                            Daftar rincian transaksi ditampilkan di menu Transaksi.<br />
                                            Gunakan filter di menu tersebut untuk rincian data lebih lengkap.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </Container>
            </div>
        </div>
    );
}
