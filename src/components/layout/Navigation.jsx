import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, Receipt, Wallet, Users } from 'phosphor-react';
import useAuth from '../../hooks/useAuth';

export default function Navigation() {
    const { user } = useAuth();
    const isOwner = user?.profile?.is_owner;

    const navItems = [
        { to: '/', label: 'Beranda', icon: House },
        { to: '/new-transaction', label: 'Transaksi', icon: Receipt },
        { to: '/record-expense', label: 'Pengeluaran', icon: Wallet },
    ];

    // Add Pengguna for everyone? Wait, the user said "ditambah Pengguna".
    // Usually only owner can see users, but maybe and settings.
    // Let's keep it for owner or check if they want it for everyone.
    // "apakah Pengaturan bisa digabung ke dalam Pengguna sehingga di nav bar itu hanya 4 menu saja"
    // I'll add it as 'Pengguna' and if it's owner-only then the nav-bar will have 3 for kasir.
    // But usually Pengguna is for everyone to see their profile? 
    // Usually owners manage users.
    if (isOwner) {
        navItems.push({ to: '/users', label: 'Pengguna', icon: Users });
    }

    return (
        <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-40 md:relative md:border-t-0 md:border-r md:w-64 md:min-h-screen">
            {/* Mobile Bottom Nav */}
            <div className="flex md:hidden">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center justify-center py-2 transition-colors ${isActive
                                ? 'text-primary-500'
                                : 'text-slate-600 hover:text-slate-900'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={24} weight={isActive ? 'fill' : 'regular'} />
                                <span className="text-xs mt-1">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Desktop Side Nav */}
            <div className="hidden md:block p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-primary-50 text-primary-500'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={20} weight={isActive ? 'fill' : 'regular'} />
                                <span className="font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
