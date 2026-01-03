import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function UserForm({ user, onSubmit, onCancel, loading }) {
    const isEdit = !!user;
    const [formData, setFormData] = useState({
        email: '',
        full_name: '',
        password: '',
        is_owner: false,
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || '',
                full_name: user.full_name || '',
                password: '', // Password shouldn't be pre-filled
                is_owner: user.is_owner || false,
                is_active: user.is_active ?? true,
            });
        }
    }, [user]);

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email wajib diisi';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email tidak valid';

        if (!formData.full_name) newErrors.full_name = 'Nama lengkap wajib diisi';

        if (!isEdit && !formData.password) {
            newErrors.password = 'Password wajib diisi untuk pengguna baru';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Email"
                name="email"
                type="email"
                placeholder="email@contoh.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                disabled={isEdit || loading} // Email typically not editable in Supabase
            />

            <Input
                label="Nama Lengkap"
                name="full_name"
                placeholder="Nama Lengkap"
                value={formData.full_name}
                onChange={handleChange}
                error={errors.full_name}
                disabled={loading}
            />

            {!isEdit && (
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    disabled={loading}
                />
            )}

            <div className="flex flex-col gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        name="is_owner"
                        checked={formData.is_owner}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                        disabled={loading}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        Set sebagai Owner (Bisa kelola pengguna & pengaturan)
                    </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleChange}
                        className="w-4 h-4 text-success-600 rounded border-slate-300 focus:ring-success-500"
                        disabled={loading}
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        Akun Aktif
                    </span>
                </label>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
                <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={onCancel}
                    disabled={loading}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                >
                    {isEdit ? 'Update' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}
