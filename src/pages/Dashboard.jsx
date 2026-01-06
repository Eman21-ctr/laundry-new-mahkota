import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt as ReceiptIcon, ChartLine } from 'phosphor-react';
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
        { label: 'Daftar Transaksi', icon: ReceiptIcon, to: '/transactions' },
        { label: 'Laporan', icon: ChartLine, to: '/reports' },
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

                        <div className="max-w-4xl mx-auto px-6 pb-24 pt-4">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold">
                                    Selamat Datang, {user?.profile?.full_name?.split(' ')[0] || 'Bosku'}!
                                </h1>
                                <div className="text-blue-100 text-sm mt-1 leading-relaxed">
                                    <p>Semoga harimu menyenangkan</p>
                                    <p>dan bisnis makin lancar.</p>
                                </div>
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
                            <Card className="overflow-hidden p-0 border-none shadow-xl rounded-[24px]">
                                <img
                                    src="/dashboard-banner.png"
                                    alt="Professional Laundry Management"
                                    className="w-full h-32 md:h-48 object-cover"
                                />
                            </Card>
                        </div>

                        {/* Compact Menu Grid */}
                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-2 gap-3 px-4">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.to}
                                        onClick={() => navigate(action.to)}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm group hover:shadow-md transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <action.icon size={20} weight="fill" />
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">
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
