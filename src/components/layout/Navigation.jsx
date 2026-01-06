import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, ChartBar, GearSix } from 'phosphor-react';
import useAuth from '../../hooks/useAuth';

export default function Navigation() {
    const { user } = useAuth();
    const isOwner = user?.profile?.is_owner;

    const navItems = [
        { to: '/', label: 'Beranda', icon: House },
        { to: '/reports', label: 'Laporan', icon: ChartBar },
    ];

    if (isOwner) {
        navItems.push({ to: '/users', label: 'Pengaturan', icon: GearSix });
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
                                <item.icon size={24} weight="fill" />
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
                                <item.icon size={20} weight="fill" />
                                <span className="font-medium">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
