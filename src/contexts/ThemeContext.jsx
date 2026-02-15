import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setLanguage } from '../i18n';

const ThemeContext = createContext(null);

/**
 * ThemeProvider - Manages dark/light mode and language (AR/EN)
 * Persists both preferences in localStorage
 */
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        try {
            return localStorage.getItem('nour-theme') === 'dark';
        } catch {
            return false;
        }
    });

    // Read language directly from localStorage (not getLanguage which may not be initialized yet)
    const [language, setLang] = useState(() => {
        try {
            return localStorage.getItem('nour-lang') || 'ar';
        } catch {
            return 'ar';
        }
    });

    // Sync the i18n module with persisted language on mount
    useEffect(() => {
        setLanguage(language);
    }, [language]);

    // Apply dark mode class to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('nour-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    const toggleTheme = useCallback(() => {
        setIsDark(prev => !prev);
    }, []);

    const toggleLanguage = useCallback(() => {
        const newLang = language === 'ar' ? 'en' : 'ar';
        localStorage.setItem('nour-lang', newLang);
        setLanguage(newLang);
        setLang(newLang);
        // Reload to re-render all translated strings
        window.location.reload();
    }, [language]);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, language, toggleLanguage }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
    return ctx;
}

export default ThemeContext;
