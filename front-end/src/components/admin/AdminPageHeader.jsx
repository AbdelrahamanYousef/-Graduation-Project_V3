import { Box, Typography, Button, Stack } from '@mui/material';

function AdminPageHeader({ title, subtitle, action, secondaryAction, children }) {
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 3,
            mb: 3
        }}>
            <Box>
                <Typography variant="h4" component="h1" sx={{
                    fontWeight: '700',
                    fontSize: '1.75rem',
                    lineHeight: 1.3,
                    mb: 0.5,
                    color: 'text.primary'
                }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" sx={{
                        color: 'text.secondary',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                    }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
                {children}
                {secondaryAction && (
                    <Button
                        variant={secondaryAction.variant || 'outlined'}
                        color={secondaryAction.color || 'inherit'}
                        onClick={secondaryAction.onClick}
                        startIcon={secondaryAction.icon && <i className={secondaryAction.icon} />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            borderRadius: 1,
                            borderColor: 'divider'
                        }}
                    >
                        {secondaryAction.label}
                    </Button>
                )}
                {action && (
                    <Button
                        variant={action.variant || 'contained'}
                        color={action.color || 'secondary'}
                        onClick={action.onClick}
                        startIcon={action.icon && <i className={action.icon} />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            borderRadius: 1,
                            px: 3
                        }}
                    >
                        {action.label}
                    </Button>
                )}
            </Stack>
        </Box>
    );
}

export default AdminPageHeader;
