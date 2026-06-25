import { useState, useEffect, useCallback } from 'react';
import { t } from '../../i18n';
import TestimonialCardItem from './TestimonialCardItem';

function HomeTestimonials({ testimonials, isDark }) {
    if (!testimonials || testimonials.length === 0) return null;

    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const itemsPerView = 3;
    const maxIndex = Math.max(0, testimonials.length - itemsPerView);

    const next = useCallback(() => {
        setActiveIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, [maxIndex]);

    const prev = useCallback(() => {
        setActiveIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
    }, [maxIndex]);

    useEffect(() => {
        if (isPaused || testimonials.length <= itemsPerView) return;
        const timer = setInterval(next, 4000);
        return () => clearInterval(timer);
    }, [next, isPaused, testimonials.length]);

    const visibleTestimonials = testimonials.slice(activeIndex, activeIndex + itemsPerView);

    return (
        <section
            className="relative overflow-hidden py-16 md:py-24"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.04] ${isDark ? 'bg-white' : 'bg-primary-500'}`} />
                <div className={`absolute -bottom-32 -left-32 w-[30rem] h-[30rem] rounded-full opacity-[0.03] ${isDark ? 'bg-white' : 'bg-primary-500'}`} />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-px h-3/4 bg-gradient-to-b from-transparent via-primary-500/10 to-transparent" />
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider mb-4"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,92,84,0.08)',
                            color: isDark ? '#80CBC4' : '#0F5C54',
                        }}
                    >
                        <i className="fa-solid fa-star text-[10px]"></i>
                        <span>{t('home.testimonials')}</span>
                        <i className="fa-solid fa-star text-[10px]"></i>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3"
                        style={{ color: isDark ? '#E2E8F0' : '#0F172A' }}
                    >
                        {t('home.testimonials')}
                    </h2>

                    <p className="text-base md:text-lg max-w-2xl mx-auto"
                        style={{ color: isDark ? '#94A3B8' : '#64748B' }}
                    >
                        كلمات الشكر والتقدير من الذين ساهمت في تغيير حياتهم
                    </p>

                    <div className="flex items-center justify-center gap-3 mt-6">
                        <span className="h-px w-12" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#0F5C54' }}></span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0F5C54' }}></span>
                        <span className="h-px w-12" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#0F5C54' }}></span>
                    </div>
                </div>

                <div className="relative">
                    {testimonials.length > itemsPerView && (
                        <>
                            <button
                                onClick={prev}
                                className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center transition-all duration-300 hover:scale-110"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                                    color: isDark ? '#E2E8F0' : '#0F5C54',
                                    boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                                }}
                                aria-label="Previous"
                            >
                                <i className="fa-solid fa-chevron-left text-sm"></i>
                            </button>
                            <button
                                onClick={next}
                                className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center transition-all duration-300 hover:scale-110"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'white',
                                    color: isDark ? '#E2E8F0' : '#0F5C54',
                                    boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.08)',
                                }}
                                aria-label="Next"
                            >
                                <i className="fa-solid fa-chevron-right text-sm"></i>
                            </button>
                        </>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                        {(testimonials.length <= itemsPerView ? testimonials : visibleTestimonials).map((testimonial) => (
                            <div key={testimonial.id} className="flex">
                                <TestimonialCardItem
                                    text={testimonial.content || testimonial.text}
                                    name={testimonial.name}
                                    role={testimonial.role}
                                    initial={testimonial.name?.charAt(0)}
                                />
                            </div>
                        ))}
                    </div>

                    {testimonials.length > itemsPerView && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className="transition-all duration-300 rounded-full"
                                    style={{
                                        width: idx === activeIndex ? '28px' : '8px',
                                        height: '8px',
                                        backgroundColor: idx === activeIndex
                                            ? '#0F5C54'
                                            : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,92,84,0.2)',
                                    }}
                                    aria-label={`Go to testimonial group ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default HomeTestimonials;
