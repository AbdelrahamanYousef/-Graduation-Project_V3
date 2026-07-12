/**
 * Admin Shared Utilities
 * Single source of truth for status mappings, priority colors, and common helpers.
 */

// ─── Status Configuration ────────────────────────────────────
export const STATUS_CONFIG = {
    active:    { color: 'success', labelAr: 'نشط',          labelEn: 'Active' },
    completed: { color: 'success', labelAr: 'مكتمل',        labelEn: 'Completed' },
    pending:   { color: 'warning', labelAr: 'قيد المراجعة',  labelEn: 'Pending' },
    inactive:  { color: 'default', labelAr: 'غير نشط',      labelEn: 'Inactive' },
    approved:  { color: 'info',    labelAr: 'معتمد',         labelEn: 'Approved' },
    refunded:  { color: 'error',   labelAr: 'مسترد',         labelEn: 'Refunded' },
    connected: { color: 'success', labelAr: '✓ متصل',       labelEn: '✓ Connected' },
    disconnected: { color: 'default', labelAr: 'غير متصل',  labelEn: 'Disconnected' },
};

/**
 * Get Tailwind color for a given status
 * @param {string} status
 * @returns {string} color key
 */
export const getStatusColor = (status) =>
    STATUS_CONFIG[String(status).toLowerCase()]?.color || 'default';

/**
 * Get localized label for a given status string
 * @param {string} status
 * @param {string} lang - 'ar' or 'en'
 * @returns {string}
 */
export const getStatusLabel = (status, lang = 'ar') => {
    const key = String(status).toLowerCase();
    return lang === 'en'
        ? (STATUS_CONFIG[key]?.labelEn || status)
        : (STATUS_CONFIG[key]?.labelAr || status);
};

// ─── Priority Configuration ─────────────────────────────────
export const PRIORITY_CONFIG = {
    high:   { color: 'error',   labelAr: 'عالي',   labelEn: 'High' },
    medium: { color: 'warning', labelAr: 'متوسط',  labelEn: 'Medium' },
    low:    { color: 'success', labelAr: 'منخفض',  labelEn: 'Low' },
};

export const getPriorityColor = (priority) =>
    PRIORITY_CONFIG[priority]?.color || 'default';

// ─── Donation Type Color ────────────────────────────────────
export const getDonationTypeColor = (type) => {
    switch (type) {
        case 'زكاة':
        case 'zakat': return 'primary';
        case 'وقف':
        case 'waqf': return 'secondary';
        default: return 'default';
    }
};

// ─── Tab Filter Helper ──────────────────────────────────────
/**
 * Filter an array by status based on active tab.
 * If tab value is 'all', returns the full array.
 * @param {Array} items - Array of objects with `status` field
 * @param {string} tabValue - 'all' or a status key
 * @returns {Array}
 */
export const filterByStatus = (items, tabValue) =>
    tabValue === 'all' ? items : items.filter(item => String(item.status).toLowerCase() === String(tabValue).toLowerCase());

/**
 * Count items by status
 * @param {Array} items - Array of objects with `status` field
 * @param {string} status - Status key to count
 * @returns {number}
 */
export const countByStatus = (items, status) =>
    items.filter(item => String(item.status).toLowerCase() === String(status).toLowerCase()).length;
