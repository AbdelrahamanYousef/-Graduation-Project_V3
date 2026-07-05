import { Link } from 'react-router-dom';
import { t } from '../../i18n';
import { paths } from '../../constants/paths';
import CampaignCardItem from './CampaignCardItem';
import { useState, useEffect, useRef } from 'react';

function HomeUrgentCases({ featuredProjectsList, isDark, setDonateProject, navigate }) {
    const sectionPyMedium = 'py-12 md:py-16';
    const sliderRef = useRef(null);
    const sectionRef = useRef(null);
    
    const [activeDot, setActiveDot] = useState(0);
    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Detect RTL direction
    const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

    // Intersection Observer for slide-down entrance animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.05 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    const handleScroll = () => {
        if (!sliderRef.current) return;
        const container = sliderRef.current;
        const children = container.children;
        const containerRect = container.getBoundingClientRect();
        
        let closestIndex = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i < children.length; i++) {
            const childRect = children[i].getBoundingClientRect();
            let distance = 0;
            if (isRtl) {
                distance = Math.abs(childRect.right - containerRect.right);
            } else {
                distance = Math.abs(childRect.left - containerRect.left);
            }
            
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        setActiveDot(closestIndex);
        
        // Check if scrolled to start or end
        setIsAtStart(container.scrollLeft === 0 || (isRtl && Math.abs(container.scrollLeft) <= 5));
        
        const maxScroll = container.scrollWidth - container.clientWidth;
        const currentScroll = Math.abs(container.scrollLeft);
        setIsAtEnd(currentScroll >= maxScroll - 5);
    };

    // Calculate start/end arrow state initially and on resize
    useEffect(() => {
        handleScroll();
        window.addEventListener('resize', handleScroll);
        return () => window.removeEventListener('resize', handleScroll);
    }, [featuredProjectsList]);

    const scrollToIndex = (idx) => {
        if (!sliderRef.current) return;
        const container = sliderRef.current;
        const children = container.children;
        if (children && children[idx]) {
            const child = children[idx];
            const containerRect = container.getBoundingClientRect();
            const childRect = child.getBoundingClientRect();
            
            let scrollAmount = 0;
            if (isRtl) {
                scrollAmount = childRect.right - containerRect.right;
            } else {
                scrollAmount = childRect.left - containerRect.left;
            }
            
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleNext = () => {
        const nextIdx = Math.min(featuredProjectsList.length - 1, activeDot + 1);
        scrollToIndex(nextIdx);
    };

    const handlePrev = () => {
        const prevIdx = Math.max(0, activeDot - 1);
        scrollToIndex(prevIdx);
    };

    return (
        <div ref={sectionRef} className={`relative overflow-hidden ${sectionPyMedium}`}
            style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(var(--color-primary-500), 0.025)',
            }}
        >
            <div
                className="absolute -top-20 right-[10%] w-[350px] h-[350px] rounded-full pointer-events-none"
                style={{
                    background: `radial-gradient(circle, rgba(var(--color-error-500), 0.06) 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                }}
            />
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                <div className="text-center mb-4 md:mb-6">
                    <div className="inline-flex items-center gap-1.5 mb-1.5">
                        <h4
                            className="font-black animate-fade-in"
                            style={{
                                fontSize: 'clamp(1.3rem, 3vw, 2.4rem)',
                                background: isDark
                                    ? 'linear-gradient(135deg, var(--color-primary-300), var(--color-error-300))'
                                    : 'linear-gradient(135deg, var(--color-primary-700), var(--color-error-500))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            {t('home.urgentCases')}
                        </h4>
                        <div
                            className="inline-flex items-center gap-0.5 rounded-full text-xs font-extrabold"
                            style={{
                                paddingLeft: '0.3rem',
                                paddingRight: '0.3rem',
                                paddingTop: '0.1rem',
                                paddingBottom: '0.1rem',
                                backgroundColor: isDark ? 'rgba(var(--color-error-500), 0.2)' : 'rgba(var(--color-error-500), 0.1)',
                                color: 'var(--color-error-500)',
                                animation: 'pulseGlow 2s ease-in-out infinite',
                            }}
                        >
                            <i className="fa-solid fa-circle-exclamation" style={{ fontSize: '0.6rem' }} />
                            {'عاجل'}
                        </div>
                    </div>
                    <p
                        className="text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal mx-auto"
                        style={{ fontSize: 'clamp(0.8rem, 1.5vw, 1rem)', maxWidth: 500 }}
                    >
                        {t('home.urgentCasesSubtitle')}
                    </p>
                </div>

                {featuredProjectsList.length === 0 ? (
                    <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                        <i className="fa-regular fa-star" style={{ fontSize: 48, opacity: 0.3 }} />
                        <p className="mt-2">{'لا توجد حالات مميزة بعد'}</p>
                    </div>
                ) : (
                    <div className={`relative px-2 transition-all duration-1000 transform ${
                        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                    }`}>
                        
                        {/* Carousel Scroll Container */}
                        <div
                            ref={sliderRef}
                            onScroll={handleScroll}
                            className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth gap-4 md:gap-6 py-5 px-2"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {featuredProjectsList.map((project, i) => (
                                <div
                                    key={project.id}
                                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start flex justify-center py-2"
                                >
                                    <CampaignCardItem
                                        campaign={project}
                                        index={i}
                                        onClick={() => {
                                             if (project.isProgram) {
                                                 navigate(`/programs/${project.id}`);
                                             } else {
                                                 navigate(paths.getProjectDetails(project.programId, project.id));
                                             }
                                         }}
                                        onDonate={(p) => setDonateProject(p)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        {featuredProjectsList.length > 1 && (
                            <>
                                {/* Prev Button */}
                                <button
                                    onClick={handlePrev}
                                    disabled={isAtStart}
                                    className={`absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center transition-all duration-300 shadow-lg flex ${
                                        isAtStart 
                                            ? 'opacity-0 scale-90 pointer-events-none' 
                                            : 'opacity-100 scale-100 hover:scale-115 hover:bg-primary-500 hover:text-white hover:border-transparent active:scale-95'
                                    }`}
                                    style={{
                                        right: isRtl ? '-16px' : 'auto',
                                        left: isRtl ? 'auto' : '-16px',
                                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                                        color: isDark ? '#F1F5F9' : '#0F5C54',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,92,84,0.15)'}`,
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: isDark 
                                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                                            : '0 10px 25px -5px rgba(15, 92, 84, 0.15), 0 8px 10px -6px rgba(15, 92, 84, 0.15)',
                                    }}
                                    aria-label="Previous"
                                >
                                    <i className={`fa-solid ${isRtl ? 'fa-chevron-right' : 'fa-chevron-left'} text-sm`}></i>
                                </button>

                                {/* Next Button */}
                                <button
                                    onClick={handleNext}
                                    disabled={isAtEnd}
                                    className={`absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full items-center justify-center transition-all duration-300 shadow-lg flex ${
                                        isAtEnd 
                                            ? 'opacity-0 scale-90 pointer-events-none' 
                                            : 'opacity-100 scale-100 hover:scale-115 hover:bg-primary-500 hover:text-white hover:border-transparent active:scale-95'
                                    }`}
                                    style={{
                                        left: isRtl ? '-16px' : 'auto',
                                        right: isRtl ? 'auto' : '-16px',
                                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                                        color: isDark ? '#F1F5F9' : '#0F5C54',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,92,84,0.15)'}`,
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: isDark 
                                            ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
                                            : '0 10px 25px -5px rgba(15, 92, 84, 0.15), 0 8px 10px -6px rgba(15, 92, 84, 0.15)',
                                    }}
                                    aria-label="Next"
                                >
                                    <i className={`fa-solid ${isRtl ? 'fa-chevron-left' : 'fa-chevron-right'} text-sm`}></i>
                                </button>
                            </>
                        )}

                        {/* Pagination Dots */}
                        {featuredProjectsList.length > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                {featuredProjectsList.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => scrollToIndex(idx)}
                                        className="transition-all duration-300 rounded-full focus:outline-none"
                                        style={{
                                            width: idx === activeDot ? '24px' : '8px',
                                            height: '8px',
                                            backgroundColor: idx === activeDot
                                                ? 'rgb(var(--color-primary-500))'
                                                : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(var(--color-primary-500), 0.2)',
                                        }}
                                        aria-label={`Go to slide ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center mt-6">
                    <Link
                        to="/campaigns"
                        className="inline-flex items-center gap-2 rounded-full font-bold text-primary-500 border border-primary-500 border-[1.5px] hover:-translate-y-0.5 transition-all duration-250"
                        style={{
                            padding: '0.8rem 2.5rem',
                            fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = `0 4px 14px rgba(var(--color-primary-500), 0.15)`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '';
                        }}
                    >
                        {t('common.viewAll')} {isRtl ? '←' : '→'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomeUrgentCases;
