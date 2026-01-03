/**
 * Generate transaction number with format: NML-YYYYMMDD-XXX
 */
export function generateTransactionNumber(lastNumber = null) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    let sequence = 1;

    // If last number exists and is from today, increment
    if (lastNumber && lastNumber.includes(dateStr)) {
        const parts = lastNumber.split('-');
        if (parts.length === 3) {
            sequence = parseInt(parts[2]) + 1;
        }
    }

    const sequenceStr = String(sequence).padStart(3, '0');
    return `NML-${dateStr}-${sequenceStr}`;
}

/**
 * Get next transaction number from database
 */
export async function getNextTransactionNumber(supabase) {
    // Get today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get last transaction from today
    const { data, error } = await supabase
        .from('transactions')
        .select('transaction_number')
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) throw error;

    const lastNumber = data && data.length > 0 ? data[0].transaction_number : null;
    return generateTransactionNumber(lastNumber);
}
