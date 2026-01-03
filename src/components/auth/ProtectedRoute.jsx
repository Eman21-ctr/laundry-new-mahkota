import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

/**
 * Protected Route wrapper - redirects to login if not authenticated
 */
export default function ProtectedRoute({ children, ownerOnly = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Memuat...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Check owner-only routes
    if (ownerOnly && !user.profile?.is_owner) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Akses Ditolak</h2>
                    <p className="text-slate-600">Anda tidak memiliki akses ke halaman ini. Hanya owner yang bisa mengakses halaman ini.</p>
                    <Navigate to="/" replace />
                </div>
            </div>
        );
    }

    return children;
}
