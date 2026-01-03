import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drop, Eye, EyeSlash } from 'phosphor-react';
import { signIn } from '../../services/auth';
import { validateEmail, validatePassword } from '../../utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';
import IconBox from '../ui/IconBox';

export default function LoginForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setGeneralError('');
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email wajib diisi';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!formData.password) {
            newErrors.password = 'Password wajib diisi';
        } else if (!validatePassword(formData.password)) {
            newErrors.password = 'Password minimal 6 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validate()) return;

        setLoading(true);

        try {
            await signIn(formData.email, formData.password, formData.rememberMe);
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Login error:', error);

            if (error.message.includes('Invalid login credentials')) {
                setGeneralError('Email atau password salah');
            } else if (error.message.includes('Email not confirmed')) {
                setGeneralError('Email belum diverifikasi');
            } else {
                setGeneralError('Terjadi kesalahan. Silakan coba lagi.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <IconBox icon={Drop} variant="primary" size="lg" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        Laundry New Mahkota
                    </h1>
                    <p className="text-slate-600">Masuk ke akun Anda</p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* General Error */}
                        {generalError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {generalError}
                            </div>
                        )}

                        {/* Email Input */}
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="nama@email.com"
                            autoComplete="email"
                        />

                        {/* Password Input */}
                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                placeholder="Masukkan password"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary-500 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-700">Ingat saya</span>
                            </label>

                            <a
                                href="/forgot-password"
                                className="text-sm text-primary-500 hover:text-primary-600"
                            >
                                Lupa password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                        >
                            Masuk
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
