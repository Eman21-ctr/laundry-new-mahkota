import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Navigation from '../components/layout/Navigation';
import Container from '../components/layout/Container';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import { getUsers, createUser, updateUser, deleteUser, toggleUserStatus } from '../services/users';
import { Plus } from 'phosphor-react';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

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

    useEffect(() => {
        fetchUsers();
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
                <Header />

                <Container className="flex-1 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Kelola Pengguna</h1>
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
                </Container>
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
