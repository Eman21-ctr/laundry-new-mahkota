import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt as ReceiptIcon, ChartLine, Gear, Users, TrendUp, Package, Wallet } from 'phosphor-react';
import useAuth from '../hooks/useAuth';
import { getTodayStats } from '../services/transactions';
import { formatCurrency } from '../utils/formatters';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import IconBox from '../components/ui/IconBox';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwner = user?.profile?.is_owner;

    const [stats, setStats] = useState({
        totalTransactions: 0,
        totalRevenue: 0,
        activeOrders: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const todayStats = await getTodayStats();
            setStats(todayStats);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: 'Transaksi Baru', icon: Plus, to: '/new-transaction' },
        { label: 'Daftar Transaksi', icon: ReceiptIcon, to: '/transactions' },
        { label: 'Catat Pengeluaran', icon: Wallet, to: '/record-expense' },
        { label: 'Laporan', icon: ChartLine, to: '/reports' },
    ];

    // Add Owner-specific actions
    if (isOwner) {
        quickActions.push(
            { label: 'Kelola Staff', icon: Users, to: '/users' },
            { label: 'Pengaturan', icon: Gear, to: '/users' } // Both link to the same page which has tabs
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <div className="relative">
                    {/* Blue Hero Section (Full Bleed) */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-b-[40px] shadow-lg overflow-hidden">
                        <Header transparent />

                        <div className="max-w-4xl mx-auto px-6 pb-24 pt-4">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold">
                                    Selamat Datang, {user?.profile?.full_name?.split(' ')[0] || 'Bosku'}!
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">
                                    Semoga harimu menyenangkan dan bisnis makin lancar.
                                </p>
                            </div>

                            {/* Main KPI */}
                            <div className="mt-8">
                                <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold mb-1">Pendapatan Bulan Ini</p>
                                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                                    {formatCurrency(stats.totalRevenue)}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Content Section (Overlapping) */}
                    <Container className="-mt-16 pb-8 space-y-6">
                        {/* Thematic Illustration */}
                        <div className="max-w-4xl mx-auto">
                            <Card className="overflow-hidden p-0 border-none shadow-xl rounded-[32px]">
                                <img
                                    src="/dashboard-banner.png"
                                    alt="Professional Laundry Management"
                                    className="w-full h-48 md:h-64 object-cover"
                                />
                            </Card>
                        </div>

                        {/* Menu Grid - Standardized & Proportional */}
                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-3 gap-y-8 gap-x-2 px-6 py-4">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.to}
                                        onClick={() => navigate(action.to)}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-active:scale-95">
                                            <action.icon size={28} weight="fill" />
                                        </div>
                                        <span className="text-[10px] md:text-xs font-bold text-slate-600 text-center leading-tight">
                                            {action.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary Cards (Quick Stats) */}
                        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
                            <Card className="p-5 flex items-center gap-4 rounded-3xl">
                                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <ReceiptIcon size={24} weight="bold" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Transaksi</p>
                                    <p className="text-xl font-extrabold text-slate-900">{stats.totalTransactions}</p>
                                </div>
                            </Card>
                            <Card className="p-5 flex items-center gap-4 rounded-3xl">
                                <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                                    <Package size={24} weight="bold" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aktif</p>
                                    <p className="text-xl font-extrabold text-slate-900">{stats.activeOrders}</p>
                                </div>
                            </Card>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
}
