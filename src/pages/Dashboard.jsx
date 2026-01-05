import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt as ReceiptIcon, ChartLine, Gear, Users, TrendUp, Package, Clock, Wallet } from 'phosphor-react';
import useAuth from '../hooks/useAuth';
import { getTodayStats, getTransactions } from '../services/transactions';
import { formatCurrency, formatDate, getRelativeTime } from '../utils/formatters';
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
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const todayStats = await getTodayStats();
            setStats(todayStats);

            const recent = await getTransactions({ limit: 5 });
            setRecentTransactions(recent);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        { label: 'Transaksi Baru', icon: Plus, to: '/new-transaction', variant: 'primary' },
        { label: 'Catat Pengeluaran', icon: Wallet, to: '/record-expense', variant: 'danger' },
        { label: 'Lihat Transaksi', icon: ReceiptIcon, to: '/transactions' },
        { label: 'Laporan', icon: ChartLine, to: '/reports' },
        { label: 'Pengaturan', icon: Gear, to: '/settings' },
    ];

    // Add Users action for owner only
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

                <Container className="flex-1 py-4 section-gap">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        <Card className="text-center">
                            <IconBox icon={ReceiptIcon} variant="secondary" size="sm" className="mx-auto mb-2" />
                            <p className="text-xs text-slate-600 mb-1">Transaksi Hari Ini</p>
                            <p className="text-xl md:text-2xl font-bold text-slate-900">
                                {stats.totalTransactions}
                            </p>
                        </Card>

                        <Card className="text-center">
                            <IconBox icon={TrendUp} variant="secondary" size="sm" className="mx-auto mb-2" />
                            <p className="text-xs text-slate-600 mb-1">Pendapatan Hari Ini</p>
                            <p className="text-base md:text-lg font-bold text-slate-900">
                                {formatCurrency(stats.totalRevenue)}
                            </p>
                        </Card>

                        <Card className="text-center">
                            <IconBox icon={Package} variant="secondary" size="sm" className="mx-auto mb-2" />
                            <p className="text-xs text-slate-600 mb-1">Pesanan Aktif</p>
                            <p className="text-xl md:text-2xl font-bold text-slate-900">
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

                    {/* Recent Transactions */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-slate-900">Transaksi Terbaru</h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/transactions')}
                            >
                                Lihat Semua
                            </Button>
                        </div>

                        {loading ? (
                            <Card className="text-center py-8 text-slate-600">
                                Memuat...
                            </Card>
                        ) : recentTransactions.length === 0 ? (
                            <Card className="text-center py-8 text-slate-600">
                                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Belum ada transaksi hari ini</p>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {recentTransactions.map((transaction) => (
                                    <Card
                                        key={transaction.id}
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => navigate(`/transactions/${transaction.id}`)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-semibold text-slate-900 text-sm">
                                                        {transaction.transaction_number}
                                                    </p>
                                                    <Badge variant={transaction.status}>
                                                        {transaction.status}
                                                    </Badge>
                                                </div>
                                                <p className="font-medium text-slate-700">
                                                    {transaction.customer_name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {getRelativeTime(transaction.created_at)}
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-slate-900">
                                                    {formatCurrency(transaction.total_amount)}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {transaction.transaction_items?.length || 0} item
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </div>
        </div>
    );
}
