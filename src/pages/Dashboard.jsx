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

                <Container className="flex-1 py-6 section-gap">
                    {/* Welcome Message */}
                    <div className="mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Selamat Datang, {user?.profile?.full_name?.split(' ')[0] || 'Bosku'}! 👋
                        </h1>
                        <p className="text-slate-600 mt-1">
                            Semoga harimu menyenangkan dan bisnis makin lancar.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <Card className="text-center p-3 md:p-4">
                            <IconBox icon={ReceiptIcon} variant="secondary" size="sm" className="mx-auto mb-2" />
                            <p className="text-xs text-slate-500 mb-1">Transaksi</p>
                            <p className="text-lg md:text-xl font-bold text-slate-900">
                                {stats.totalTransactions}
                            </p>
                        </Card>

                        <Card className="text-center p-3 md:p-4">
                            <IconBox icon={TrendUp} variant="secondary" size="sm" className="mx-auto mb-2" />
                            <p className="text-xs text-slate-500 mb-1">Pendapatan</p>
                            <p className="text-lg md:text-xl font-bold text-slate-900">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </Card>

                        <Card className="text-center p-3 md:p-4">
                            <IconBox icon={Package} variant="secondary" size="sm" className="mx-auto mb-2" />
                            <p className="text-xs text-slate-500 mb-1">Aktif</p>
                            <p className="text-lg md:text-xl font-bold text-slate-900">
                                {stats.activeOrders}
                            </p>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 mb-3">Aksi Cepat</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {quickActions.map((action) => (
                                <Button
                                    key={action.to}
                                    variant={action.variant || 'secondary'}
                                    onClick={() => navigate(action.to)}
                                    className="h-auto py-4 flex-col"
                                >
                                    <action.icon size={24} className="mb-2" />
                                    <span className="text-xs">{action.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>

                </Container>
            </div>
        </div>
    );
}
