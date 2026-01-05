import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Pencil, Trash, CheckCircle } from 'phosphor-react';
import { getTransactionById, updateTransactionStatus, deleteTransaction } from '../services/transactions';
import { getAppSettings } from '../services/settings';
import { formatCurrency, formatDate } from '../utils/formatters';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PrintReceipt from '../components/print/PrintReceipt';
import { useRef } from 'react';
import { generateAndOpenPDF } from '../utils/pdfGenerator';

export default function TransactionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [transaction, setTransaction] = useState(null);
    const [laundryInfo, setLaundryInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const receiptRef = useRef(null);

    useEffect(() => {
        loadTransaction();
        loadLaundryInfo();
    }, [id]);

    const loadTransaction = async () => {
        try {
            setLoading(true);
            const data = await getTransactionById(id);
            setTransaction(data);
        } catch (error) {
            console.error('Error loading transaction:', error);
            alert('Gagal memuat transaksi');
            navigate('/transactions');
        } finally {
            setLoading(false);
        }
    };

    const loadLaundryInfo = async () => {
        try {
            const settings = await getAppSettings();
            setLaundryInfo(settings);
        } catch (error) {
            console.error('Error loading laundry info:', error);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Nota-${transaction.transaction_number}`;
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
        }, 500);
    };

    const handleShare = async () => {
        if (!transaction || !receiptRef.current) return;
        try {
            setLoading(true);
            const filename = `Nota-${transaction.transaction_number}.pdf`;
            await generateAndOpenPDF(receiptRef.current, filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal membuka PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await updateTransactionStatus(transaction.id, newStatus);
            setTransaction({ ...transaction, status: newStatus });
            setShowStatusModal(false);
            alert('Status berhasil diubah');
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Gagal mengubah status');
        }
    };

    const handlePaymentUpdate = async () => {
        try {
            setIsUpdatingPayment(true);
            const remaining = transaction.total_amount - transaction.paid_amount;
            const newPaidAmount = transaction.paid_amount + remaining;

            const { data, error } = await supabase
                .from('transactions')
                .update({ paid_amount: newPaidAmount })
                .eq('id', transaction.id)
                .select()
                .single();

            if (error) throw error;

            setTransaction({ ...transaction, paid_amount: newPaidAmount });
            setShowPaymentModal(false);
            alert('Pembayaran berhasil dilunasi');
        } catch (error) {
            console.error('Error updating payment:', error);
            alert('Gagal melunasi pembayaran');
        } finally {
            setIsUpdatingPayment(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteTransaction(transaction.id);
            alert('Transaksi berhasil dihapus');
            navigate('/transactions');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Gagal menghapus transaksi');
        }
    };

    if (loading || !transaction) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-slate-600">Memuat transaksi...</p>
                </div>
            </div>
        );
    }

    const statusOptions = [
        { value: 'proses', label: 'Proses', disabled: false },
        { value: 'selesai', label: 'Selesai', disabled: transaction.status === 'diambil' },
        { value: 'diambil', label: 'Diambil', disabled: false },
    ];

    return (
        <>
            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row no-print">
                <Navigation />

                <div className="flex-1 flex flex-col pb-16 md:pb-0">
                    <Header transparent={true} />

                    {/* World-Class Header Section */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white pb-10 pt-16 -mt-16 px-6 shadow-lg relative overflow-hidden mb-6">
                        <div className="max-w-4xl mx-auto flex items-center gap-3">
                            <button
                                onClick={() => navigate('/transactions')}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <ArrowLeft size={24} weight="bold" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold">Detail Transaksi</h1>
                                <p className="text-blue-100 text-sm">{transaction.transaction_number}</p>
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-4 w-full space-y-4">
                        {/* Header Info */}
                        <Card>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 mb-2">
                                        {transaction.transaction_number}
                                    </p>
                                    <Badge variant={transaction.status} className="text-sm px-3 py-1">
                                        {transaction.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>
                        </Card>

                        {/* Customer Info */}
                        <Card>
                            <h2 className="font-semibold text-slate-900 mb-3">Info Pelanggan</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Nama:</span>
                                    <span className="font-medium">{transaction.customer_name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">No. HP:</span>
                                    <span className="font-medium">{transaction.customer_phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Tanggal Masuk:</span>
                                    <span className="font-medium">{formatDate(transaction.date_in, 'long')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Estimasi Selesai:</span>
                                    <span className="font-medium">{formatDate(transaction.date_out, 'long')}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Items */}
                        <Card>
                            <h2 className="font-semibold text-slate-900 mb-3">Detail Item</h2>
                            <div className="space-y-2">
                                {transaction.transaction_items?.map((item, index) => (
                                    <div key={index} className="flex justify-between items-start pb-2 border-b border-slate-100 last:border-0">
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {item.item_type.replace(/_/g, ' ').charAt(0).toUpperCase() + item.item_type.replace(/_/g, ' ').slice(1)}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {item.quantity} {item.unit} × {formatCurrency(item.unit_price)}
                                            </p>
                                        </div>
                                        <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Payment */}
                        <Card>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold text-slate-900">Info Pembayaran</h2>
                                {transaction.paid_amount < transaction.total_amount && (
                                    <Button
                                        variant="primary"
                                        size="xs"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-[10px] h-7 px-3"
                                        onClick={() => setShowPaymentModal(true)}
                                    >
                                        Bayar Sisa
                                    </Button>
                                )}
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Total:</span>
                                    <span className="font-bold text-lg">{formatCurrency(transaction.total_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Dibayar:</span>
                                    <span className="font-medium">{formatCurrency(transaction.paid_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Metode:</span>
                                    <Badge variant={(transaction.payment_method || 'Tunai').toLowerCase()}>
                                        {transaction.payment_method || 'Tunai'}
                                    </Badge>
                                </div>
                                {transaction.paid_amount >= transaction.total_amount ? (
                                    <div className="flex items-center gap-2 text-green-600 pt-2">
                                        <CheckCircle size={20} weight="fill" />
                                        <span className="font-semibold">Lunas</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between text-red-600 pt-2">
                                        <span className="font-semibold">Sisa:</span>
                                        <span className="font-bold">{formatCurrency(transaction.total_amount - transaction.paid_amount)}</span>
                                    </div>
                                )}
                            </div>

                            {transaction.notes && (
                                <div className="mt-3 pt-3 border-t border-slate-200">
                                    <p className="text-sm text-slate-600 mb-1">Catatan:</p>
                                    <p className="text-sm">{transaction.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                variant="primary"
                                onClick={handlePrint}
                            >
                                <Printer size={20} />
                                Print Nota
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleShare}
                                className="bg-green-600 hover:bg-green-700 text-white border-transparent"
                            >
                                <Printer size={20} />
                                Share PDF
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setShowStatusModal(true)}
                            >
                                Ubah Status
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
                                disabled
                            >
                                <Pencil size={20} />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash size={20} />
                                Hapus
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Receipt */}
            <div className="hidden print:block absolute top-0 left-0 w-full bg-white z-[9999]">
                <div ref={receiptRef}>
                    <PrintReceipt transaction={transaction} laundryInfo={laundryInfo} className="print-content" />
                </div>
            </div>

            {/* Status Modal */}
            <Modal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                title="Ubah Status"
                size="sm"
            >
                <div className="space-y-2">
                    {statusOptions.map((option) => (
                        <Button
                            key={option.value}
                            variant={transaction.status === option.value ? 'primary' : 'secondary'}
                            fullWidth
                            onClick={() => handleStatusChange(option.value)}
                            disabled={option.disabled}
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Hapus Transaksi"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-slate-700">
                        Yakin ingin menghapus transaksi <strong>{transaction.transaction_number}</strong>?
                        Tindakan ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            fullWidth
                            onClick={handleDelete}
                        >
                            Ya, Hapus
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Payment Modal (Pelunasan) */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Pelunasan Tagihan"
                size="sm"
            >
                <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Sisa Tagihan</p>
                        <p className="text-2xl font-black text-emerald-700">
                            {formatCurrency(transaction.total_amount - transaction.paid_amount)}
                        </p>
                    </div>

                    <p className="text-sm text-slate-600">
                        Pastikan Anda sudah menerima pembayaran sejumlah sisa tagihan di atas. Transaksi akan otomatis ditandai sebagai <strong>Lunas</strong>.
                    </p>

                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handlePaymentUpdate}
                            loading={isUpdatingPayment}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            Konfirmasi Lunas
                        </Button>
                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => setShowPaymentModal(false)}
                        >
                            Batal
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
