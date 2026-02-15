import ar from './ar.json';
import en from './en.json';

const translations = { ar, en };

// Default language is Arabic
let currentLanguage = 'ar';

/**
 * Set the current language
 * @param {string} lang - 'ar' or 'en'
 */
export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('nour-lang', lang);
  }
};

/**
 * Get the current language
 * @returns {string} Current language code
 */
export const getLanguage = () => currentLanguage;

/**
 * Initialize language from localStorage or default to Arabic
 */
export const initLanguage = () => {
  const savedLang = localStorage.getItem('nour-lang') || 'ar';
  setLanguage(savedLang);
};

/**
 * Get a translation by key path (e.g., 'nav.home')
 * @param {string} keyPath - Dot-separated key path
 * @param {object} params - Optional parameters for interpolation
 * @returns {string} Translated string
 */
export const t = (keyPath, params = {}) => {
  const keys = keyPath.split('.');
  let value = translations[currentLanguage];
  
  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      // Fallback to English if key not found in current language
      value = keys.reduce((obj, k) => obj?.[k], translations.en);
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
  const formatted = new Intl.NumberFormat(currentLanguage === 'ar' ? 'ar-EG' : 'en-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return currentLanguage === 'ar' ? `${formatted} ج.م` : `EGP ${formatted}`;
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
    currentLanguage === 'ar' ? 'ar-EG' : 'en-EG',
    { ...defaultOptions, ...options }
  ).format(dateObj);
};

/**
 * Format number according to current locale
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat(currentLanguage === 'ar' ? 'ar-EG' : 'en-EG').format(num);
};

export default { t, setLanguage, getLanguage, initLanguage, formatCurrency, formatDate, formatNumber };
