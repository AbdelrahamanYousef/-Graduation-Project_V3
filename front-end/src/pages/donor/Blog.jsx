import { Link, useSearchParams } from 'react-router-dom';
import { t, formatDate } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import { useState, useMemo } from 'react';

const CATEGORIES = ['الكل', 'أخبار', 'تقارير', 'قصص نجاح', 'فعاليات', 'مقالات'];

function Blog() {
    const { state } = useAdminData();
    const posts = state.blogPosts || [];
    const galleryItems = state.gallery || [];

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') === 'gallery' ? 'gallery' : 'blog';

    const setActiveTab = (tab) => {
        setSearchParams({ tab });
    };

    // Blog Tab State
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('الكل');

    // Filtered blog posts
    const filteredPosts = useMemo(() => {
        return posts
            .filter(p => p.status === 'published')
            .filter(p => !search || p.title.includes(search) || p.summary?.includes(search))
            .filter(p => category === 'الكل' || p.category === category);
    }, [posts, search, category]);

    // Grouped Gallery Items by Event
    const groupedGallery = useMemo(() => {
        const general = galleryItems
            .filter(item => !item.eventId || item.eventId === 'general')
            .sort((a, b) => (a.order || 0) - (b.order || 0));

        const groups = posts
            .map(post => {
                const items = galleryItems
                    .filter(item => String(item.eventId) === String(post.id))
                    .sort((a, b) => (a.order || 0) - (b.order || 0));
                return {
                    post,
                    items
                };
            })
            .filter(group => group.items.length > 0);

        return {
            groups,
            general
        };
    }, [posts, galleryItems]);

    // Lightbox State
    const [lightbox, setLightbox] = useState({
        isOpen: false,
        eventItems: [],
        currentIndex: 0
    });

    const openLightbox = (items, index) => {
        setLightbox({
            isOpen: true,
            eventItems: items,
            currentIndex: index
        });
    };

    const closeLightbox = () => {
        setLightbox({
            isOpen: false,
            eventItems: [],
            currentIndex: 0
        });
    };

    const nextPhoto = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % prev.eventItems.length
        }));
    };

    const prevPhoto = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex - 1 + prev.eventItems.length) % prev.eventItems.length
        }));
    };

    const activePhoto = lightbox.eventItems[lightbox.currentIndex];

    return (
        <div className="pb-16 min-h-[70vh]">
            {/* Page Header */}
            <div className="bg-gradient-to-br from-[#0d6b4b] to-[#094a33] text-white py-16 px-0 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent)]"></div>
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                    <h3 className="text-3xl md:text-4xl font-extrabold mb-3">المدونة ومعرض الفعاليات</h3>
                    <p className="text-base md:text-lg opacity-90 max-w-[600px] mx-auto">تابع آخر أخبارنا وتقاريرنا، وشاهد ثمار عطائكم من أرض الواقع</p>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8">
                {/* Modern Navigation Tabs */}
                <div className="flex justify-center border-b border-neutral-200 dark:border-neutral-700 mb-8">
                    <div className="flex gap-8">
                        <button
                            onClick={() => setActiveTab('blog')}
                            className={`pb-4 px-2 font-bold text-base relative transition-colors flex items-center gap-2 outline-none ${
                                activeTab === 'blog'
                                    ? 'text-primary-500 border-b-2 border-primary-500'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                            }`}
                        >
                            <i className="fa-solid fa-newspaper text-sm"></i>
                            الأخبار والمقالات
                        </button>
                        <button
                            onClick={() => setActiveTab('gallery')}
                            className={`pb-4 px-2 font-bold text-base relative transition-colors flex items-center gap-2 outline-none ${
                                activeTab === 'gallery'
                                    ? 'text-primary-500 border-b-2 border-primary-500'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                            }`}
                        >
                            <i className="fa-solid fa-images text-sm"></i>
                            معرض الصور والفعاليات
                        </button>
                    </div>
                </div>

                {/* TAB 1: NEWS AND ARTICLES */}
                {activeTab === 'blog' && (
                    <div>
                        {/* Search & Filter */}
                        <div className="flex gap-3 mb-6 flex-wrap">
                            <div className="relative min-w-[280px]">
                                <i className="fa-solid fa-search absolute top-1/2 -translate-y-1/2 right-3 text-sm text-neutral-400"></i>
                                <input
                                    type="text"
                                    placeholder="بحث في الأخبار..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pr-9 pl-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white text-sm"
                                />
                            </div>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="min-w-[150px] px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white text-sm dark:bg-neutral-800"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {filteredPosts.length === 0 ? (
                            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400">
                                <i className="fa-regular fa-newspaper text-5xl opacity-30"></i>
                                <p className="mt-3">لا توجد منشورات بعد</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-12 gap-6">
                                {filteredPosts.map((post) => (
                                    <div className="col-span-12 sm:col-span-6 md:col-span-4 flex" key={post.id}>
                                        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100/50 dark:border-neutral-700/50 overflow-hidden flex flex-col w-full transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-lg">
                                            <div className="relative">
                                                <img
                                                    className="w-full h-48 object-cover"
                                                    src={post.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=350&fit=crop'}
                                                    alt={post.title}
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=350&fit=crop'; }}
                                                />
                                                {/* Indicators */}
                                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                                    {post.featured && (
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-error-500 text-white shadow-sm">{'مميز'}</span>
                                                    )}
                                                    {post.images && post.images.length > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white shadow-sm">
                                                            <i className="fa-regular fa-images"></i> {`+${post.images.length}`} صور
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-4 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="mb-2">
                                                        {post.category && (
                                                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold border border-primary-500 text-primary-500">{post.category}</span>
                                                        )}
                                                    </div>
                                                    <h6 className="text-base font-bold mb-2 dark:text-white leading-relaxed line-clamp-2">{post.title}</h6>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3 line-clamp-3 leading-relaxed">{post.summary}</p>
                                                </div>
                                                <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-neutral-700">
                                                    <Link to={`/blog/${post.id}`} className="text-primary-500 hover:underline text-sm font-semibold">
                                                        قراءة المزيد ←
                                                    </Link>
                                                    <span className="text-[11px] text-neutral-400">
                                                        {post.publishedAt ? formatDate(post.publishedAt) : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: GALLERY AND EVENTS */}
                {activeTab === 'gallery' && (
                    <div className="flex flex-col gap-8">
                        {/* 1. Grouped Photos by Event */}
                        {groupedGallery.groups.map((group) => (
                            <div key={group.post.id} className="bg-neutral-50/50 dark:bg-neutral-800/25 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
                                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                                        <h4 className="text-lg md:text-xl font-bold dark:text-white leading-relaxed">{group.post.title}</h4>
                                    </div>
                                    <Link to={`/blog/${group.post.id}`} className="text-primary-500 hover:underline text-sm font-semibold">
                                        تفاصيل الفعالية والخبر ←
                                    </Link>
                                </div>

                                <div className="grid grid-cols-12 gap-3">
                                    {group.items.map((img, idx) => (
                                        <div className="col-span-6 sm:col-span-4 md:col-span-3" key={img.id}>
                                            <div
                                                className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md border border-neutral-100/50 dark:border-neutral-700/50 group relative"
                                                onClick={() => openLightbox(group.items, idx)}
                                            >
                                                <div className="relative overflow-hidden aspect-[4/3]">
                                                    <img
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        src={img.image}
                                                        alt={img.title}
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'; }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/45 p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <p className="text-xs font-bold text-white truncate">{img.title}</p>
                                                        {img.description && <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{img.description}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* 2. General Photos Section */}
                        {groupedGallery.general.length > 0 && (
                            <div className="bg-neutral-50/50 dark:bg-neutral-800/25 p-5 rounded-2xl border border-neutral-100 dark:border-neutral-800/80">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                                    <h4 className="text-lg md:text-xl font-bold dark:text-white">معرض الصور العام</h4>
                                </div>

                                <div className="grid grid-cols-12 gap-3">
                                    {groupedGallery.general.map((img, idx) => (
                                        <div className="col-span-6 sm:col-span-4 md:col-span-3" key={img.id}>
                                            <div
                                                className="bg-white dark:bg-neutral-800 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md border border-neutral-100/50 dark:border-neutral-700/50 group relative"
                                                onClick={() => openLightbox(groupedGallery.general, idx)}
                                            >
                                                <div className="relative overflow-hidden aspect-[4/3]">
                                                    <img
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        src={img.image}
                                                        alt={img.title}
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=300&fit=crop'; }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/45 p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <p className="text-xs font-bold text-white truncate">{img.title}</p>
                                                        {img.description && <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{img.description}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {groupedGallery.groups.length === 0 && groupedGallery.general.length === 0 && (
                            <div className="text-center py-16 text-neutral-500 dark:text-neutral-400 bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                                <i className="fa-regular fa-images text-5xl opacity-30"></i>
                               <p className="mt-3">لا توجد صور في المعرض بعد</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* LIGHTBOX SLIDESHOW */}
            {lightbox.isOpen && activePhoto && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4" onClick={closeLightbox}>
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2.5 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors z-10 outline-none"
                    >
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>

                    <div className="relative max-w-[90vw] max-h-[80vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        {/* Prev Button */}
                        {lightbox.eventItems.length > 1 && (
                            <button
                                onClick={prevPhoto}
                                className="absolute right-[-45px] md:right-[-60px] p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors outline-none z-10"
                            >
                                <i className="fa-solid fa-chevron-right text-lg"></i>
                            </button>
                        )}

                        <img
                            src={activePhoto.image}
                            alt={activePhoto.title}
                            className="max-w-full max-h-[75vh] rounded-xl shadow-2xl block object-contain border border-white/5"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop'; }}
                        />

                        {/* Next Button */}
                        {lightbox.eventItems.length > 1 && (
                            <button
                                onClick={nextPhoto}
                                className="absolute left-[-45px] md:left-[-60px] p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors outline-none z-10"
                            >
                                <i className="fa-solid fa-chevron-left text-lg"></i>
                            </button>
                        )}
                    </div>

                    <div className="text-center mt-4 max-w-[600px] text-white" onClick={(e) => e.stopPropagation()}>
                        <h6 className="text-lg font-bold">{activePhoto.title}</h6>
                        {activePhoto.description && <p className="text-sm text-neutral-300 mt-1">{activePhoto.description}</p>}
                        {lightbox.eventItems.length > 1 && (
                            <span className="inline-block mt-2 text-xs bg-white/10 px-2 py-0.5 rounded text-neutral-400">
                                {lightbox.currentIndex + 1} / {lightbox.eventItems.length}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Blog;
