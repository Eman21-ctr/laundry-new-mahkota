import { supabase } from './supabase';

/**
 * Search customers by name or phone
 */
export async function searchCustomers(query) {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) throw error;
    return data;
}

/**
 * Get all customers
 */
export async function getCustomers() {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Create or get existing customer
 */
export async function createOrGetCustomer(name, phone) {
    // Check if customer exists
    const { data: existing, error: searchError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();

    if (existing) {
        // Update name if changed
        if (existing.name !== name) {
            const { data: updated, error: updateError } = await supabase
                .from('customers')
                .update({ name })
                .eq('id', existing.id)
                .select()
                .single();

            if (updateError) throw updateError;
            return updated;
        }
        return existing;
    }

    // Create new customer
    const { data, error } = await supabase
        .from('customers')
        .insert({ name, phone })
        .select()
        .single();

    if (error) throw error;
    return data;
}
