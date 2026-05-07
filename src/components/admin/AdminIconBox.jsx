import { Box, useTheme, alpha } from '@mui/material';

/**
 * AdminIconBox — The colored icon-in-box pattern used everywhere in admin pages.
 *
 * @param {string} icon     - Font Awesome class
 * @param {string} [color]  - MUI palette key ('primary', 'success', etc.) or hex color
 * @param {number} [size]   - Box size in px (default: 40)
 * @param {number} [fontSize] - Icon font size in px (default: 20)
 * @param {boolean} [round] - Use circular shape (default: false)
 */
function AdminIconBox({ icon, color = 'primary', size = 40, fontSize = 20, round = false }) {
    const theme = useTheme();

    // Detect if it's a palette key or direct hex color
    const paletteColor = theme.palette[color]?.main;
    const bgColor = paletteColor
        ? alpha(paletteColor, 0.1)
        : alpha(color, 0.1);
    const fgColor = paletteColor ? `${color}.main` : color;

    return (
        <Box sx={{
            width: size,
            height: size,
            borderRadius: round ? '50%' : 1,
            bgcolor: bgColor,
            color: fgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize,
            flexShrink: 0,
        }}>
            <i className={icon} />
        </Box>
    );
}

export default AdminIconBox;
