import { supabase } from './supabase';

/**
 * Get all users (owner only)
 */
export async function getUsers() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Create new user (owner only)
 */
export async function createUser({ email, password, full_name, is_owner }) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name,
            is_owner: is_owner || false,
        },
    });

    if (authError) throw authError;

    // The trigger will automatically create the user_profiles entry
    return authData.user;
}

/**
 * Update user profile (owner only)
 */
export async function updateUser(id, updates) {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete user (owner only)
 */
export async function deleteUser(id) {
    // This will cascade delete the user_profiles entry
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
}

/**
 * Toggle user active status (owner only)
 */
export async function toggleUserStatus(id, is_active) {
    return updateUser(id, { is_active });
}
