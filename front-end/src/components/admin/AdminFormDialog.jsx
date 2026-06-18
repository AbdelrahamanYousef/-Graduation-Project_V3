import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Stack
} from '@mui/material';

/**
 * AdminFormDialog — Standardized modal/dialog wrapper for add/edit forms.
 * Replaces ~150 lines of duplicated dialog markup across Programs, Projects, Beneficiaries.
 *
 * @param {boolean} open - Controls dialog visibility
 * @param {Function} onClose - Close handler
 * @param {string} title - Dialog title
 * @param {Function} [onSubmit] - Submit handler
 * @param {string} [submitLabel] - Submit button label (default: 'حفظ')
 * @param {string} [cancelLabel] - Cancel button label (default: 'إلغاء')
 * @param {string} [maxWidth] - MUI maxWidth prop (default: 'sm')
 * @param {boolean} [dividers] - Show content dividers
 * @param {boolean} [loading] - Show loading state on submit
 * @param {React.ReactNode} children - Form fields
 */
function AdminFormDialog({
    open,
    onClose,
    title,
    onSubmit,
    submitLabel = 'حفظ',
    cancelLabel = 'إلغاء',
    maxWidth = 'sm',
    dividers = false,
    loading = false,
    children
}) {
    const handleSubmit = () => {
        if (onSubmit) onSubmit();
        else onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth={maxWidth}
            PaperProps={{ sx: { borderRadius: 2 } }}
        >
            <DialogTitle sx={{ pb: 1 }}>{title}</DialogTitle>
            <DialogContent dividers={dividers}>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    {children}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button onClick={onClose} color="inherit" disabled={loading}>
                    {cancelLabel}
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="primary"
                    disabled={loading}
                >
                    {loading ? 'جاري الحفظ...' : submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AdminFormDialog;
