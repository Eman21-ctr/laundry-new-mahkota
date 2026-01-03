import { supabase } from './supabase';

/**
 * Sign in with email and password
 */
export async function signIn(email, password, rememberMe = false) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;

    // Update last_login in user_profiles (optional, don't block login if it fails)
    if (data.user) {
        try {
            await supabase
                .from('user_profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.user.id);
        } catch (e) {
            console.error('Failed to update last login:', e);
        }
    }

    return data;
}

/**
 * Sign out current user
 */
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
}

/**
 * Get current session
 */
export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

/**
 * Get current user with profile
 */
export async function getCurrentUser() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) return null;

    // Fetch user profile
    try {
        const fetchProfile = supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // 3 second timeout for profile fetch specifically
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
        });

        const { data: profile, error: profileError } = await Promise.race([
            fetchProfile,
            timeoutPromise
        ]);

        if (profileError) throw profileError;

        return {
            ...user,
            profile,
        };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return {
            ...user,
            profile: { full_name: user.email, is_owner: false, error: true }
        };
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
}

/**
 * Update password
 */
export async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (error) throw error;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}
