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
  loadingLabel = 'جاري الحفظ...',
  children
}) {
  const handleSubmit = () => {
    if (onSubmit) onSubmit();
    else onClose();
  };

  if (!open) return null;

  const maxWidthClass = {
    xs: 'max-w-sm',
    sm: 'max-w-lg',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  }[maxWidth] || 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative w-full ${maxWidthClass} bg-white dark:bg-neutral-800 rounded-2xl shadow-modal flex flex-col max-h-[90vh]`}>
        <div className="px-6 pt-5 pb-2">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{title}</h2>
        </div>
        <div className={`px-6 py-3 overflow-y-auto flex-1 ${dividers ? 'border-t border-b border-neutral-200 dark:border-neutral-700' : ''}`}>
          <div className="flex flex-col gap-4 pt-1">
            {children}
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 rounded-md font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-md font-semibold bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? loadingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminFormDialog;
