import { supabase } from './supabase';

/**
 * Get app settings (laundry name, address, phone)
 */
export async function getAppSettings() {
    const { data, error } = await supabase
        .from('app_settings')
        .select('*');

    if (error) throw error;

    // Convert array to object
    const settings = {};
    data.forEach(item => {
        settings[item.key] = item.value;
    });

    return settings;
}

/**
 * Update app setting
 */
export async function updateAppSetting(key, value) {
    const { data, error } = await supabase
        .from('app_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get price settings
 */
export async function getPriceSettings() {
    const { data, error } = await supabase
        .from('price_settings')
        .select('*')
        .order('item_type');

    if (error) throw error;
    return data;
}

/**
 * Update price setting
 */
export async function updatePriceSetting(id, updates) {
    const { data, error } = await supabase
        .from('price_settings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}
