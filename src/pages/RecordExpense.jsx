import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet } from 'phosphor-react';
import { format } from 'date-fns';
import { createExpense } from '../services/expenses';
import useAuth from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function RecordExpense() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form State
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

            await createExpense(payload);

            // Redirect to Transactions page (Expenses tab)
            navigate('/transactions', { state: { defaultTab: 'pengeluaran' } });
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Gagal menyimpan pengeluaran');
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header />

                <Container className="flex-1 py-4">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-6 flex items-center gap-2">
                            <Button variant="ghost" className="p-2" onClick={() => navigate(-1)}>
                                <ArrowLeft size={20} />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Catat Pengeluaran</h1>
                                <p className="text-slate-500 text-sm">Input biaya operasional baru</p>
                            </div>
                        </div>

                        <Card>
                            <form onSubmit={handleSubmit} className="space-y-4">
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

                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="flex-1"
                                        onClick={() => navigate(-1)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={submitting}
                                        loading={submitting}
                                    >
                                        Simpan
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                </Container>
            </div>
        </div>
    );
}
