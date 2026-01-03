import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash, Printer } from 'phosphor-react';
import useAuth from '../hooks/useAuth';
import { getPriceSettings } from '../services/settings';
import { searchCustomers, createOrGetCustomer } from '../services/customers';
import { createTransaction } from '../services/transactions';
import { formatCurrency, formatDateTimeLocal, parseDateTimeLocal } from '../utils/formatters';
import { validatePhone } from '../utils/validators';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function NewTransaction() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [priceSettings, setPriceSettings] = useState([]);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        notes: '',
    });
    const [items, setItems] = useState([{
        item_type: '',
        quantity: '',
        unit: '',
        unit_price: 0,
        subtotal: 0,
    }]);
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadPriceSettings();
    }, []);

    const loadPriceSettings = async () => {
        try {
            const settings = await getPriceSettings();
            setPriceSettings(settings);
        } catch (error) {
            console.error('Error loading price settings:', error);
        }
    };

    const handleCustomerSearch = async (value) => {
        setFormData({ ...formData, customer_name: value });

        if (value.length >= 2) {
            try {
                const results = await searchCustomers(value);
                setCustomerSuggestions(results);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error searching customers:', error);
            }
        } else {
            setShowSuggestions(false);
        }
    };

    const selectCustomer = (customer) => {
        setFormData({
            ...formData,
            customer_name: customer.name,
            customer_phone: customer.phone,
        });
        setShowSuggestions(false);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-fill price and unit when item_type changes
        if (field === 'item_type' && value) {
            const price = priceSettings.find(p => p.item_type === value);
            if (price) {
                newItems[index].unit_price = parseFloat(price.price);
                newItems[index].unit = price.unit;
            }
        }

        // Calculate subtotal
        if (newItems[index].quantity && newItems[index].unit_price) {
            newItems[index].subtotal = parseFloat(newItems[index].quantity) * parseFloat(newItems[index].unit_price);
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, {
            item_type: '',
            quantity: '',
            unit: '',
            unit_price: 0,
            subtotal: 0,
        }]);
    };

    const removeItem = (index) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
    };

    const calculateEstimatedDate = () => {
        // Find the longest duration from selected items
        let maxDuration = 0;
        items.forEach(item => {
            if (item.item_type) {
                const price = priceSettings.find(p => p.item_type === item.item_type);
                if (price && price.duration_days) {
                    maxDuration = Math.max(maxDuration, price.duration_days);
                }
            }
        });

        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + (maxDuration || 3));
        return estimatedDate;
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.customer_name.trim()) {
            newErrors.customer_name = 'Nama pelanggan wajib diisi';
        }

        if (!formData.customer_phone.trim()) {
            newErrors.customer_phone = 'Nomor HP wajib diisi';
        } else if (!validatePhone(formData.customer_phone)) {
            newErrors.customer_phone = 'Nomor HP tidak valid (gunakan format 08xx atau 628xx)';
        }

        // Validate items
        const validItems = items.filter(item => item.item_type && item.quantity > 0);
        if (validItems.length === 0) {
            newErrors.items = 'Minimal harus ada 1 item';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);

        try {
            // Create or get customer
            const customer = await createOrGetCustomer(
                formData.customer_name.trim(),
                formData.customer_phone.trim()
            );

            // Filter valid items
            const validItems = items.filter(item => item.item_type && item.quantity > 0);

            const total = calculateTotal();
            const estimatedDate = calculateEstimatedDate();

            // Create transaction
            const transaction = await createTransaction(
                {
                    customer_id: customer.id,
                    customer_name: formData.customer_name.trim(),
                    customer_phone: formData.customer_phone.trim(),
                    total_amount: total,
                    paid_amount: total, // Assuming full payment for now
                    status: 'proses',
                    notes: formData.notes.trim(),
                    date_in: new Date().toISOString(),
                    date_out: estimatedDate.toISOString(),
                    created_by: user.id,
                },
                validItems
            );

            // Redirect to transaction detail or open print
            alert('Transaksi berhasil dibuat!');
            navigate('/transactions');

        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Gagal membuat transaksi: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const total = calculateTotal();
    const estimatedDate = calculateEstimatedDate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header />

                <Container className="flex-1 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <h1 className="text-2xl font-bold text-slate-900">Transaksi Baru</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
                        {/* Customer Data */}
                        <Card>
                            <h2 className="font-semibold text-slate-900 mb-3">Data Pelanggan</h2>
                            <div className="space-y-3">
                                <div className="relative">
                                    <Input
                                        label="Nama Pelanggan"
                                        value={formData.customer_name}
                                        onChange={(e) => handleCustomerSearch(e.target.value)}
                                        error={errors.customer_name}
                                        placeholder="Nama lengkap"
                                    />
                                    {showSuggestions && customerSuggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {customerSuggestions.map((customer) => (
                                                <button
                                                    key={customer.id}
                                                    type="button"
                                                    onClick={() => selectCustomer(customer)}
                                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm"
                                                >
                                                    <div className="font-medium">{customer.name}</div>
                                                    <div className="text-xs text-slate-500">{customer.phone}</div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Input
                                    label="Nomor HP"
                                    type="tel"
                                    value={formData.customer_phone}
                                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                    error={errors.customer_phone}
                                    placeholder="08xx atau 628xx"
                                />
                            </div>
                        </Card>

                        {/* Items */}
                        <Card>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold text-slate-900">Item Laundry</h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addItem}
                                >
                                    <Plus size={16} />
                                    Tambah Item
                                </Button>
                            </div>

                            {errors.items && (
                                <div className="mb-3 text-sm text-red-500">{errors.items}</div>
                            )}

                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={index} className="p-3 border border-slate-200 rounded-md space-y-2">
                                        <div className="flex items-start gap-2">
                                            <div className="flex-1 space-y-2">
                                                <select
                                                    value={item.item_type}
                                                    onChange={(e) => handleItemChange(index, 'item_type', e.target.value)}
                                                    className="w-full h-10 px-3 border border-slate-300 rounded text-sm"
                                                >
                                                    <option value="">Pilih Jenis</option>
                                                    {priceSettings.map((price) => (
                                                        <option key={price.id} value={price.item_type}>
                                                            {price.item_label} - {formatCurrency(price.price)}/{price.unit}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        placeholder="Jumlah"
                                                        className="flex-1"
                                                        step={item.unit === 'kg' ? '0.5' : '1'}
                                                        min="0"
                                                    />
                                                    <div className="flex items-center px-3 bg-slate-100 rounded text-sm text-slate-700 min-w-[60px] justify-center">
                                                        {item.unit || '-'}
                                                    </div>
                                                </div>

                                                {item.subtotal > 0 && (
                                                    <div className="text-sm font-semibold text-slate-900">
                                                        Subtotal: {formatCurrency(item.subtotal)}
                                                    </div>
                                                )}
                                            </div>

                                            {items.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeItem(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash size={20} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Summary */}
                        <Card>
                            <h2 className="font-semibold text-slate-900 mb-3">Ringkasan</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold">Total:</span>
                                    <span className="font-bold text-primary-500">{formatCurrency(total)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Estimasi Selesai:</span>
                                    <span>{estimatedDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>

                                <Input
                                    label="Catatan (opsional)"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Catatan tambahan..."
                                />
                            </div>
                        </Card>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                loading={loading}
                            >
                                <Printer size={20} />
                                Simpan & Print
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate('/')}
                            >
                                Batal
                            </Button>
                        </div>
                    </form>
                </Container>
            </div>
        </div>
    );
}
