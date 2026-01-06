import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import AppInfoForm from '../components/settings/AppInfoForm';
import PriceSettingsTable from '../components/settings/PriceSettingsTable';
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../services/users';
import { getAppSettings, getPriceSettings } from '../services/settings';
import { Plus, User, Storefront, ArrowLeft } from 'phosphor-react';

export default function Users() {
    const navigate = useNavigate();
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Check URL params for active tab
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') || 'settings';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Settings state
    const [appSettings, setAppSettings] = useState(null);
    const [priceSettings, setPriceSettings] = useState([]);
    const [settingsLoading, setSettingsLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Gagal mengambil data pengguna');
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        setSettingsLoading(true);
        try {
            const [appData, priceData] = await Promise.all([
                getAppSettings(),
                getPriceSettings(),
            ]);
            setAppSettings(appData);
            setPriceSettings(priceData);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setSettingsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchSettings();
    }, []);

    const handleAddUser = () => {
        setSelectedUser(null);
        setModalOpen(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleFormSubmit = async (formData) => {
        setActionLoading(true);
        try {
            if (selectedUser) {
                // Update
                const { full_name, is_owner, is_active } = formData;
                await updateUser(selectedUser.id, { full_name, is_owner, is_active });
            } else {
                // Create
                await createUser(formData);
            }
            fetchUsers();
            setModalOpen(false);
        } catch (error) {
            console.error('Error saving user:', error);
            alert(`Gagal ${selectedUser ? 'mengupdate' : 'menambah'} pengguna: ${error.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (id, isActive) => {
        if (!confirm(`Apakah Anda yakin ingin ${isActive ? 'mengaktifkan' : 'menonaktifkan'} pengguna ini?`)) return;

        try {
            await toggleUserStatus(id, isActive);
            fetchUsers();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Gagal mengubah status pengguna');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini secara permanen? Tindakan ini tidak dapat dibatalkan.')) return;

        try {
            await deleteUser(id);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Gagal menghapus pengguna. Pastikan Anda memiliki izin akses owner.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <Navigation />

            <div className="flex-1 flex flex-col pb-16 md:pb-0">
                <Header transparent={true} />

                {/* World-Class Header Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white pb-10 pt-20 -mt-20 px-6 shadow-lg relative overflow-hidden mb-6">
                    <div className="max-w-4xl mx-auto flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={24} weight="bold" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Manajemen Toko</h1>
                            <p className="text-blue-100 text-sm">Kelola informasi toko, harga layanan, dan staf</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 w-full py-4">

                    {/* Tabs */}
                    <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings'
                                ? 'border-primary-500 text-primary-600 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <Storefront size={20} />
                            Layanan
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === 'users'
                                ? 'border-primary-500 text-primary-600 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <User size={20} />
                            Pengguna
                        </button>
                    </div>

                    {activeTab === 'settings' ? (
                        <div className="space-y-6">
                            {settingsLoading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <PriceSettingsTable priceSettings={priceSettings} onUpdate={fetchSettings} />
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Business Info */}
                            <div className="mb-8">
                                {settingsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
                                    </div>
                                ) : (
                                    <AppInfoForm settings={appSettings} onUpdate={fetchSettings} />
                                )}
                            </div>

                            {/* Staff Management */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">Kelola Pengguna</h2>
                                    <p className="text-slate-500 text-sm">Kelola akses kasir dan pemilik toko</p>
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleAddUser}
                                    className="w-full sm:w-auto"
                                >
                                    <Plus size={20} weight="bold" />
                                    Tambah Pengguna
                                </Button>
                            </div>

                            <UserList
                                users={users}
                                loading={loading}
                                onEdit={handleEditUser}
                                onToggleStatus={handleToggleStatus}
                                onDelete={handleDeleteUser}
                            />
                        </>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={() => !actionLoading && setModalOpen(false)}
                title={selectedUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            >
                <UserForm
                    user={selectedUser}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setModalOpen(false)}
                    loading={actionLoading}
                />
            </Modal>
        </div>
    );
}
