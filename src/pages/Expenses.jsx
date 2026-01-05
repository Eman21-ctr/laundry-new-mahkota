import React, { useState, useEffect } from 'react';
import { Plus, Trash, Pencil, Wallet, Calendar, Funnel, X } from 'phosphor-react';
import { format } from 'date-fns';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../services/expenses';
import { formatCurrency } from '../utils/formatters';
import useAuth from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function Expenses() {
    const { user } = useAuth();

    // State
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: format(new Date().setDate(1), 'yyyy-MM-dd'), // First day of current month
        endDate: format(new Date(), 'yyyy-MM-dd'),
        category: ''
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: 'Operasional',
        description: '',
        amount: ''
    });
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        'Operasional',
        'Gaji Karyawan',
        'Listrik & Air',
        'Bahan Baku',
        'Perawatan',
        'Sewa',
        'Lainnya'
    ];

    useEffect(() => {
        fetchExpenses();
    }, [filters]);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await getExpenses(filters);
            setExpenses(data);
        } catch (error) {
            console.error('Error fetching expenses:', error);
            alert('Gagal mengambil data pengeluaran');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                created_by: user.id
            };

            if (editingId) {
                await updateExpense(editingId, payload);
            } else {
                await createExpense(payload);
            }

            setIsModalOpen(false);
            resetForm();
            fetchExpenses();
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Gagal menyimpan pengeluaran');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) return;

        try {
            await deleteExpense(id);
            fetchExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Gagal menghapus pengeluaran');
        }
    };

    const openEditModal = (expense) => {
        setEditingId(expense.id);
        setFormData({
            date: expense.date,
            category: expense.category,
            description: expense.description || '',
            amount: expense.amount
        });
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            date: format(new Date(), 'yyyy-MM-dd'),
            category: 'Operasional',
            description: '',
            amount: ''
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header />

                <Container className="flex-1 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Pengeluaran</h1>
                            <p className="text-slate-500 text-sm">Catat biaya operasional laundry</p>
                        </div>
                        <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                            <Plus size={18} weight="bold" />
                            Tambah Pengeluaran
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 flex flex-col sm:flex-row items-end gap-4 shadow-sm">
                        <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Mulai Dari</label>
                            <input
                                type="date"
                                name="startDate"
                                className="w-full px-3 h-10 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Sampai Dengan</label>
                            <input
                                type="date"
                                name="endDate"
                                className="w-full px-3 h-10 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="flex-1 w-full sm:w-auto">
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Kategori</label>
                            <select
                                name="category"
                                className="w-full px-3 h-10 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                value={filters.category}
                                onChange={handleFilterChange}
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Expenses List */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                            <Wallet size={48} className="mx-auto text-slate-300 mb-2" />
                            <p className="text-slate-500">Belum ada data pengeluaran</p>
                        </div>
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
                                        {expenses.map((expense) => (
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
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => openEditModal(expense)}
                                                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(expense.id)}
                                                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-slate-50 font-bold text-slate-900">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right">Total</td>
                                            <td className="px-4 py-3 text-right">
                                                {formatCurrency(expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0))}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}
                </Container>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h3 className="font-bold text-lg text-slate-900">
                                {editingId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                                <select
                                    name="category"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    placeholder="0"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (Opsional)</label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    placeholder="Contoh: Beli sabun cuci 5L"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    loading={submitting}
                                >
                                    Simpan
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
