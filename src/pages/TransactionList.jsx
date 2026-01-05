import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlass, Funnel, Trash, Pencil, Wallet } from 'phosphor-react';
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
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header />

                <Container className="flex-1 py-4">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Daftar Transaksi</h1>

                    {/* Main Tabs (Pemasukan / Pengeluaran) */}
                    <div className="flex mb-4 bg-white rounded-lg p-1 border border-slate-200 shadow-sm w-fit">
                        <button
                            onClick={() => { setMainTab('pemasukan'); setSearchQuery(''); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mainTab === 'pemasukan' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Pemasukan
                        </button>
                        <button
                            onClick={() => { setMainTab('pengeluaran'); setSearchQuery(''); }}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mainTab === 'pengeluaran' ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Pengeluaran
                        </button>
                    </div>

                    {/* Filter Bar */}
                    <Card className="mb-4">
                        {/* Transaction Status Tabs (Only visible for Pemasukan) */}
                        {mainTab === 'pemasukan' && (
                            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                                {transactionTabs.map((tab) => (
                                    <button
                                        key={tab.value}
                                        onClick={() => setStatusTab(tab.value)}
                                        className={`
                                            px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                                            ${statusTab === tab.value
                                                ? 'bg-primary-500 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                            }
                                        `}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div className="relative">
                            <MagnifyingGlass
                                size={20}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={mainTab === 'pemasukan' ? "Cari nomor, nama, atau HP..." : "Cari keterangan atau kategori..."}
                                className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded text-sm"
                            />
                        </div>
                    </Card>

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
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="font-semibold text-slate-900 text-sm">
                                                                        {transaction.transaction_number}
                                                                    </p>
                                                                    <Badge variant={transaction.status}>
                                                                        {transaction.status}
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
                                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                                        <tr>
                                                            <th className="px-4 py-3 font-semibold">Tanggal</th>
                                                            <th className="px-4 py-3 font-semibold">Kategori</th>
                                                            <th className="px-4 py-3 font-semibold">Keterangan</th>
                                                            <th className="px-4 py-3 font-semibold text-right">Jumlah</th>
                                                            <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {filteredExpenses.map((expense) => (
                                                            <tr key={expense.id} className="hover:bg-slate-50">
                                                                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                                                    {format(new Date(expense.date), 'dd MMM yyyy')}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                                                        {expense.category}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-900 max-w-xs truncate">
                                                                    {expense.description || '-'}
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-medium text-slate-900">
                                                                    {formatCurrency(expense.amount)}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => handleDeleteExpense(expense.id)}
                                                                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                                        title="Hapus"
                                                                    >
                                                                        <Trash size={18} />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </Container>
            </div>
        </div>
    );
}
