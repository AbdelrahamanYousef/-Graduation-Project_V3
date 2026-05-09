import { Grid, Card, CardContent, Typography, Box, Chip, useTheme, alpha, CardActionArea } from '@mui/material';
import { Link } from 'react-router-dom';

/**
 * AdminStatsGrid — Reusable KPI / stats card grid.
 * Replaces ~200 lines of duplicated stat cards across Dashboard, Donations, Beneficiaries, Finance.
 *
 * @param {Array} stats - Array of stat objects:
 *   { label, value, icon, color, change, trend, gradient }
 * @param {number} [columns] - Grid columns per stat (default: auto based on count)
 */
function AdminStatsGrid({ stats, columns }) {
    const theme = useTheme();
    const mdCols = columns || Math.min(12 / stats.length, 4);

    return (
        <Grid container spacing={2}>
            {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={mdCols} key={index}>
                    <Card
                        elevation={0}
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            height: '100%',
                            ...(stat.gradient && {
                                background: `linear-gradient(135deg, ${theme.palette[stat.color]?.main || stat.color}, ${theme.palette[stat.color]?.dark || stat.color})`,
                                color: 'white',
                                borderColor: 'transparent',
                            }),
                        }}
                    >
                            <CardActionArea 
                                component={stat.link ? Link : 'div'} 
                                to={stat.link} 
                                sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                            >
                                {/* Header row: icon + change badge */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: 1 }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 1,
                                        bgcolor: stat.gradient
                                            ? 'rgba(255,255,255,0.2)'
                                            : alpha(theme.palette[stat.color]?.main || theme.palette.primary.main, 0.1),
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
                                            variant="soft"
                                            sx={{ height: 20, fontSize: 10 }}
                                        />
                                    )}
                                </Box>

                                {/* Value */}
                                <Typography
                                    variant={stat.variant || 'h4'}
                                    fontWeight="bold"
                                    sx={{ mt: 1 }}
                                >
                                    {stat.value}
                                </Typography>

                                {/* Label */}
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: stat.gradient ? 'rgba(255,255,255,0.8)' : 'text.secondary',
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
