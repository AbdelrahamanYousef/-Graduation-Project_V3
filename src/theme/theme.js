import { createTheme } from '@mui/material/styles';

/**
 * Nour Charity MUI Theme
 * Custom-matched to existing tokens.css design tokens
 * Supports both light and dark modes, RTL-first
 */

// Design token values extracted from tokens.css
const primaryPalette = {
    50: '#e6f3f3',
    100: '#b3dcdc',
    200: '#80c5c5',
    300: '#4daeae',
    400: '#269898',
    500: '#0B6B6B', // Main primary
    600: '#095959',
    700: '#074747',
    800: '#053535',
    900: '#032323',
};

const secondaryPalette = {
    50: '#e8ebf1',
    100: '#bcc4d5',
    200: '#909db9',
    300: '#64769d',
    400: '#3b5581',
    500: '#12355B', // Main secondary
    600: '#0f2d4d',
    700: '#0c253f',
    800: '#091c31',
    900: '#061423',
};

const accentPalette = {
    50: '#fdf6e6',
    100: '#f9e5b3',
    200: '#f5d480',
    300: '#f1c34d',
    400: '#ecb226',
    500: '#D6A545', // Main accent
    600: '#b38a3a',
    700: '#906f2f',
    800: '#6d5424',
    900: '#4a3919',
};

// ─── Unified design constants ───────────────────────────────
const RADIUS = {
    xs: 6,     // chips, tooltips
    sm: 8,     // small buttons, inputs
    md: 12,    // cards, papers, buttons
    lg: 16,    // large cards, dialogs
    xl: 20,    // hero elements
    pill: 50,  // pill buttons (CTAs)
};

const SECTION_SPACING = 10; // consistent py for all homepage sections

// Shared component overrides that apply to both light and dark themes
const getComponentOverrides = (mode) => ({
    MuiCssBaseline: {
        styleOverrides: {
            body: {
                scrollBehavior: 'smooth',
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: RADIUS.md,
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: "'Tajawal', 'Inter', sans-serif",
                padding: '10px 24px',
            },
            containedPrimary: {
                '&:hover': {
                    backgroundColor: primaryPalette[600],
                },
            },
            sizeSmall: {
                padding: '6px 16px',
            },
            sizeLarge: {
                padding: '12px 32px',
                fontSize: '1rem',
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: RADIUS.lg,
                boxShadow: mode === 'light'
                    ? '0 2px 12px rgba(0, 0, 0, 0.06)'
                    : '0 2px 12px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            },
        },
    },
    MuiCardContent: {
        styleOverrides: {
            root: {
                padding: 24,
                '&:last-child': {
                    paddingBottom: 24,
                },
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: RADIUS.md,
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: RADIUS.md,
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: RADIUS.xs,
                fontFamily: "'Tajawal', 'Inter', sans-serif",
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: RADIUS.lg,
            },
        },
    },
    MuiTooltip: {
        styleOverrides: {
            tooltip: {
                borderRadius: RADIUS.xs,
                fontFamily: "'Tajawal', 'Inter', sans-serif",
            },
        },
    },
    MuiLinearProgress: {
        styleOverrides: {
            root: {
                height: 8,
                borderRadius: 4,
                backgroundColor: mode === 'light'
                    ? 'rgba(0, 0, 0, 0.06)'
                    : 'rgba(255, 255, 255, 0.08)',
            },
            bar: {
                borderRadius: 4,
            },
        },
    },
    MuiAvatar: {
        styleOverrides: {
            root: {
                fontFamily: "'Tajawal', 'Inter', sans-serif",
                fontWeight: 600,
            },
        },
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                borderRadius: RADIUS.sm,
            },
        },
    },
    MuiContainer: {
        defaultProps: {
            maxWidth: 'lg',
        },
    },
});

// Typography shared between modes
const typography = {
    fontFamily: "'Tajawal', 'Cairo', 'Inter', sans-serif",
    h1: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, '@media (min-width:768px)': { fontSize: '2.5rem' } },
    h2: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.25, '@media (min-width:768px)': { fontSize: '2rem' } },
    h3: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.3, '@media (min-width:768px)': { fontSize: '1.5rem' } },
    h4: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.3 },
    h5: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.35 },
    h6: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.35 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { fontWeight: 600 },
};

