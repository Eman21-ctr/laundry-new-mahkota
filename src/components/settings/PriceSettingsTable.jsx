import React, { useState } from 'react';
import { Plus, Trash } from 'phosphor-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { updatePriceSetting, createPriceSetting, deletePriceSetting } from '../../services/settings';

export default function PriceSettingsTable({ priceSettings, onUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [loading, setLoading] = useState(false);

    // Create Mode State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newService, setNewService] = useState({
        item_type: '',
        item_label: '',
        price: '',
        unit: 'kg',
        duration_days: ''
    });

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Generate item_type from label if not provided (simple slugify)
            const type = newService.item_label.toLowerCase().replace(/\s+/g, '_');

            await createPriceSetting({
                ...newService,
                item_type: type,
                price: parseFloat(newService.price),
                duration_days: newService.duration_days ? parseInt(newService.duration_days) : null
            });
            onUpdate();
            setShowCreateModal(false);
            setNewService({ item_type: '', item_label: '', price: '', unit: 'kg', duration_days: '' });
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Gagal menambah layanan');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, label) => {
        if (!confirm(`Yakin ingin menghapus layanan "${label}"?`)) return;
        setLoading(true);
        try {
            await deletePriceSetting(id);
            onUpdate();
        } catch (error) {
            console.error('Error deleting service:', error);
            alert('Gagal menghapus layanan');
        } finally {
            setLoading(false);
        }
    };

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
        <>
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Pengaturan Harga</h2>
                        <p className="text-xs text-slate-500">Atur harga per unit dan estimasi durasi pengerjaan</p>
                    </div>
                    <Button size="sm" onClick={() => setShowCreateModal(true)}>
                        <Plus size={18} weight="bold" />
                        Tambah Layanan
                    </Button>
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
                                        {editingId !== setting.id && (
                                            <button
                                                onClick={() => handleDelete(setting.id, setting.item_label)}
                                                className="ml-2 p-1 text-red-400 hover:text-red-600 transition-colors"
                                                title="Hapus Layanan"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Tambah Layanan Baru"
                size="sm"
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input
                        label="Nama Layanan"
                        placeholder="Contoh: Cuci Karpet"
                        required
                        value={newService.item_label}
                        onChange={(e) => setNewService({ ...newService, item_label: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Harga (Rp)"
                            type="number"
                            required
                            min="0"
                            placeholder="0"
                            value={newService.price}
                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Satuan</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={newService.unit}
                                onChange={(e) => setNewService({ ...newService, unit: e.target.value })}
                            >
                                <option value="kg">Per Kg</option>
                                <option value="pcs">Per Pcs</option>
                                <option value="m2">Per Meter²</option>
                            </select>
                        </div>
                    </div>

                    <Input
                        label="Estimasi Durasi (Hari)"
                        type="number"
                        placeholder="Opsional"
                        value={newService.duration_days}
                        onChange={(e) => setNewService({ ...newService, duration_days: e.target.value })}
                    />

                    <div className="flex gap-2 pt-2">
                        <Button type="button" variant="secondary" fullWidth onClick={() => setShowCreateModal(false)}>
                            Batal
                        </Button>
                        <Button type="submit" variant="primary" fullWidth loading={loading}>
                            Simpan
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
