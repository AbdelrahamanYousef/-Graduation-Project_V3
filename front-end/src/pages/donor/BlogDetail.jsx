import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDate, getLanguage } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';

function BlogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useAdminData();

    const post = (state.blogPosts || []).find(p => String(p.id) === String(id));

    const [lightbox, setLightbox] = useState({ isOpen: false, currentIndex: 0 });

    const openLightbox = (index) => {
        setLightbox({ isOpen: true, currentIndex: index });
    };

    const closeLightbox = () => {
        setLightbox({ isOpen: false, currentIndex: 0 });
    };

    const nextPhoto = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex + 1) % post.images.length
        }));
    };

    const prevPhoto = (e) => {
        e.stopPropagation();
        setLightbox(prev => ({
            ...prev,
            currentIndex: (prev.currentIndex - 1 + post.images.length) % post.images.length
        }));
    };

    const activePhoto = post?.images ? post.images[lightbox.currentIndex] : null;

    if (!post) {
        return (
            <div className="text-center py-16 min-h-[60vh]">
                <i className="fa-regular fa-newspaper text-5xl opacity-30"></i>
                <h5 className="text-lg mt-3 mb-3 dark:text-white">الخبر غير موجود</h5>
                <Link to="/blog" className="inline-block bg-primary-500 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-primary-600 transition-colors">
                    العودة للأخبار
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Hero */}
            <div
                className="h-[45vh] min-h-[350px] max-h-[500px] bg-cover bg-center flex items-end relative text-white pb-8"
                style={{
                    background: `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%), url(${post.image || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=600&fit=crop'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 w-full">
                    <button
                        onClick={() => navigate('/blog')}
                        className="text-white/80 hover:text-white mb-2 text-sm block"
                    >
                        ← العودة للأخبار
                    </button>
                    <div className="flex gap-2 mb-2">
                        {post.category && (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium border border-white/50 text-white">{post.category}</span>
                        )}
                        {post.featured && (
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-error-500 text-white">{'مميز'}</span>
                        )}
                    </div>
                    <h3 className="text-3xl font-bold">{post.title}</h3>
                    <p className="text-sm opacity-70 mt-2">
                        {post.publishedAt && formatDate(post.publishedAt)}
                        {post.author && ` — ${post.author}`}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[720px] mx-auto px-4 md:px-6 py-8">
                <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">{post.summary}</p>
                <p className="leading-8 text-base whitespace-pre-wrap dark:text-white">{post.content}</p>

                {/* Attached News Gallery */}
                {post.images && post.images.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-center gap-2 mb-4">
                            <i className="fa-solid fa-camera-retro text-primary-500 text-lg"></i>
                            <h4 className="text-lg font-bold dark:text-white">معرض صور الخبر</h4>
                        </div>
                        <div className="grid grid-cols-12 gap-3">
                            {post.images
                                .sort((a, b) => (a.order || 0) - (b.order || 0))
                                .map((img, idx) => (
                                    <div className="col-span-6 sm:col-span-4" key={img.id || idx}>
                                        <div 
                                            className="overflow-hidden rounded-xl aspect-[4/3] cursor-pointer shadow-sm hover:shadow-md border border-neutral-100/50 dark:border-neutral-700/50 group relative"
                                            onClick={() => openLightbox(idx)}
                                        >
                                            <img 
                                                src={img.url} 
                                                alt={img.caption || post.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Error'}
                                            />
                                            {img.caption && (
                                                <div className="absolute inset-0 bg-black/40 p-2 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    <p className="text-[11px] text-white truncate w-full">{img.caption}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                <div className="mt-10 text-center">
                    <Link to="/blog" className="inline-block border border-primary-500 text-primary-500 px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors">
                        ← المزيد من الأخبار
                    </Link>
                </div>
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
                        {post.images.length > 1 && (
                            <button
                                onClick={prevPhoto}
                                className="absolute right-[-45px] md:right-[-60px] p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors outline-none z-10"
                            >
                                <i className="fa-solid fa-chevron-right text-lg"></i>
                            </button>
                        )}

                        <img
                            src={activePhoto.url}
                            alt={activePhoto.caption || post.title}
                            className="max-w-full max-h-[75vh] rounded-xl shadow-2xl block object-contain border border-white/5"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Error'; }}
                        />

                        {post.images.length > 1 && (
                            <button
                                onClick={nextPhoto}
                                className="absolute left-[-45px] md:left-[-60px] p-3 rounded-full text-white bg-white/10 hover:bg-white/20 transition-colors outline-none z-10"
                            >
                                <i className="fa-solid fa-chevron-left text-lg"></i>
                            </button>
                        )}
                    </div>

                    <div className="text-center mt-4 max-w-[600px] text-white" onClick={(e) => e.stopPropagation()}>
                        <h6 className="text-lg font-bold">{activePhoto.caption || post.title}</h6>
                        {post.images.length > 1 && (
                            <span className="inline-block mt-2 text-xs bg-white/10 px-2 py-0.5 rounded text-neutral-400">
                                {lightbox.currentIndex + 1} / {post.images.length}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BlogDetail;
