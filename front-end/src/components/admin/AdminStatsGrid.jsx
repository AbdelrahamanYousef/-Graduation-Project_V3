import { Grid, Card, CardContent, Typography, Box, Chip, useTheme, alpha, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

function AdminStatsGrid({ stats, columns }) {
    const theme = useTheme();
    const mdCols = columns || Math.min(12 / stats.length, 4);

    return (
        <Grid container spacing={2} sx={{ mb: 3 }}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={mdCols} key={index}>
                    <Card
                        elevation={0}
                        sx={{
                            border: '1px solid',
                            borderColor: stat.gradient ? 'transparent' : 'divider',
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                borderColor: stat.gradient ? 'transparent' : alpha(theme.palette.secondary.main, 0.3),
                                transform: 'translateY(-2px)',
                                boxShadow: stat.gradient ? 'none' : `0 4px 12px ${alpha(theme.palette.secondary.main, 0.1)}`
                            },
                            ...(stat.gradient && {
                                background: `linear-gradient(135deg, ${theme.palette[stat.color]?.main || stat.color}, ${theme.palette[stat.color]?.dark || stat.color})`,
                                color: 'white',
                                boxShadow: `0 4px 16px ${alpha(theme.palette[stat.color]?.main || stat.color, 0.2)}`
                            }),
                        }}
                    >
                        <CardActionArea
                            component={stat.link ? Link : 'div'}
                            to={stat.link}
                            sx={{
                                height: '100%',
                                p: 2.5,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start'
                            }}
                        >
                            {/* Header row: icon + change badge */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                width: '100%',
                                gap: 1,
                                mb: 1.5
                            }}>
                                <Box sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 1,
                                    bgcolor: stat.gradient
                                        ? 'rgba(255,255,255,0.2)'
                                        : alpha(theme.palette[stat.color]?.main || theme.palette.secondary.main, 0.12),
                                    color: stat.gradient
                                        ? 'inherit'
                                        : `${stat.color}.main`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                }}>
                                    {stat.icon && <i className={stat.icon} />}
                                </Box>
                                {stat.change && (
                                    <Chip
                                        label={stat.change}
                                        size="small"
                                        color={stat.trend === 'down' ? 'error' : 'success'}
                                        variant="filled"
                                        sx={{
                                            height: 22,
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Value */}
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: '700',
                                    fontSize: '1.8rem',
                                    lineHeight: 1.2,
                                    mb: 0.5,
                                    color: 'inherit'
                                }}
                            >
                                {stat.value}
                            </Typography>

                            {/* Label */}
                            <Typography
                                variant="body2"
                                sx={{
                                    color: stat.gradient ? 'rgba(255,255,255,0.85)' : 'text.secondary',
                                    fontWeight: '500',
                                    fontSize: '0.875rem'
                                }}
                            >
                                {stat.label}
                            </Typography>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

export default AdminStatsGrid;
