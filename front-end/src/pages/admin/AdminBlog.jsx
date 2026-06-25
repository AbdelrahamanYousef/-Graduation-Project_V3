import { useState, useCallback, useEffect, useMemo } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminDataTable, AdminFormDialog, AdminStatusChip } from '../../components/admin';
import { t, formatDate } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CATEGORIES = ['أخبار', 'تقارير', 'قصص نجاح', 'فعاليات', 'مقالات'];

function AdminBlog() {
    const { state, dispatch } = useAdminData();
    const posts = state.blogPosts || [];
    const galleryItems = state.gallery || [];

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'gallery' ? 'gallery' : 'blog';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    // ─── NEWS / ARTICLES MANAGEMENT STATE ───
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [formData, setFormData] = useState({ title: '', summary: '', content: '', image: '', category: 'أخبار', author: '', featured: false, status: 'draft', images: [] });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, post: null });
    const [newImageForm, setNewImageForm] = useState({ url: '', caption: '' });

    const resetForm = () => {
        setFormData({ title: '', summary: '', content: '', image: '', category: 'أخبار', author: '', featured: false, status: 'draft', images: [] });
        setNewImageForm({ url: '', caption: '' });
    };

    const handleAdd = () => {
        setSelectedPost(null);
        resetForm();
        setIsModalOpen(true);
    };

    const handleEdit = useCallback((post) => {
        setSelectedPost(post);
        setFormData({
            title: post.title || '',
            summary: post.summary || '',
            content: post.content || '',
            image: post.image || '',
            category: post.category || 'أخبار',
            author: post.author || '',
            featured: post.featured || false,
            status: post.status || 'draft',
            images: post.images || []
        });
        setIsModalOpen(true);
    }, []);

    const handleDelete = useCallback((post) => {
        setDeleteConfirm({ open: true, post });
    }, []);

    const confirmDelete = () => {
        const { post } = deleteConfirm;
        if (!post) return;
        dispatch({ type: 'DELETE_BLOG_POST', payload: post.id });
        setSnackbar({ open: true, msg: `تم حذف "${post.title}" بنجاح`, severity: 'success' });
        setDeleteConfirm({ open: false, post: null });
    };

    const handleSubmit = () => {
        if (!formData.title.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال عنوان الخبر', severity: 'error' });
            return;
        }

        if (selectedPost) {
            dispatch({ type: 'UPDATE_BLOG_POST', payload: { ...selectedPost, ...formData } });
            setSnackbar({ open: true, msg: `تم تحديث "${formData.title}" بنجاح`, severity: 'success' });
        } else {
            dispatch({
                type: 'ADD_BLOG_POST',
                payload: {
                    id: Date.now(),
                    ...formData,
                    publishedAt: formData.status === 'published' ? new Date().toISOString() : null,
                }
            });
            setSnackbar({ open: true, msg: `تم إضافة "${formData.title}"`, severity: 'success' });
        }
        setIsModalOpen(false);
        resetForm();
    };

    const toggleStatus = (post) => {
        const newStatus = post.status === 'published' ? 'draft' : 'published';
        dispatch({ type: 'UPDATE_BLOG_POST', payload: { ...post, status: newStatus, publishedAt: newStatus === 'published' ? new Date().toISOString() : post.publishedAt } });
        setSnackbar({ open: true, msg: newStatus === 'published' ? 'تم النشر' : 'تم الحفظ كمسودة', severity: 'info' });
    };

    // Attached Images Handlers (News)
    const handleAddAttachedImage = () => {
        if (!newImageForm.url.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال رابط الصورة أولاً', severity: 'error' });
            return;
        }
        const newImg = {
            id: Date.now() + Math.random(),
            url: newImageForm.url,
            caption: newImageForm.caption || '',
            order: (formData.images || []).length + 1
        };
        setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), newImg]
        }));
        setNewImageForm({ url: '', caption: '' });
    };

    const handleRemoveAttachedImage = (id) => {
        setFormData(prev => {
            const filtered = (prev.images || []).filter(img => img.id !== id);
            const reordered = filtered.map((img, idx) => ({ ...img, order: idx + 1 }));
            return { ...prev, images: reordered };
        });
    };

    const handleUpdateAttachedImageCaption = (id, caption) => {
        setFormData(prev => ({
            ...prev,
            images: (prev.images || []).map(img => img.id === id ? { ...img, caption } : img)
        }));
    };

    const handleMoveAttachedImage = (index, direction) => {
        setFormData(prev => {
            const list = [...(prev.images || [])];
            if (direction === 'up' && index > 0) {
                const temp = list[index];
                list[index] = list[index - 1];
                list[index - 1] = temp;
            } else if (direction === 'down' && index < list.length - 1) {
                const temp = list[index];
                list[index] = list[index + 1];
                list[index + 1] = temp;
            }
            const updated = list.map((img, idx) => ({ ...img, order: idx + 1 }));
            return { ...prev, images: updated };
        });
    };

    const columns = [
        { key: 'title', label: 'العنوان', render: (val, row) => (
            <div>
                <p className="text-sm font-medium">{val}</p>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">{row.summary?.slice(0, 60)}</span>
                {row.images && row.images.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-primary-50 dark:bg-primary-950/20 text-primary-600 px-1.5 py-0.5 rounded-full mr-2">
                        <i className="fa-regular fa-images"></i> {row.images.length} صور
                    </span>
                )}
            </div>
        )},
        { key: 'category', label: 'التصنيف', render: (val) => <AdminStatusChip status={val} /> },
        { key: 'status', label: 'الحالة', render: (val) => (
            <AdminStatusChip status={val === 'published' ? 'active' : 'inactive'} label={val === 'published' ? 'منشور' : 'مسودة'} />
        )},
        { key: 'publishedAt', label: 'التاريخ', render: (val) => val ? formatDate(val) : '-' },
    ];

    const actions = [
        { icon: 'fa-solid fa-pen-to-square', tooltip: 'تعديل', onClick: (row) => handleEdit(row), color: 'primary' },
        { icon: 'fa-solid fa-globe', tooltip: 'نشر / إخفاء', onClick: (row) => toggleStatus(row) },
        { icon: 'fa-solid fa-trash', tooltip: 'حذف', onClick: (row) => handleDelete(row), color: 'error' },
    ];

    // ─── GALLERY MANAGEMENT STATE ───
    const [galleryEventFilter, setGalleryEventFilter] = useState('all');
    const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
    const [selectedGalleryItem, setSelectedGalleryItem] = useState(null);
    const [galleryFormData, setGalleryFormData] = useState({ title: '', description: '', image: '', eventId: 'general', order: 0 });
    const [galleryDeleteConfirm, setGalleryDeleteConfirm] = useState({ open: false, item: null });

    const resetGalleryForm = () => setGalleryFormData({ title: '', description: '', image: '', eventId: 'general', order: 0 });

    const handleAddGalleryItem = () => {
        setSelectedGalleryItem(null);
        resetGalleryForm();
        setIsGalleryModalOpen(true);
    };

    const handleEditGalleryItem = (item) => {
        setSelectedGalleryItem(item);
        setGalleryFormData({
            title: item.title || '',
            description: item.description || '',
            image: item.image || '',
            eventId: item.eventId ? String(item.eventId) : 'general',
            order: item.order || 0
        });
        setIsGalleryModalOpen(true);
    };

    const handleDeleteGalleryItem = (item) => {
        setGalleryDeleteConfirm({ open: true, item });
    };

    const confirmDeleteGalleryItem = () => {
        if (!galleryDeleteConfirm.item) return;
        dispatch({ type: 'DELETE_GALLERY_ITEM', payload: galleryDeleteConfirm.item.id });
        setSnackbar({ open: true, msg: 'تم الحذف بنجاح', severity: 'success' });
        setGalleryDeleteConfirm({ open: false, item: null });
    };

    const handleGallerySubmit = () => {
        if (!galleryFormData.image.trim() || !galleryFormData.title.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال العنوان ورابط الصورة', severity: 'error' });
            return;
        }

        const finalEventId = galleryFormData.eventId === 'general' ? 'general' : isNaN(galleryFormData.eventId) ? galleryFormData.eventId : Number(galleryFormData.eventId);
        const finalOrder = parseInt(galleryFormData.order, 10) || 0;
        const payload = { ...galleryFormData, eventId: finalEventId, order: finalOrder };

        if (selectedGalleryItem) {
            dispatch({ type: 'UPDATE_GALLERY_ITEM', payload: { ...selectedGalleryItem, ...payload } });
        } else {
            dispatch({ type: 'ADD_GALLERY_ITEM', payload: { id: Date.now(), ...payload } });
        }
        setSnackbar({ open: true, msg: selectedGalleryItem ? 'تم التحديث' : 'تمت الإضافة', severity: 'success' });
        setIsGalleryModalOpen(false);
        resetGalleryForm();
    };

    const handleMoveGalleryItem = (item, direction) => {
        const groupKey = item.eventId ? String(item.eventId) : 'general';
        const eventItems = galleryItems
            .filter(g => (g.eventId ? String(g.eventId) : 'general') === groupKey)
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const index = eventItems.findIndex(g => g.id === item.id);
        if (index === -1) return;

        let targetIndex = -1;
        if (direction === 'up' && index > 0) {
            targetIndex = index - 1;
        } else if (direction === 'down' && index < eventItems.length - 1) {
            targetIndex = index + 1;
        }

        if (targetIndex !== -1) {
            const list = [...eventItems];
            const temp = list[index];
            list[index] = list[targetIndex];
            list[targetIndex] = temp;

            list.forEach((img, idx) => {
                dispatch({
                    type: 'UPDATE_GALLERY_ITEM',
                    payload: { ...img, order: idx + 1 }
                });
            });
            setSnackbar({ open: true, msg: 'تم تحديث الترتيب بنجاح', severity: 'success' });
        }
    };

    // Filtered gallery items
    const filteredGalleryItems = useMemo(() => {
        let items = [...galleryItems];
        if (galleryEventFilter !== 'all') {
            items = items.filter(g => (g.eventId ? String(g.eventId) : 'general') === String(galleryEventFilter));
        }
        return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [galleryItems, galleryEventFilter]);

    // Helpers to get event title
    const getEventTitle = (eventId) => {
        if (!eventId || eventId === 'general') return 'عام / غير محدد';
        const post = posts.find(p => String(p.id) === String(eventId));
        return post ? post.title : 'فعالية غير معروفة';
    };

    const tabs = [
        { label: `الأخبار والمقالات (${posts.length})`, value: 'blog', icon: 'fa-solid fa-newspaper' },
        { label: `معرض الفعاليات (${galleryItems.length})`, value: 'gallery', icon: 'fa-solid fa-images' },
    ];

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader
                title="إدارة المدونة والمعرض"
                subtitle="تحكم في الأخبار والتقارير وقصص النجاح ومعرض الصور المرفق بها"
            />

            <AdminFilterBar tabs={tabs} activeTab={activeTab} onTabChange={(_, v) => setActiveTab(v)} />

            {/* TAB 1: NEWS AND ARTICLES */}
            {activeTab === 'blog' && (
                <div className="flex flex-col gap-3">
                    <div className="flex justify-end">
                        <button
                            onClick={handleAdd}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <i className="fa-solid fa-plus"></i> إضافة خبر جديد
                        </button>
                    </div>

                    <AdminDataTable columns={columns} data={posts} actions={actions} />
                </div>
            )}

            {/* TAB 2: EVENTS GALLERY */}
            {activeTab === 'gallery' && (
                <div className="flex flex-col gap-3">
                    {/* Filter & Actions Bar */}
                    <div className="flex justify-between items-center gap-3 bg-neutral-50 dark:bg-neutral-900/30 p-3 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50 flex-wrap">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">تصفية حسب الفعالية:</label>
                            <select
                                className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent text-sm outline-none dark:text-white"
                                value={galleryEventFilter}
                                onChange={(e) => setGalleryEventFilter(e.target.value)}
                            >
                                <option value="all">كل الفعاليات</option>
                                <option value="general">عام / غير محدد</option>
                                {posts.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleAddGalleryItem}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <i className="fa-solid fa-plus"></i> إضافة صورة للمعرض
                        </button>
                    </div>

                    {filteredGalleryItems.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
                            <i className="fa-regular fa-images" style={{ fontSize: 48, opacity: 0.3 }} />
                            <p className="mt-4">لا توجد صور مطابقة للتصفية</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 gap-3">
                            {filteredGalleryItems.map((img, index) => (
                                <div className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3" key={img.id}>
                                    <div className="relative rounded-xl bg-white dark:bg-neutral-800 shadow-md border border-neutral-100 dark:border-neutral-700 group overflow-hidden flex flex-col h-full transition-shadow duration-200 hover:shadow-lg">
                                        <img
                                            className="w-full h-44 object-cover"
                                            src={img.image}
                                            alt={img.title}
                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Error'; }}
                                        />
                                        <div className="p-3 flex-1 flex flex-col justify-between">
                                            <div>
                                                <p className="text-sm font-bold truncate dark:text-white">{img.title}</p>
                                                {img.description && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{img.description}</p>}
                                            </div>
                                            <div className="mt-2.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-700 flex justify-between items-center flex-wrap gap-1">
                                                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-700 px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300 max-w-[130px] truncate" title={getEventTitle(img.eventId)}>
                                                    {getEventTitle(img.eventId)}
                                                </span>
                                                <span className="text-[10px] font-bold text-neutral-400">الترتيب: {img.order || 0}</span>
                                            </div>
                                        </div>

                                        {/* Hover Overlay Controls */}
                                        <div className="absolute top-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                            {/* Reordering keys - display only when filtering by event */}
                                            {galleryEventFilter !== 'all' ? (
                                                <div className="flex gap-1">
                                                    <button
                                                        disabled={index === 0}
                                                        className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 disabled:hover:bg-black/60 transition-colors"
                                                        onClick={() => handleMoveGalleryItem(img, 'up')}
                                                        title="نقل للأمام"
                                                    >
                                                        <i className="fa-solid fa-arrow-right text-[10px]" />
                                                    </button>
                                                    <button
                                                        disabled={index === filteredGalleryItems.length - 1}
                                                        className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white disabled:opacity-30 disabled:hover:bg-black/60 transition-colors"
                                                        onClick={() => handleMoveGalleryItem(img, 'down')}
                                                        title="نقل للخلف"
                                                    >
                                                        <i className="fa-solid fa-arrow-left text-[10px]" />
                                                    </button>
                                                </div>
                                            ) : <div />}
                                            <div className="flex gap-1">
                                                <button
                                                    className="p-1.5 rounded-md bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                                                    onClick={() => handleEditGalleryItem(img)}
                                                    title="تعديل"
                                                >
                                                    <i className="fa-solid fa-pen text-[10px]" />
                                                </button>
                                                <button
                                                    className="p-1.5 rounded-md bg-error-500 hover:bg-error-600 text-white transition-colors"
                                                    onClick={() => handleDeleteGalleryItem(img)}
                                                    title="حذف"
                                                >
                                                    <i className="fa-solid fa-trash text-[10px]" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* NEWS MODAL DIALOG */}
            <AdminFormDialog
                open={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                onSubmit={handleSubmit}
                title={selectedPost ? 'تعديل الخبر' : 'إضافة خبر جديد'}
                submitLabel={selectedPost ? 'حفظ التغييرات' : 'إضافة'}
                maxWidth="md"
            >
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">العنوان</label>
                    <input autoFocus className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">ملخص قصير</label>
                    <textarea rows={2} className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" value={formData.summary} onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">المحتوى</label>
                    <textarea rows={5} className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" value={formData.content} onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">الصورة الرئيسية (رابط URL)</label>
                    <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white" value={formData.image} onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))} placeholder="https://example.com/image.jpg" />
                </div>

                {/* IMAGES LIST MANAGER (attached organized images for specific news event) */}
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-2">
                    <h6 className="text-sm font-bold mb-3 flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                        <i className="fa-solid fa-images text-primary-500"></i>
                        معرض صور الخبر (صور إضافية للخبر)
                    </h6>

                    {/* Add Image Inline Form */}
                    <div className="flex gap-2 mb-3 items-end flex-wrap md:flex-nowrap">
                        <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-neutral-500">رابط الصورة الإضافية</label>
                            <input
                                type="text"
                                placeholder="https://example.com/photo.jpg"
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent text-sm outline-none dark:text-white"
                                value={newImageForm.url}
                                onChange={(e) => setNewImageForm(prev => ({ ...prev, url: e.target.value }))}
                            />
                        </div>
                        <div className="flex-1 min-w-[200px] flex flex-col gap-1">
                            <label className="text-[10px] font-semibold text-neutral-500">تعليق الصورة</label>
                            <input
                                type="text"
                                placeholder="مثال: جانب من توزيع المواد الغذائية"
                                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent text-sm outline-none dark:text-white"
                                value={newImageForm.caption}
                                onChange={(e) => setNewImageForm(prev => ({ ...prev, caption: e.target.value }))}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddAttachedImage}
                            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold transition-colors h-[38px] flex items-center justify-center whitespace-nowrap"
                        >
                            إضافة الصورة
                        </button>
                    </div>

                    {/* Attached Images List */}
                    {formData.images && formData.images.length > 0 ? (
                        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-900/50">
                            {formData.images
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((img, index) => (
                                    <div key={img.id || index} className="flex items-center gap-3 bg-white dark:bg-neutral-800 p-2 rounded-lg border border-neutral-100 dark:border-neutral-700 shadow-sm">
                                        <img src={img.url} className="w-12 h-12 object-cover rounded-md border border-neutral-200 dark:border-neutral-600" onError={(e) => e.target.src = 'https://via.placeholder.com/150'} />
                                        <div className="flex-1 flex flex-col">
                                            <input
                                                type="text"
                                                className="bg-transparent border-b border-transparent hover:border-neutral-300 dark:hover:border-neutral-600 focus:border-primary-500 outline-none text-xs font-medium dark:text-white py-0.5"
                                                value={img.caption || ''}
                                                onChange={(e) => handleUpdateAttachedImageCaption(img.id, e.target.value)}
                                                placeholder="اكتب تعليقاً على الصورة..."
                                            />
                                            <span className="text-[10px] text-neutral-400">الترتيب: {img.order}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={index === 0}
                                                onClick={() => handleMoveAttachedImage(index, 'up')}
                                                className="p-1 rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30"
                                                title="نقل لأعلى"
                                            >
                                                <i className="fa-solid fa-arrow-up text-xs"></i>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={index === formData.images.length - 1}
                                                onClick={() => handleMoveAttachedImage(index, 'down')}
                                                className="p-1 rounded text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-30"
                                                title="نقل لأسفل"
                                            >
                                                <i className="fa-solid fa-arrow-down text-xs"></i>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAttachedImage(img.id)}
                                                className="p-1 rounded text-error-500 hover:bg-error-50 dark:hover:bg-error-950/20"
                                                title="حذف"
                                            >
                                                <i className="fa-solid fa-trash text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-xs text-center py-4 text-neutral-400">لا توجد صور إضافية مرفقة بهذا الخبر. استخدم الحقل أعلاه لإرفاق صور ومعرض كامل.</p>
                    )}
                </div>

                <div className="flex gap-2 mt-2">
                    <div className="flex flex-col gap-1.5 min-w-[150px]">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">التصنيف</label>
                        <select className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white dark:bg-neutral-800" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                            {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">الكاتب</label>
                        <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white" value={formData.author} onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))} />
                    </div>
                </div>
                <div className="flex gap-3">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="relative inline-block w-10 h-5">
                            <input type="checkbox" className="sr-only peer" checked={formData.featured} onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))} />
                            <span className="absolute inset-0 bg-neutral-300 dark:bg-neutral-600 rounded-full peer-checked:bg-primary-500 transition-colors"></span>
                            <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></span>
                        </span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">خبر مميز</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <span className="relative inline-block w-10 h-5">
                            <input type="checkbox" className="sr-only peer" checked={formData.status === 'published'} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'published' : 'draft' }))} />
                            <span className="absolute inset-0 bg-neutral-300 dark:bg-neutral-600 rounded-full peer-checked:bg-primary-500 transition-colors"></span>
                            <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform"></span>
                        </span>
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">نشر مباشرة</span>
                    </label>
                </div>
            </AdminFormDialog>

            {/* GALLERY FORM DIALOG */}
            <AdminFormDialog
                open={isGalleryModalOpen}
                onClose={() => { setIsGalleryModalOpen(false); resetGalleryForm(); }}
                onSubmit={handleGallerySubmit}
                title={selectedGalleryItem ? 'تعديل صورة المعرض' : 'إضافة صورة جديدة للمعرض'}
                submitLabel={selectedGalleryItem ? 'حفظ' : 'إضافة'}
            >
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">عنوان الصورة</label>
                    <input autoFocus className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white" value={galleryFormData.title} onChange={(e) => setGalleryFormData(p => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">الوصف</label>
                    <textarea rows={2} className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white" value={galleryFormData.description} onChange={(e) => setGalleryFormData(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">رابط الصورة (رابط URL)</label>
                    <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white" value={galleryFormData.image} onChange={(e) => setGalleryFormData(p => ({ ...p, image: e.target.value }))} placeholder="https://example.com/photo.jpg" />
                </div>

                {/* Event Association selector */}
                <div className="flex gap-2">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">تابع لفعالية / خبر</label>
                        <select
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white dark:bg-neutral-800"
                            value={galleryFormData.eventId}
                            onChange={(e) => setGalleryFormData(p => ({ ...p, eventId: e.target.value }))}
                        >
                            <option value="general">عام / غير مرتبط بخبر محدد</option>
                            {posts.map(p => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5 w-[120px]">
                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">رقم الترتيب</label>
                        <input
                            type="number"
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
                            value={galleryFormData.order}
                            onChange={(e) => setGalleryFormData(p => ({ ...p, order: e.target.value }))}
                        />
                    </div>
                </div>

                {galleryFormData.image && <img src={galleryFormData.image} className="w-full max-h-[180px] object-cover rounded mt-2 border border-neutral-200 dark:border-neutral-700" onError={(e) => { e.target.style.display = 'none'; }} />}
            </AdminFormDialog>

            {/* NEWS DELETE CONFIRM */}
            {deleteConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setDeleteConfirm({ open: false, post: null })}></div>
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 border border-neutral-200 dark:border-neutral-700 z-10">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 dark:text-white">تأكيد الحذف</h2>
                        <div className="p-4">
                            <p className="text-neutral-600 dark:text-neutral-400">هل أنت متأكد من حذف خبر "{deleteConfirm.post?.title}"؟</p>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button className="px-4 py-2 rounded-md font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" onClick={() => setDeleteConfirm({ open: false, post: null })}>إلغاء</button>
                            <button className="bg-error-500 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-error-600 transition-colors" onClick={confirmDelete}>حذف نهائياً</button>
                        </div>
                    </div>
                </div>
            )}

            {/* GALLERY DELETE CONFIRM */}
            {galleryDeleteConfirm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setGalleryDeleteConfirm({ open: false, item: null })}></div>
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 border border-neutral-200 dark:border-neutral-700 z-10">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 dark:text-white">تأكيد حذف الصورة</h2>
                        <div className="p-4">
                            <p className="text-neutral-600 dark:text-neutral-400">هل أنت متأكد من حذف الصورة "{galleryDeleteConfirm.item?.title}" من المعرض؟</p>
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button className="px-4 py-2 rounded-md font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors" onClick={() => setGalleryDeleteConfirm({ open: false, item: null })}>إلغاء</button>
                            <button className="bg-error-500 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-error-600 transition-colors" onClick={confirmDeleteGalleryItem}>حذف</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SNACKBAR */}
            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-3 rounded-lg text-sm shadow-lg ${
                        snackbar.severity === 'success' ? 'bg-success-500 text-white' :
                        snackbar.severity === 'error' ? 'bg-error-500 text-white' :
                        snackbar.severity === 'warning' || snackbar.severity === 'info' ? 'bg-warning-500 text-white' :
                        'bg-primary-500 text-white'
                    }`}>
                        {snackbar.msg}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminBlog;
