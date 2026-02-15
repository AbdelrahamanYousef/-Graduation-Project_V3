import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { QueryClientProvider } from '@tanstack/react-query';

import queryClient from '../api/queryClient';
import { createNourTheme } from '../theme/theme';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { ToastProvider } from '../components/common';

// RTL Emotion cache for Arabic
const rtlCache = createCache({
    key: 'muirtl',
    stylisPlugins: [prefixer, rtlPlugin],
});

// LTR Emotion cache for English
const ltrCache = createCache({
    key: 'muiltr',
});

/**
 * MuiBridge — reads the app's isDark state from ThemeContext
 * and provides a reactively-updated MUI theme.
 *
 * CssBaseline is intentionally omitted to let tokens.css
 * remain the single source of truth for body/background styles.
 */
function MuiBridge({ children }) {
    const { isDark, language } = useTheme();
    const isRtl = language === 'ar';

    const muiTheme = useMemo(
        () => createNourTheme(isDark ? 'dark' : 'light', isRtl ? 'rtl' : 'ltr'),
        [isDark, isRtl],
    );

    const emotionCache = isRtl ? rtlCache : ltrCache;

    return (
        <CacheProvider value={emotionCache}>
            <MuiThemeProvider theme={muiTheme}>
                <CssBaseline />
                {children}
            </MuiThemeProvider>
        </CacheProvider>
    );
}

/**
 * AppProviders — Unified provider tree for the Nour Charity app.
 *
 * Provider order (outermost → innermost):
 *   QueryClientProvider → AuthProvider → NotificationProvider
 *   → ThemeProvider (app state) → MuiBridge (MUI reactive theme) → ToastProvider → children
 */
export default function AppProviders({ children }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <NotificationProvider>
                    <ThemeProvider>
                        <MuiBridge>
                            <ToastProvider>
                                {children}
                            </ToastProvider>
                        </MuiBridge>
                    </ThemeProvider>
                </NotificationProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
