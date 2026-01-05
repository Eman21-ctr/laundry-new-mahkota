import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignOut, User, CalendarBlank } from 'phosphor-react';
import useAuth from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import IconBox from '../ui/IconBox';
import Button from '../ui/Button';

export default function Header() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        if (window.confirm('Yakin ingin keluar?')) {
            await signOut();
            navigate('/login');
        }
    };

    // Get user initials
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
            <div className="container-padding">
                <div className="flex items-center justify-between py-3">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Laundry New Mahkota" className="h-10 w-auto rounded-lg shadow-sm" />
                    </div>

                    {/* Right side: Date, User, Logout */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Date - hidden on mobile */}
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                            <CalendarBlank size={16} />
                            <span>{formatDate(new Date(), 'long')}</span>
                        </div>

                        {/* User Info */}
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-slate-900">
                                    {user?.profile?.full_name || 'User'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {user?.profile?.is_owner ? 'Owner' : 'Kasir'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-sm">
                                {getInitials(user?.profile?.full_name)}
                            </div>
                        </div>

                        {/* Logout Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="!px-2"
                            title="Keluar"
                        >
                            <SignOut size={20} />
                            <span className="hidden md:inline">Keluar</span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
