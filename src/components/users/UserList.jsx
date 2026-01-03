import React from 'react';
import { Pencil, Trash, ShieldCheck, User as UserIcon, CheckCircle, MinusCircle } from 'phosphor-react';
import IconBox from '../ui/IconBox';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate } from '../../utils/formatters';

export default function UserList({ users, onEdit, onToggleStatus, onDelete, loading }) {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <p className="text-slate-500">Belum ada pengguna.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Pengguna</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Peran</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Login Terakhir</th>
                            <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <IconBox
                                            icon={user.is_owner ? ShieldCheck : UserIcon}
                                            variant={user.is_owner ? 'primary' : 'secondary'}
                                            size="sm"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-slate-900">{user.full_name}</div>
                                            <div className="text-xs text-slate-500">{user.email || 'No Email'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={user.is_owner ? 'primary' : 'secondary'}>
                                        {user.is_owner ? 'Owner' : 'Kasir'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3">
                                    <Badge variant={user.is_active ? 'success' : 'neutral'}>
                                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                    {user.last_login ? formatDate(user.last_login) : '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(user)}
                                            title="Edit"
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onToggleStatus(user.id, !user.is_active)}
                                            title={user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                            className={user.is_active ? 'text-amber-600' : 'text-success-600'}
                                        >
                                            {user.is_active ? <MinusCircle size={18} /> : <CheckCircle size={18} />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(user.id)}
                                            title="Hapus"
                                            className="text-red-600"
                                        >
                                            <Trash size={18} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-200">
                {users.map((user) => (
                    <div key={user.id} className="p-4 bg-white space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <IconBox
                                    icon={user.is_owner ? ShieldCheck : UserIcon}
                                    variant={user.is_owner ? 'primary' : 'secondary'}
                                    size="sm"
                                />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">{user.full_name}</div>
                                    <div className="text-xs text-slate-500">{user.email}</div>
                                </div>
                            </div>
                            <Badge variant={user.is_owner ? 'primary' : 'secondary'}>
                                {user.is_owner ? 'Owner' : 'Kasir'}
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Status:</span>
                                <Badge variant={user.is_active ? 'success' : 'neutral'} size="sm">
                                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                                </Badge>
                            </div>
                            <div className="text-xs text-slate-400">
                                Login: {user.last_login ? formatDate(user.last_login) : '-'}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onEdit(user)}
                                className="h-8"
                            >
                                <Pencil size={16} /> Edit
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onToggleStatus(user.id, !user.is_active)}
                                className={`h-8 ${user.is_active ? 'text-amber-600' : 'text-success-600'}`}
                            >
                                {user.is_active ? <MinusCircle size={16} /> : <CheckCircle size={16} />}
                                {user.is_active ? 'Nonaktif' : 'Aktif'}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => onDelete(user.id)}
                                className="h-8 text-red-600"
                            >
                                <Trash size={16} /> Hapus
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
