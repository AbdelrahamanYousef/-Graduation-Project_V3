import ar from './ar.json';

const translations = { ar };

// Apply direction + lang attribute right away
try {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
} catch { /* SSR / test env */ }

export const setLanguage = () => {};
export const getLanguage = () => 'ar';
export const initLanguage = () => {};

/**
 * Get a translation by key path (e.g., 'nav.home')
 * @param {string} keyPath - Dot-separated key path
 * @param {object} params - Optional parameters for interpolation
 * @returns {string} Translated string
 */
export const t = (keyPath, params = {}) => {
  const keys = keyPath.split('.');
  let value = translations['ar'];

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      value = undefined;
      break;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation not found for key: ${keyPath}`);
    return keyPath;
  }

  // Simple parameter interpolation: {{param}}
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => params[key] ?? `{{${key}}}`);
};

/**
 * Format currency in EGP
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formatted} ج.م`;
};

/**
 * Format date according to current locale
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions = { year: 'numeric', month: 'long', day: 'numeric' };

  return new Intl.DateTimeFormat(
    'ar-EG',
    { ...defaultOptions, ...options }
  ).format(dateObj);
};

/**
 * Format number according to current locale
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

export default { t, setLanguage, getLanguage, initLanguage, formatCurrency, formatDate, formatNumber };