/**
 * Create a Nour theme for the given mode and direction
 * @param {'light'|'dark'} mode
 * @param {'ltr'|'rtl'} direction
 * @returns MUI theme object
 */
export function createNourTheme(mode = 'light', direction = 'ltr') {
    const isLight = mode === 'light';

    return createTheme({
        direction,
        palette: {
            mode,
            primary: {
                ...primaryPalette,
                main: isLight ? primaryPalette[500] : primaryPalette[400],
                light: isLight ? primaryPalette[300] : primaryPalette[200],
                dark: isLight ? primaryPalette[700] : primaryPalette[600],
                contrastText: '#ffffff',
            },
            secondary: {
                ...secondaryPalette,
                main: secondaryPalette[500],
                light: secondaryPalette[300],
                dark: secondaryPalette[700],
                contrastText: '#ffffff',
            },
            warning: {
                main: isLight ? '#F59E0B' : '#facc15',
                light: '#fce6b3',
                dark: '#a96e08',
            },
            success: {
                main: isLight ? '#1E9E54' : '#22c55e',
                light: '#c1e8cc',
                dark: '#147038',
            },
            error: {
                main: isLight ? '#DC2626' : '#ef4444',
                light: '#f3bebe',
                dark: '#981a1a',
            },
            background: {
                default: isLight ? '#F3F8F7' : '#0a1a1a', // Soft Mint/White for general page background
                paper: isLight ? '#FFFFFF' : '#132626',
                mint: isLight ? '#E6F1EF' : '#132626', // Mint in light mode, dark teal in dark mode
            },
            text: {
                primary: isLight ? '#111827' : '#F9FAFB',
                secondary: isLight ? '#6B7280' : '#8AACAC',
            },
            divider: isLight ? '#E5E7EB' : '#1e3535',
            // Custom accent color accessible via theme.palette.accent
            accent: {
                main: accentPalette[500],
                light: accentPalette[300],
                dark: accentPalette[700],
                contrastText: '#ffffff',
            },
            // Footer palette — avoids hardcoded grey values in components
            footer: {
                bg: isLight ? '#111827' : '#071515',
                text: isLight ? '#D1D5DB' : '#9CA3AF',
                textMuted: isLight ? '#6B7280' : '#6B7280',
                heading: '#FFFFFF',
                divider: isLight ? '#1F2937' : '#0f2a2a',
                iconBg: isLight ? '#1F2937' : '#0f2a2a',
            },
            // Hero section palette — specific user request
            hero: {
                base: '#0F5C54',
                dark: '#0B4741',
                overlay: 'rgba(255,255,255,0.08)',
                glow: 'rgba(255,255,255,0.05)',
            },
            // Navbar glass effect
            navbar: {
                glass: 'rgba(15, 92, 84, 0.75)',
                text: '#FFFFFF',
                blur: '8px',
            },
        },
        typography,
        shape: {
            borderRadius: RADIUS.md,
        },
        shadows: [
            'none',
            '0 1px 2px 0 rgba(0, 0, 0, 0.05)',                                         // 1
            isLight ? '0 2px 8px rgba(0, 0, 0, 0.06)' : '0 2px 8px rgba(0, 0, 0, 0.3)', // 2
            '0 4px 6px -1px rgba(0, 0, 0, 0.1)',                                         // 3
            isLight
                ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                : '0 4px 6px -1px rgba(0,0,0,0.25), 0 2px 4px -1px rgba(0,0,0,0.15)',    // 4
            isLight
                ? '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04)'
                : '0 10px 15px -3px rgba(0,0,0,0.3), 0 4px 6px -2px rgba(0,0,0,0.15)',   // 5
            ...Array(19).fill(
                isLight
                    ? '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'
                    : '0 20px 25px -5px rgba(0,0,0,0.35), 0 10px 10px -5px rgba(0,0,0,0.2)'
            ), // 6-24
        ],
        // ─── Custom Tokens (accessible via theme.custom.*) ─────
        custom: {
            radius: RADIUS,
            sectionPadding: SECTION_SPACING,
        },
        components: getComponentOverrides(mode),
    });
}

// Default export: light theme
export default createNourTheme('light');
