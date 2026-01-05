import { supabase } from './supabase';

/**
 * Get expenses with optional filters
 */
export async function getExpenses({ startDate, endDate, category, search, limit = 100 } = {}) {
    let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

    if (startDate) {
        query = query.gte('date', startDate);
    }

    if (endDate) {
        query = query.lte('date', endDate);
    }

    if (category) {
        query = query.eq('category', category);
    }

    if (search) {
        query = query.ilike('description', `%${search}%`);
    }

    query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

/**
 * Create new expense
 */
export async function createExpense(expenseData) {
    const { data, error } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update expense
 */
export async function updateExpense(id, expenseData) {
    const { data, error } = await supabase
        .from('expenses')
        .update(expenseData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Delete expense
 */
export async function deleteExpense(id) {
    const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

/**
 * Get expense statistics for a period
 */
export async function getExpenseStats(startDate, endDate) {
    const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) throw error;

    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // Breakdown by category
    const categoryBreakdown = {};
    expenses.forEach(e => {
        if (!categoryBreakdown[e.category]) {
            categoryBreakdown[e.category] = 0;
        }
        categoryBreakdown[e.category] += parseFloat(e.amount);
    });

    return {
        totalExpenses,
        categoryBreakdown,
        expenses
    };
}
