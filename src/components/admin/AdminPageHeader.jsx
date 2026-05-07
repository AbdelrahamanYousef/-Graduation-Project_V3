import { Box, Typography, Button, Stack } from '@mui/material';

/**
 * AdminPageHeader — Standardized page header for all admin pages.
 *
 * @param {string}  title     - Page title (h4)
 * @param {string}  subtitle  - Page subtitle (body2)
 * @param {object}  [action]  - Primary action button { label, icon, onClick, variant, color }
 * @param {object}  [secondaryAction] - Secondary action button
 * @param {React.ReactNode} [children] - Additional content (e.g. extra buttons)
 */
function AdminPageHeader({ title, subtitle, action, secondaryAction, children }) {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
        }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <Stack direction="row" spacing={2} alignItems="center">
                {children}
                {secondaryAction && (
                    <Button
                        variant={secondaryAction.variant || 'outlined'}
                        color={secondaryAction.color || 'inherit'}
                        onClick={secondaryAction.onClick}
                        startIcon={secondaryAction.icon && <i className={secondaryAction.icon} />}
                    >
                        {secondaryAction.label}
                    </Button>
                )}
                {action && (
                    <Button
                        variant={action.variant || 'contained'}
                        color={action.color || 'primary'}
                        onClick={action.onClick}
                        startIcon={action.icon && <i className={action.icon} />}
                    >
                        {action.label}
                    </Button>
                )}
            </Stack>
        </Box>
    );
}

export default AdminPageHeader;
