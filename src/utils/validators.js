/**
 * Validate email format
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate Indonesian phone number (08xx or 62xxx)
 */
export function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return /^(08|628)\d{8,11}$/.test(cleaned);
}

/**
 * Validate password strength (min 6 characters)
 */
export function validatePassword(password) {
    return password && password.length >= 6;
}

/**
 * Validate positive number
 */
export function validatePositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Validate date range (end after start)
 */
export function validateDateRange(startDate, endDate) {
    return new Date(endDate) > new Date(startDate);
}
