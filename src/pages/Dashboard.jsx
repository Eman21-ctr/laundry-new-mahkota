import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotePencil, Wallet, ListChecks, ChartPieSlice } from 'phosphor-react';
import useAuth from '../hooks/useAuth';
import { getDashboardStats } from '../services/transactions';
import { formatCurrency } from '../utils/formatters';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

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
            const dashboardStats = await getDashboardStats();
            setStats(dashboardStats);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: 'Catat Transaksi', icon: NotePencil, to: '/new-transaction', color: 'bg-blue-50 text-blue-600' },
        { label: 'Catat Pengeluaran', icon: Wallet, to: '/record-expense', color: 'bg-orange-50 text-orange-600' },
        { label: 'Daftar Transaksi', icon: ListChecks, to: '/transactions', color: 'bg-green-50 text-green-600' },
        { label: 'Laporan', icon: ChartPieSlice, to: '/reports', color: 'bg-purple-50 text-purple-600' },
    ];

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

                        <div className="max-w-4xl mx-auto px-6 pb-20 pt-4">
                            <div className="mb-4">
                                <h1 className="text-xl font-bold">
                                    Selamat Datang, {user?.profile?.full_name?.split(' ')[0] || 'Bosku'}!
                                </h1>
                                <p className="text-blue-100 text-sm mt-1">Semoga bisnis makin lancar 🚀</p>
                            </div>

                            {/* Main KPI */}
                            <div className="mt-4">
                                <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold mb-1">Pendapatan Bulan Ini</p>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                    {formatCurrency(stats.totalRevenue)}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Content Section (Overlapping) */}
                    <Container className="-mt-12 pb-6 space-y-4">
                        {/* Thematic Illustration */}
                        <div className="max-w-4xl mx-auto">
                            <Card className="overflow-hidden p-0 border-none shadow-xl rounded-2xl">
                                <img
                                    src="/dashboard-banner.png"
                                    alt="Professional Laundry Management"
                                    className="w-full h-28 md:h-40 object-cover"
                                />
                            </Card>
                        </div>

                        {/* 2x2 Menu Grid */}
                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-2 gap-3 px-2">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.to}
                                        onClick={() => navigate(action.to)}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
                                            <action.icon size={22} weight="fill" />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-700 leading-tight">
                                            {action.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
}
