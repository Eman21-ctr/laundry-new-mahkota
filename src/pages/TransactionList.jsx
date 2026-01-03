import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, Funnel } from 'phosphor-react';
import { getTransactions } from '../services/transactions';
import { formatCurrency, formatDate, getRelativeTime } from '../utils/formatters';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function TransactionList() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('semua');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadTransactions();
    }, []);

    useEffect(() => {
        filterTransactions();
    }, [transactions, activeTab, searchQuery]);

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

    const filterTransactions = () => {
        let filtered = [...transactions];

        // Filter by status
        if (activeTab !== 'semua') {
            filtered = filtered.filter(t => t.status === activeTab);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.transaction_number.toLowerCase().includes(query) ||
                t.customer_name.toLowerCase().includes(query) ||
                t.customer_phone.includes(query)
            );
        }

        setFilteredTransactions(filtered);
    };

    const tabs = [
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

                    {/* Filter Bar */}
                    <Card className="mb-4">
                        {/* Status Tabs */}
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.value}
                                    onClick={() => setActiveTab(tab.value)}
                                    className={`
                    px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                    ${activeTab === tab.value
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }
                  `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

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
                                placeholder="Cari nomor, nama, atau HP..."
                                className="w-full h-10 pl-10 pr-3 border border-slate-300 rounded text-sm"
                            />
                        </div>
                    </Card>

                    {/* Transaction List */}
                    {loading ? (
                        <Card className="text-center py-8 text-slate-600">
                            Memuat transaksi...
                        </Card>
                    ) : filteredTransactions.length === 0 ? (
                        <Card className="text-center py-8 text-slate-600">
                            {searchQuery ? 'Tidak ada transaksi yang cocok dengan pencarian' : 'Belum ada transaksi'}
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
                                        {/* Header */}
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

                                        {/* Footer */}
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

                    {/* Summary */}
                    {!loading && filteredTransactions.length > 0 && (
                        <div className="mt-4 text-center text-sm text-slate-600">
                            Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
                        </div>
                    )}
                </Container>
            </div>
        </div>
    );
}
