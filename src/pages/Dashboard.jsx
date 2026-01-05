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
        { label: 'Transaksi Baru', icon: Plus, to: '/new-transaction', variant: 'primary' },
        { label: 'Catat Pengeluaran', icon: Wallet, to: '/record-expense', variant: 'danger' },
        { label: 'Daftar Transaksi', icon: ReceiptIcon, to: '/transactions' },
        { label: 'Laporan', icon: ChartLine, to: '/reports' },
    ];

    // Add Pengguna/Pengaturan action for owner only
    if (isOwner) {
        quickActions.push({ label: 'Pengguna', icon: Users, to: '/users' });
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header />

                <div className="relative">
                    {/* Blue Hero Section */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-8 pb-32 px-4 rounded-b-[40px] shadow-lg">
                        <div className="max-w-4xl mx-auto">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold">
                                    Selamat Datang, {user?.profile?.full_name?.split(' ')[0] || 'Bosku'}! 👋
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
                    <Container className="-mt-24 pb-8 space-y-6">
                        {/* Thematic Illustration */}
                        <div className="max-w-4xl mx-auto">
                            <Card className="overflow-hidden p-0 border-none shadow-xl">
                                <img
                                    src="/dashboard-banner.png"
                                    alt="Professional Laundry Management"
                                    className="w-full h-48 md:h-64 object-cover"
                                />
                            </Card>
                        </div>

                        {/* Menu Grid */}
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 px-2">Menu Utama</h2>
                            <div className="grid grid-cols-4 gap-4 px-2">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.to}
                                        onClick={() => navigate(action.to)}
                                        className="flex flex-col items-center gap-2 group"
                                    >
                                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 shadow-sm bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-active:scale-95">
                                            <action.icon size={28} weight="fill" />
                                        </div>
                                        <span className="text-[10px] md:text-xs font-semibold text-slate-600 text-center leading-tight">
                                            {action.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary Cards (Quick Stats) */}
                        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4">
                            <Card className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                    <ReceiptIcon size={20} weight="bold" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Transaksi</p>
                                    <p className="text-lg font-extrabold text-slate-900">{stats.totalTransactions}</p>
                                </div>
                            </Card>
                            <Card className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <Package size={20} weight="bold" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Pesanan Aktif</p>
                                    <p className="text-lg font-extrabold text-slate-900">{stats.activeOrders}</p>
                                </div>
                            </Card>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
}
