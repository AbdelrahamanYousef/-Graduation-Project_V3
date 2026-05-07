import {
    Box, Card, TextField, Tabs, Tab,
    InputAdornment, Stack, useTheme
} from '@mui/material';

/**
 * AdminFilterBar — Reusable filter bar with search, tabs, and dropdown filters.
 *
 * @param {string}  [searchValue]       - Current search value
 * @param {Function} [onSearchChange]   - Search change handler
 * @param {string}  [searchPlaceholder] - Search placeholder text
 * @param {Array}   [tabs]              - Tab definitions: { label, value }
 * @param {string}  [activeTab]         - Currently active tab value
 * @param {Function} [onTabChange]      - Tab change handler (event, newValue)
 * @param {React.ReactNode} [children]  - Additional filter dropdowns or controls
 */
function AdminFilterBar({
    searchValue,
    onSearchChange,
    searchPlaceholder = 'بحث...',
    tabs,
    activeTab,
    onTabChange,
    children
}) {
    const theme = useTheme();

    // Tabs-only mode
    if (tabs && !onSearchChange && !children) {
        return (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={activeTab}
                    onChange={onTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab) => (
                        <Tab
                            key={tab.value}
                            label={tab.label}
                            value={tab.value}
                            icon={tab.icon ? <i className={tab.icon} /> : undefined}
                            iconPosition={tab.icon ? 'start' : undefined}
                        />
                    ))}
                </Tabs>
            </Box>
        );
    }

    // Tabs with search
    if (tabs && onSearchChange) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={onTabChange}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    {tabs.map((tab) => (
                        <Tab key={tab.value} label={tab.label} value={tab.value} />
                    ))}
                </Tabs>
                <TextField
                    placeholder={searchPlaceholder}
                    size="small"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <i className="fa-solid fa-magnifying-glass" style={{ color: theme.palette.text.secondary }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
            </Box>
        );
    }

    // Full filter bar (search + dropdown filters)
    return (
        <Card elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {onSearchChange && (
                    <TextField
                        placeholder={searchPlaceholder}
                        variant="outlined"
                        size="small"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <i className="fa-solid fa-magnifying-glass" style={{ color: theme.palette.text.secondary }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                )}
                {children}
            </Box>
        </Card>
    );
}

export default AdminFilterBar;
