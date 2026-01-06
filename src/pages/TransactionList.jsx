import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlass, Funnel, Trash, Pencil, Wallet, ArrowLeft } from 'phosphor-react';
import { format } from 'date-fns';
import { getTransactions } from '../services/transactions';
import { getExpenses, deleteExpense } from '../services/expenses';
import { formatCurrency, formatDate } from '../utils/formatters';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function TransactionList() {
    const navigate = useNavigate();
    const location = useLocation();

    // Main Tab State: 'pemasukan' | 'pengeluaran'
    const [mainTab, setMainTab] = useState(location.state?.defaultTab || 'pemasukan');

    // Data State
    const [transactions, setTransactions] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters State
    const [statusTab, setStatusTab] = useState('semua');
    const [paymentStatusTab, setPaymentStatusTab] = useState('semua'); // 'semua' | 'lunas' | 'belum_lunas'
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (mainTab === 'pemasukan') {
            loadTransactions();
        } else {
            loadExpenses();
        }
    }, [mainTab]);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await getTransactions({ limit: 100 });
            setTransactions(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            // Limit 100 recent expenses
            const data = await getExpenses({ limit: 100 });
            setExpenses(data);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) return;
        try {
            await deleteExpense(id);
            loadExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Gagal menghapus pengeluaran');
        }
    };

    // Derived State: Filtered Data
    const getFilteredTransactions = () => {
        let filtered = [...transactions];
        if (statusTab !== 'semua') {
            filtered = filtered.filter(t => t.status === statusTab);
        }
        if (paymentStatusTab === 'lunas') {
            filtered = filtered.filter(t => t.paid_amount >= t.total_amount);
        } else if (paymentStatusTab === 'belum_lunas') {
            filtered = filtered.filter(t => t.paid_amount < t.total_amount);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.transaction_number.toLowerCase().includes(query) ||
                t.customer_name.toLowerCase().includes(query) ||
                t.customer_phone.includes(query)
            );
        }
        return filtered;
    };

    const getFilteredExpenses = () => {
        let filtered = [...expenses];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                (e.description && e.description.toLowerCase().includes(query)) ||
                e.category.toLowerCase().includes(query)
            );
        }
        return filtered;
    };

    const filteredTransactions = getFilteredTransactions();
    const filteredExpenses = getFilteredExpenses();

    const transactionTabs = [
        { value: 'semua', label: 'Semua' },
        { value: 'proses', label: 'Proses' },
        { value: 'selesai', label: 'Selesai' },
        { value: 'diambil', label: 'Diambil' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row no-print">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header transparent={true} />

                {/* World-Class Header Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white pb-10 pt-20 -mt-20 px-6 shadow-lg relative overflow-hidden mb-6">
                    <div className="max-w-4xl mx-auto flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} weight="bold" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {mainTab === 'pemasukan' ? 'Daftar Transaksi' : 'Daftar Pengeluaran'}
                            </h1>
                            <p className="text-blue-100 text-sm">
                                {mainTab === 'pemasukan' ? 'Kelola pemasukan laundry' : 'Kelola pengeluaran operasional'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 w-full">

                    {/* Filter Section */}
                    {mainTab === 'pemasukan' && (
                        <div className="mb-6 space-y-6">
                            {/* Status Pesanan Tabs */}
                            <div>
                                <h3 className="text-center text-sm font-semibold text-slate-500 mb-3">Status Pesanan</h3>
                                <div className="flex justify-center border-b border-slate-200 overflow-x-auto">
                                    <div className="flex space-x-2">
                                        {transactionTabs.map((tab) => (
                                            <button
                                                key={tab.value}
                                                onClick={() => setStatusTab(tab.value)}
                                                className={`
                                                    px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                                    ${statusTab === tab.value
                                                        ? 'border-blue-600 text-blue-600'
                                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                                    }
                                                `}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Status Pembayaran Tabs */}
                            <div>
                                <h3 className="text-center text-sm font-semibold text-slate-500 mb-3">Status Pembayaran</h3>
                                <div className="flex justify-center border-b border-slate-200 overflow-x-auto">
                                    <div className="flex space-x-2">
                                        {[
                                            { value: 'semua', label: 'Semua' },
                                            { value: 'lunas', label: 'Lunas' },
                                            { value: 'belum_lunas', label: 'Belum Lunas' },
                                        ].map((tab) => (
                                            <button
                                                key={tab.value}
                                                onClick={() => setPaymentStatusTab(tab.value)}
                                                className={`
                                                    px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                                    ${paymentStatusTab === tab.value
                                                        ? 'border-emerald-600 text-emerald-600'
                                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                                    }
                                                `}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search */}
                    <div className="relative mb-6">
                        <MagnifyingGlass
                            size={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={mainTab === 'pemasukan' ? "Cari nomor, nama, atau HP..." : "Cari keterangan atau kategori..."}
                            className="w-full h-11 pl-10 pr-3 bg-white border border-slate-300 rounded-lg text-sm shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                        />
                    </div>

                    {/* Content Area */}
                    {loading ? (
                        <Card className="text-center py-8 text-slate-600">
                            Memuat data...
                        </Card>
                    ) : (
                        <>
                            {/* TRANSACTION LIST */}
                            {mainTab === 'pemasukan' && (
                                <>
                                    {filteredTransactions.length === 0 ? (
                                        <Card className="text-center py-8 text-slate-600">
                                            {searchQuery ? 'Tidak ada transaksi yang cocok' : 'Belum ada transaksi'}
                                        </Card>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredTransactions.map((transaction) => (
                                                <Card
                                                    key={transaction.id}
                                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                                    onClick={() => navigate(`/transactions/${transaction.id}`)}
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center flex-wrap gap-2 mb-1">
                                                                    <p className="font-semibold text-slate-900 text-xs">
                                                                        {transaction.transaction_number}
                                                                    </p>
                                                                    <Badge variant={transaction.status} className="scale-90 origin-left">
                                                                        {transaction.status}
                                                                    </Badge>
                                                                    <Badge
                                                                        variant={transaction.paid_amount >= transaction.total_amount ? 'lunas' : 'belum_lunas'}
                                                                        className="scale-90 origin-left"
                                                                    >
                                                                        {transaction.paid_amount >= transaction.total_amount ? 'LUNAS' : 'BELUM LUNAS'}
                                                                    </Badge>
                                                                    {transaction.payment_method && (
                                                                        <Badge variant={transaction.payment_method.toLowerCase()}>
                                                                            {transaction.payment_method}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <p className="font-medium text-slate-700">
                                                                    {transaction.customer_name}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {transaction.customer_phone}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="font-bold text-slate-900">
                                                                    {formatCurrency(transaction.total_amount)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                                                            <span>{transaction.transaction_items?.length || 0} item</span>
                                                            <span>{formatDate(transaction.date_in, 'short')}</span>
                                                            <span>Selesai: {formatDate(transaction.date_out, 'short')}</span>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* EXPENSE LIST */}
                            {mainTab === 'pengeluaran' && (
                                <>
                                    {filteredExpenses.length === 0 ? (
                                        <Card className="text-center py-8 text-slate-600">
                                            <Wallet size={32} className="mx-auto mb-2 opacity-50" />
                                            {searchQuery ? 'Tidak ada pengeluaran yang cocok' : 'Belum ada pengeluaran dicatat'}
                                        </Card>
                                    ) : (
                                        <div className="space-y-2">
                                            {filteredExpenses.map((expense) => (
                                                <Card
                                                    key={expense.id}
                                                    className="hover:shadow-md transition-shadow"
                                                >
                                                    <div className="space-y-2">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="text-xs text-slate-500">
                                                                        {format(new Date(expense.date), 'dd MMM yyyy')}
                                                                    </p>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {expense.category}
                                                                    </Badge>
                                                                </div>
                                                                <p className="font-medium text-slate-900 break-words">
                                                                    {expense.description || '-'}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="font-bold text-slate-900">
                                                                    {formatCurrency(expense.amount)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                                                            <button
                                                                onClick={() => handleDeleteExpense(expense.id)}
                                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
