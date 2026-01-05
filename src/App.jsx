import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import NewTransaction from './pages/NewTransaction';
import TransactionList from './pages/TransactionList';
import TransactionDetail from './pages/TransactionDetail';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Users from './pages/Users';
import RecordExpense from './pages/RecordExpense';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* Protected Routes */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/new-transaction"
                        element={
                            <ProtectedRoute>
                                <NewTransaction />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/transactions"
                        element={
                            <ProtectedRoute>
                                <TransactionList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/transactions/:id"
                        element={
                            <ProtectedRoute>
                                <TransactionDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Reports />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/record-expense"
                        element={
                            <ProtectedRoute>
                                <RecordExpense />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />

                    {/* Owner Only Routes */}
                    <Route
                        path="/users"
                        element={
                            <ProtectedRoute ownerOnly>
                                <Users />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch all - redirect to dashboard */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
