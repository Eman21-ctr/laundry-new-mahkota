import React, { createContext, useState, useEffect, useRef } from 'react';
import { getCurrentUser, onAuthStateChange, signOut as authSignOut } from '../services/auth';

export const AuthContext = createContext(null);

const IDLE_TIMEOUT = 120 * 60 * 1000;
const WARNING_TIME = 5 * 60 * 1000;

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showIdleWarning, setShowIdleWarning] = useState(false);

    const idleTimer = useRef(null);
    const warningTimer = useRef(null);
    const isFetching = useRef(false);

    const resetIdleTimer = () => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        if (warningTimer.current) clearTimeout(warningTimer.current);
        setShowIdleWarning(false);

        if (user) {
            warningTimer.current = setTimeout(() => {
                setShowIdleWarning(true);
            }, IDLE_TIMEOUT - WARNING_TIME);

            idleTimer.current = setTimeout(() => {
                signOut();
                alert('Sesi Anda telah berakhir karena tidak aktif selama 2 jam.');
            }, IDLE_TIMEOUT);
        }
    };

    const extendSession = () => resetIdleTimer();

    const signOut = async () => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        if (warningTimer.current) clearTimeout(warningTimer.current);
        await authSignOut();
        setUser(null);
    };

    useEffect(() => {
        let isMounted = true;

        async function fetchUser(force = false) {
            if (isFetching.current && !force) return;
            isFetching.current = true;

            console.log('AuthContext: Fetching user...');

            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), 5000));

            try {
                const currentUser = await Promise.race([getCurrentUser(), timeout]);
                if (isMounted) {
                    console.log('AuthContext: User loaded', currentUser?.email);
                    setUser(currentUser);
                    if (currentUser?.profile?.error) {
                        alert('Peringatan: Gagal memuat profil lengkap (RLS Error).');
                    }
                }
            } catch (error) {
                console.error('AuthContext: Load error', error);
                if (isMounted) setUser(null);
            } finally {
                setLoading(false);
                isFetching.current = false;
                console.log('AuthContext: Loading finished');
            }
        }

        fetchUser();

        const { data: authListener } = onAuthStateChange(async (event, session) => {
            console.log('AuthContext: Event', event);
            if (!isMounted) return;

            if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
            } else if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
                fetchUser(true);
            }
        });

        return () => {
            isMounted = false;
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (warningTimer.current) clearTimeout(warningTimer.current);
            authListener?.subscription?.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (user) {
            resetIdleTimer();
            const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
            const handler = () => resetIdleTimer();
            events.forEach(e => document.addEventListener(e, handler));
            return () => events.forEach(e => document.removeEventListener(e, handler));
        }
    }, [user]);

    const value = {
        user,
        loading,
        signOut,
        showIdleWarning,
        extendSession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
