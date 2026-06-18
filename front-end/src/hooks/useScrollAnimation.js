import { useEffect, useRef } from 'react';

/**
 * Custom hook for scroll-triggered animations using IntersectionObserver
 * Adds 'is-visible' class when element enters viewport
 * 
 * @param {object} options
 * @param {number} options.threshold - Visibility threshold (0-1)
 * @param {string} options.rootMargin - Root margin for observer
 * @param {boolean} options.once - Only animate once (default: true)
 */
export function useScrollAnimation({ threshold = 0.15, rootMargin = '0px', once = true } = {}) {
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        if (once) observer.unobserve(entry.target);
                    } else if (!once) {
                        entry.target.classList.remove('is-visible');
                    }
                });
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin, once]);

    return ref;
}

/**
 * Initialize scroll animations for all elements with .animate-on-scroll class
 * Call this in a useEffect at the page level
 */
export function initScrollAnimations(containerRef, options = {}) {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options;

    if (!containerRef?.current) return;

    const elements = containerRef.current.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    if (once) observer.unobserve(entry.target);
                }
            });
        },
        { threshold, rootMargin }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
}

/**
 * Animated counter hook - counts from 0 to target value
 */
export function useAnimatedCounter(target, duration = 2000, startOnVisible = true) {
    const ref = useRef(null);
    const countRef = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const animate = () => {
            const start = 0;
            const startTime = performance.now();

            const updateCount = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.round(start + (target - start) * eased);

                if (countRef.current) {
                    countRef.current.textContent = new Intl.NumberFormat('ar-EG').format(current);
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                }
            };

            requestAnimationFrame(updateCount);
        };

        if (startOnVisible) {
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            animate();
                            observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.3 }
            );
            observer.observe(element);
            return () => observer.disconnect();
        } else {
            animate();
        }
    }, [target, duration, startOnVisible]);

    return { containerRef: ref, countRef };
}

export default useScrollAnimation;
