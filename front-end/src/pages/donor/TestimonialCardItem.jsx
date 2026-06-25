import { useTheme } from '../../contexts/ThemeContext';

function TestimonialCardItem({ text, name, role, initial }) {
    const { isDark } = useTheme();
    return (
        <div
            className="flex-1 p-6 md:p-7 rounded-2xl relative transition-all duration-400 hover:-translate-y-2 flex flex-col"
            style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                boxShadow: isDark
                    ? '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : '0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = isDark
                    ? '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : '0 12px 40px rgba(15,92,84,0.1), inset 0 1px 0 rgba(255,255,255,0.8)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = isDark
                    ? '0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)'
                    : '0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)';
            }}
        >
            <div className="absolute top-3 right-4 text-5xl leading-none font-serif pointer-events-none select-none"
                style={{ color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,92,84,0.06)' }}
            >
                "
            </div>

            <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="fa-solid fa-star text-[10px]"
                        style={{ color: isDark ? 'rgba(255,215,0,0.25)' : 'rgba(255,215,0,0.4)' }}
                    ></i>
                ))}
            </div>

            <p
                className="text-sm leading-relaxed relative z-[2] mb-5 flex-1"
                style={{ color: isDark ? '#CBD5E1' : '#475569' }}
                dir="rtl"
            >
                &ldquo;{text}&rdquo;
            </p>

            <div className="flex items-center gap-3 pt-4 border-t"
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
            >
                <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm"
                    style={{
                        background: 'linear-gradient(135deg, #0F5C54, #1A8A7D)',
                    }}
                >
                    {initial || name?.charAt(0)}
                </div>
                <div className="text-right">
                    <p className="font-bold text-sm" style={{ color: isDark ? '#F1F5F9' : '#1E293B' }}>{name}</p>
                    {role && (
                        <span className="text-xs block" style={{ color: isDark ? '#94A3B8' : '#64748B' }}>{role}</span>
                    )}
                </div>
                <div className="mr-auto">
                    <i className="fa-solid fa-quote-left text-sm opacity-40"
                        style={{ color: isDark ? 'rgba(255,255,255,0.3)' : '#0F5C54' }}
                    ></i>
                </div>
            </div>
        </div>
    );
}

export default TestimonialCardItem;
