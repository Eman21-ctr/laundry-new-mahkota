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

                    {/* Functionality moved to Settings page */}
                    <div />
                </div>
            </div>
        </header>
    );
}
