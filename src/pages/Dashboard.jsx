import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotePencil, Wallet, ListChecks, Receipt } from 'phosphor-react';
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
        { label: 'Daftar Transaksi', icon: ListChecks, to: '/transactions', color: 'bg-green-50 text-green-600', state: { defaultTab: 'pemasukan' } },
        { label: 'Daftar Pengeluaran', icon: Receipt, to: '/transactions', color: 'bg-purple-50 text-purple-600', state: { defaultTab: 'pengeluaran' } },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Navigation */}
            <Navigation />

            {/* Main Content */}
            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <div className="relative">
                    {/* Blue Hero Section (Full Bleed) */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-b-[32px] shadow-lg overflow-hidden">
                        <Header transparent />

                        <div className="max-w-4xl mx-auto px-6 pb-16 pt-2">
                            <div className="mb-3">
                                <h1 className="text-lg font-bold">
                                    Selamat Datang, {user?.profile?.full_name?.split(' ')[0] || 'Bosku'}!
                                </h1>
                                <p className="text-blue-100 text-xs mt-0.5">Semoga bisnis makin lancar 🚀</p>
                            </div>

                            {/* Main KPI */}
                            <div className="mt-3">
                                <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-0.5">Pendapatan Bulan Ini</p>
                                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                                    {formatCurrency(stats.totalRevenue)}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Content Section (Minimal Overlap) */}
                    <Container className="-mt-4 pb-4 space-y-3">
                        {/* Thematic Illustration */}
                        <div className="max-w-4xl mx-auto">
                            <Card className="overflow-hidden p-0 border-none shadow-lg rounded-xl">
                                <img
                                    src="/dashboard-banner.png"
                                    alt="Professional Laundry Management"
                                    className="w-full h-auto"
                                />
                            </Card>
                        </div>

                        {/* 2x2 Menu Grid */}
                        <div className="max-w-4xl mx-auto !mt-[100px]">
                            <div className="grid grid-cols-2 gap-2 px-1">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => navigate(action.to, { state: action.state })}
                                        className="flex items-center gap-2 p-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                                    >
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                                            <action.icon size={20} weight="fill" />
                                        </div>
                                        <span className="text-[11px] font-semibold text-slate-700 leading-tight">
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
