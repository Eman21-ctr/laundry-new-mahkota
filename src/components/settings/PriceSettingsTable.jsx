import React, { useState } from 'react';
import { Plus, Trash, PencilSimple, Check, X } from 'phosphor-react';
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
        unit: '',
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
            setNewService({ item_type: '', item_label: '', price: '', unit: '', duration_days: '' });
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
                <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Pengaturan Harga</h2>
                        <p className="text-xs text-slate-500">Atur harga dan durasi layanan</p>
                    </div>
                    <Button size="sm" onClick={() => setShowCreateModal(true)}>
                        <Plus size={16} weight="bold" />
                        <span className="hidden sm:inline ml-1">Tambah</span>
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-2 py-2 font-semibold text-slate-600">Layanan</th>
                                <th className="px-2 py-2 font-semibold text-slate-600 text-right">Harga</th>
                                <th className="px-2 py-2 font-semibold text-slate-600 text-center">Hari</th>
                                <th className="px-2 py-2 font-semibold text-slate-600 text-center w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {priceSettings.map((setting) => (
                                <tr key={setting.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-2 py-2">
                                        <div className="font-medium text-slate-900 text-sm">{setting.item_label}</div>
                                        <div className="text-[10px] text-slate-400">/{setting.unit}</div>
                                    </td>
                                    <td className="px-2 py-2 text-right">
                                        {editingId === setting.id ? (
                                            <input
                                                type="number"
                                                name="price"
                                                value={editValues.price}
                                                onChange={handleChange}
                                                className="w-20 text-right text-xs px-1 py-0.5 border border-slate-300 rounded"
                                            />
                                        ) : (
                                            <span className="font-mono text-sm">{parseFloat(setting.price).toLocaleString('id-ID')}</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {editingId === setting.id ? (
                                            <input
                                                type="number"
                                                name="duration_days"
                                                value={editValues.duration_days}
                                                onChange={handleChange}
                                                placeholder="-"
                                                className="w-12 text-center text-xs px-1 py-0.5 border border-slate-300 rounded"
                                            />
                                        ) : (
                                            <span className="text-sm">{setting.duration_days || '-'}</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        {editingId === setting.id ? (
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={handleCancel}
                                                    disabled={loading}
                                                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                                    title="Batal"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleSave(setting.id)}
                                                    disabled={loading}
                                                    className="p-1 text-green-500 hover:text-green-700 transition-colors"
                                                    title="Simpan"
                                                >
                                                    <Check size={16} weight="bold" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(setting)}
                                                    className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <PencilSimple size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(setting.id, setting.item_label)}
                                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash size={16} />
                                                </button>
                                            </div>
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
                        <Input
                            label="Satuan"
                            placeholder="kg, pcs, <10 kg, dll."
                            required
                            value={newService.unit}
                            onChange={(e) => setNewService({ ...newService, unit: e.target.value })}
                        />
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
