import { Link } from 'react-router-dom';
import { useInjectStyles } from '../../utils/injectStyles';

const heroBannerKeyframes = `
    @keyframes floatSlow {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(3deg); }
    }
    @keyframes floatSlower {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(-3deg); }
    }
    @keyframes pulseSoft {
        0%, 100% { opacity: 0.15; transform: scale(1); }
        50% { opacity: 0.25; transform: scale(1.05); }
    }
`;

export default function HeroBanner({
    badgeText,
    headline,
    highlightedWord,
    subtext,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    stats = [],
    floatingIcons = []
}) {
    useInjectStyles(heroBannerKeyframes, 'hero-banner-keyframes');

    // Helper to highlight a word in the headline
    const renderHeadline = () => {
        if (!highlightedWord || !headline.includes(highlightedWord)) {
            return headline;
        }
        const parts = headline.split(highlightedWord);
        return (
            <>
                {parts[0]}
                <span className="text-primary-400 dark:text-primary-300 relative inline-block">
                    {highlightedWord}
                    <span className="absolute bottom-0 right-0 w-full h-1 bg-primary-500/30 rounded-full"></span>
                </span>
                {parts[1]}
            </>
        );
    };

    return (
        <section 
            className="relative overflow-hidden text-white py-12 md:py-16 px-4 md:px-6 border-b border-emerald-950/20 bg-gradient-to-r from-emerald-800 to-teal-900 dark:from-gray-950 dark:to-emerald-950"
        >
            {/* Soft background glows */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden dark:opacity-40">
                <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-emerald-500/10 filter blur-3xl animate-[pulseSoft_6s_infinite_ease-in-out]"></div>
                <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-primary-400/5 filter blur-3xl animate-[pulseSoft_8s_infinite_ease-in-out_1s]"></div>
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Content side */}
                <div className="lg:col-span-7 flex flex-col text-center lg:text-right">
                    {badgeText && (
                        <div className="inline-flex self-center lg:self-start items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4 tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            {badgeText}
                        </div>
                    )}

                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 leading-tight text-white">
                        {renderHeadline()}
                    </h1>

                    {subtext && (
                        <p className="text-sm md:text-base text-gray-50 mb-6 leading-relaxed max-w-[650px] mx-auto lg:mx-0 font-medium">
                            {subtext}
                        </p>
                    )}

                    {/* CTA Actions */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                        {primaryCtaText && primaryCtaLink && (
                            <Link 
                                to={primaryCtaLink} 
                                className="bg-white hover:bg-emerald-50 text-emerald-950 hover:!text-emerald-950 font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
                            >
                                {primaryCtaText}
                            </Link>
                        )}
                        {secondaryCtaText && secondaryCtaLink && (
                            <Link 
                                to={secondaryCtaLink} 
                                className="bg-transparent hover:bg-white/10 text-white hover:!text-white font-semibold px-6 py-2.5 rounded-xl border border-white/30 transition-all duration-300 hover:-translate-y-0.5 text-sm"
                            >
                                {secondaryCtaText}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Stats & Interactive graphic side */}
                <div className="lg:col-span-5 relative w-full flex flex-col items-center justify-center min-h-[220px]">
                    {/* Floating icons display */}
                    <div className="absolute inset-0 pointer-events-none hidden md:block">
                        {floatingIcons.map((item, idx) => {
                            const styles = [
                                { top: '10%', right: '15%', animation: 'floatSlow 4s infinite ease-in-out' },
                                { bottom: '15%', right: '20%', animation: 'floatSlower 5s infinite ease-in-out' },
                                { top: '25%', left: '10%', animation: 'floatSlower 4.5s infinite ease-in-out' },
                                { bottom: '20%', left: '15%', animation: 'floatSlow 3.8s infinite ease-in-out' },
                            ];
                            const style = styles[idx % styles.length];
                            return (
                                <div 
                                    key={idx} 
                                    className="absolute p-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-300 text-xl shadow-lg backdrop-blur-sm"
                                    style={style}
                                >
                                    {item}
                                </div>
                            );
                        })}
                    </div>

                    {/* Stats Grid */}
                    {stats && stats.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4 w-full max-w-[400px] z-10">
                            {stats.map((stat, idx) => (
                                <div 
                                    key={idx} 
                                    className="p-4 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-gray-700 hover:bg-white/15 dark:hover:bg-black/30 transition-all text-center shadow-md flex flex-col justify-center text-white"
                                >
                                    <span className="text-xl md:text-2xl font-extrabold text-primary-400 dark:text-primary-300 mb-1">
                                        {stat.number}
                                    </span>
                                    <span className="text-xs text-emerald-100 font-medium">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
