import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { updateAppSetting } from '../../services/settings';

export default function AppInfoForm({ settings, onUpdate }) {
    const [formData, setFormData] = useState({
        laundry_name: '',
        laundry_address: '',
        laundry_phone: '',
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData({
                laundry_name: settings.laundry_name || '',
                laundry_address: settings.laundry_address || '',
                laundry_phone: settings.laundry_phone || '',
            });
        }
    }, [settings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await Promise.all([
                updateAppSetting('laundry_name', formData.laundry_name),
                updateAppSetting('laundry_address', formData.laundry_address),
                updateAppSetting('laundry_phone', formData.laundry_phone),
            ]);
            onUpdate();
            alert('Informasi laundry berhasil diperbarui');
        } catch (error) {
            console.error('Error updating app info:', error);
            alert('Gagal memperbarui informasi laundry');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Informasi Laundry</h2>

            <Input
                label="Nama Laundry"
                name="laundry_name"
                value={formData.laundry_name}
                onChange={handleChange}
                placeholder="Masukkan nama laundry"
                disabled={loading}
            />

            <Input
                label="Alamat"
                name="laundry_address"
                value={formData.laundry_address}
                onChange={handleChange}
                placeholder="Masukkan alamat lengkap"
                disabled={loading}
            />

            <Input
                label="Nomor Telepon"
                name="laundry_phone"
                value={formData.laundry_phone}
                onChange={handleChange}
                placeholder="0812xxxx"
                disabled={loading}
            />

            <div className="pt-2">
                <Button type="submit" variant="primary" loading={loading} fullWidth>
                    Simpan Perubahan
                </Button>
            </div>
        </form>
    );
}
