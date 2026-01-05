import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function PrintReceipt({ transaction, laundryInfo, ref }) {
    if (!transaction) return null;

    return (
        <div ref={ref} className="hidden print:block">
            <div className="p-4" style={{ width: '58mm', fontFamily: 'monospace', fontSize: '12px' }}>
                {/* Header */}
                <div className="text-center mb-3">
                    <div className="font-bold text-base">{laundryInfo?.laundry_name || 'LAUNDRY NEW MAHKOTA'}</div>
                    <div className="text-xs">{laundryInfo?.laundry_address || 'Alamat Laundry'}</div>
                    <div className="text-xs">HP: {laundryInfo?.laundry_phone || '08XX-XXXX-XXXX'}</div>
                </div>

                <div className="border-t border-b border-slate-800 py-2 mb-2">
                    <div className="text-xs">No: {transaction.transaction_number}</div>
                    <div className="text-xs">
                        Tanggal: {formatDate(transaction.created_at, 'datetime')}
                    </div>
                </div>

                {/* Customer Info */}
                <div className="mb-2 text-xs">
                    <div>Pelanggan: {transaction.customer_name}</div>
                    <div>HP: {transaction.customer_phone}</div>
                </div>

                {/* Items */}
                <div className="border-t border-b border-slate-800 py-2 mb-2">
                    <div className="font-bold text-xs mb-1">DETAIL PESANAN:</div>
                    {transaction.transaction_items?.map((item, index) => (
                        <div key={index} className="text-xs mb-1">
                            <div>{item.item_type.replace(/_/g, ' ').toUpperCase()}</div>
                            <div className="flex justify-between">
                                <span>{item.quantity} {item.unit} x {formatCurrency(item.unit_price)}</span>
                                <span>{formatCurrency(item.subtotal)}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="border-b border-slate-800 pb-2 mb-2 text-xs">
                    <div className="flex justify-between font-bold">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(transaction.total_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Dibayar:</span>
                        <span>{formatCurrency(transaction.paid_amount)}</span>
                    </div>
                    {transaction.payment_method && (
                        <div className="flex justify-between">
                            <span>Metode:</span>
                            <span>{transaction.payment_method}</span>
                        </div>
                    )}
                    {transaction.paid_amount < transaction.total_amount && (
                        <div className="flex justify-between text-red-600">
                            <span>Sisa:</span>
                            <span>{formatCurrency(transaction.total_amount - transaction.paid_amount)}</span>
                        </div>
                    )}
                    {transaction.paid_amount > transaction.total_amount && (
                        <div className="flex justify-between">
                            <span>Kembalian:</span>
                            <span>{formatCurrency(transaction.paid_amount - transaction.total_amount)}</span>
                        </div>
                    )}
                </div>

                {/* Dates */}
                <div className="mb-3 text-xs">
                    <div>Masuk: {formatDate(transaction.date_in, 'short')}</div>
                    <div className="font-bold">SELESAI: {formatDate(transaction.date_out, 'short')}</div>
                </div>

                {/* Notes */}
                {transaction.notes && (
                    <div className="mb-3 text-xs">
                        <div className="font-bold">Catatan:</div>
                        <div>{transaction.notes}</div>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t border-slate-800 pt-2 text-center text-xs">
                    <div>Terima kasih!</div>
                    <div>Harap bawa nota saat ambil</div>
                </div>
            </div>
        </div>
    );
}
