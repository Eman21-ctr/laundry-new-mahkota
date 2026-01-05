import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Power, CalendarBlank } from 'phosphor-react';
import useAuth from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Header({ transparent = false }) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm('Yakin ingin keluar?')) {
            await signOut();
            navigate('/login');
        }
    };

    return (
        <header className={`${transparent ? 'bg-transparent border-none' : 'bg-white border-b border-slate-200'} sticky top-0 z-40 transition-all duration-300`}>
            <div className="container-padding">
                <div className="flex items-center justify-between py-4">
                    {/* Branding removed for world-class look */}
                    <div />

                    {/* Right side: Logout Only (Minimalist) */}
                    <div className="flex items-center gap-4">
                        <div className={`hidden sm:block text-right ${transparent ? 'text-white' : 'text-slate-900'}`}>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80">
                                {user?.profile?.full_name || 'Staff'}
                            </p>
                            <p className="text-[10px] opacity-60">
                                {user?.profile?.is_owner ? 'Owner' : 'Kasir'}
                            </p>
                        </div>

                        {/* Logout Button - Enhanced Power Icon */}
                        <button
                            onClick={handleLogout}
                            className={`p-2 rounded-xl transition-all duration-200 ${transparent
                                    ? 'bg-white/10 text-white hover:bg-white/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'
                                }`}
                            title="Keluar"
                        >
                            <Power size={22} weight="bold" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
