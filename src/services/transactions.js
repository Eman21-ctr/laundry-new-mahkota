import { supabase } from './supabase';
import { getNextTransactionNumber } from '../utils/generators';

/**
 * Get transactions with optional filters
 */
export async function getTransactions({ status, search, startDate, endDate, limit = 100 } = {}) {
    let query = supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    if (search) {
        query = query.or(`transaction_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    if (startDate) {
        query = query.gte('date_in', startDate);
    }

    if (endDate) {
        query = query.lte('date_in', endDate);
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id) {
    const { data, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get dashboard stats (Monthly Revenue, Today's Transactions, Active Orders)
 */
export async function getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Reset time for start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.toISOString();

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const endOfDayISO = endOfDay.toISOString();

    try {
        // 1. Monthly Revenue
        const { data: monthData, error: monthError } = await supabase
            .from('transactions')
            .select('total_amount')
            .gte('date_in', startOfMonth);

        if (monthError) throw monthError;
        const monthlyRevenue = monthData.reduce((sum, t) => sum + (parseFloat(t.total_amount) || 0), 0);

        // 2. Today's Transactions Count
        const { count: todayCount, error: todayError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .gte('date_in', startOfDay)
            .lte('date_in', endOfDayISO);

        if (todayError) throw todayError;

        // 3. All Active Orders (Proses or Selesai)
        const { count: activeCount, error: activeError } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .in('status', ['proses', 'selesai']);

        if (activeError) throw activeError;

        return {
            totalTransactions: todayCount || 0,
            totalRevenue: monthlyRevenue,
            activeOrders: activeCount || 0,
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
}

/**
 * Create new transaction
 */
export async function createTransaction(transactionData, items) {
    const {
        customer_id,
        customer_name,
        customer_phone,
        total_amount,
        paid_amount,
        status,
        notes,
        date_in,
        date_out,
        created_by,
        payment_method
    } = transactionData;

    // Generate transaction number
    const transaction_number = await getNextTransactionNumber(supabase);

    // Insert transaction
    const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
            transaction_number,
            customer_id,
            customer_name,
            customer_phone,
            total_amount,
            paid_amount,
            status,
            notes,
            date_in,
            date_out,
            created_by,
            payment_method
        })
        .select()
        .single();

    if (transactionError) throw transactionError;

    // Insert items
    const itemsToInsert = items.map(item => ({
        transaction_id: transaction.id,
        ...item,
    }));

    const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return transaction;
}

/**
 * Update transaction
 */
export async function updateTransaction(id, transactionData, items) {
    // Update transaction
    const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .update(transactionData)
        .eq('id', id)
        .select()
        .single();

    if (transactionError) throw transactionError;

    if (items) {
        // Delete existing items
        await supabase
            .from('transaction_items')
            .delete()
            .eq('transaction_id', id);

        // Insert new items
        const itemsToInsert = items.map(item => ({
            transaction_id: id,
            ...item,
        }));

        const { error: itemsError } = await supabase
            .from('transaction_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;
    }

    return transaction;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(id, status) {
    const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete transaction
 */
export async function deleteTransaction(id) {
    const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Get report statistics
 */
export async function getReportStats(startDate, endDate) {
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*, transaction_items(*)')
        .gte('date_in', startDate)
        .lte('date_in', endDate);

    if (error) throw error;

    const totalTransactions = transactions.length;
    const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.total_amount), 0);

    // Calculate total weight (kg)
    let totalWeight = 0;
    transactions.forEach(t => {
        t.transaction_items.forEach(item => {
            if (item.unit === 'kg') {
                totalWeight += parseFloat(item.quantity);
            }
        });
    });

    const averagePerTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Breakdown by item type
    const itemTypeBreakdown = {};
    transactions.forEach(t => {
        t.transaction_items.forEach(item => {
            if (!itemTypeBreakdown[item.item_type]) {
                itemTypeBreakdown[item.item_type] = {
                    quantity: 0,
                    subtotal: 0,
                    unit: item.unit,
                };
            }
            itemTypeBreakdown[item.item_type].quantity += parseFloat(item.quantity);
            itemTypeBreakdown[item.item_type].subtotal += parseFloat(item.subtotal);
        });
    });

    return {
        totalTransactions,
        totalRevenue,
        totalWeight,
        averagePerTransaction,
        itemTypeBreakdown,
        transactions,
    };
}
