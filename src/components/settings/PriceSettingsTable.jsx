import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { updatePriceSetting } from '../../services/settings';

export default function PriceSettingsTable({ priceSettings, onUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [loading, setLoading] = useState(false);

    const handleEdit = (setting) => {
        setEditingId(setting.id);
        setEditValues({
            price: setting.price,
            duration_days: setting.duration_days || '',
        });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleSave = async (id) => {
        setLoading(true);
        try {
            await updatePriceSetting(id, {
                price: parseFloat(editValues.price),
                duration_days: editValues.duration_days ? parseInt(editValues.duration_days) : null,
            });
            onUpdate();
            setEditingId(null);
        } catch (error) {
            console.error('Error updating price:', error);
            alert('Gagal memperbarui harga');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditValues(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Pengaturan Harga</h2>
                <p className="text-xs text-slate-500">Atur harga per unit dan estimasi durasi pengerjaan</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider">Layanan</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-right">Harga (Rp)</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-center">Durasi (Hari)</th>
                            <th className="px-4 py-3 font-semibold text-slate-600 uppercase tracking-wider text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {priceSettings.map((setting) => (
                            <tr key={setting.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="font-medium text-slate-900">{setting.item_label}</div>
                                    <div className="text-xs text-slate-500 capitalize">Unit: {setting.unit}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {editingId === setting.id ? (
                                        <Input
                                            type="number"
                                            name="price"
                                            value={editValues.price}
                                            onChange={handleChange}
                                            className="text-right h-8"
                                            containerClassName="w-24 ml-auto"
                                        />
                                    ) : (
                                        <span className="font-mono">{parseFloat(setting.price).toLocaleString('id-ID')}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {editingId === setting.id ? (
                                        <Input
                                            type="number"
                                            name="duration_days"
                                            value={editValues.duration_days}
                                            onChange={handleChange}
                                            className="text-center h-8"
                                            containerClassName="w-16 mx-auto"
                                            placeholder="N/A"
                                        />
                                    ) : (
                                        <span>{setting.duration_days || '-'}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {editingId === setting.id ? (
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={loading} className="text-slate-500">
                                                Batal
                                            </Button>
                                            <Button variant="primary" size="sm" onClick={() => handleSave(setting.id)} loading={loading}>
                                                Ok
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button variant="secondary" size="sm" onClick={() => handleEdit(setting)}>
                                            Ubah
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
