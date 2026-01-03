import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeSimple, ArrowLeft, CheckCircle } from 'phosphor-react';
import { resetPassword } from '../../services/auth';
import { validateEmail } from '../../utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';
import IconBox from '../ui/IconBox';

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email wajib diisi');
            return;
        }

        if (!validateEmail(email)) {
            setError('Format email tidak valid');
            return;
        }

        setLoading(true);

        try {
            await resetPassword(email);
            setSuccess(true);
        } catch (error) {
            console.error('Reset password error:', error);
            setError('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle text-center">
                        <div className="flex justify-center mb-4">
                            <IconBox icon={CheckCircle} variant="primary" size="lg" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Email Terkirim!
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Kami telah mengirim link reset password ke email Anda.
                            Silakan cek inbox atau folder spam.
                        </p>
                        <Link to="/login">
                            <Button variant="primary" fullWidth>
                                Kembali ke Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-4">
                        <IconBox icon={EnvelopeSimple} variant="primary" size="lg" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                        Reset Password
                    </h1>
                    <p className="text-slate-600">
                        Masukkan email Anda untuk menerima link reset password
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-subtle">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                                {error}
                            </div>
                        )}

                        {/* Email Input */}
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="nama@email.com"
                            autoComplete="email"
                        />

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            loading={loading}
                        >
                            Kirim Link Reset
                        </Button>

                        {/* Back to Login */}
                        <Link to="/login">
                            <Button variant="ghost" fullWidth className="mt-2">
                                <ArrowLeft size={16} />
                                Kembali ke Login
                            </Button>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}
