import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { categoryColors } from '../../data/mockData';
import { useAdminData } from '../../contexts/AdminDataContext';
import DonationSidebar from './DonationSidebar';
import RelatedItems from './RelatedItems';

const ARABIC_FONT = "'Cairo', 'Tajawal', sans-serif";
const GREEN = '#00b16a';
const GREEN_DK = '#009659';

function findItem(donationCategories, categoryId, itemId) {
    const cat = donationCategories.find(c => c.id === categoryId);
    if (!cat) return null;
    const item = cat.items.find(i => i.id === itemId);
    if (!item) return null;
    return { category: cat, item };
}

function getDescription(categoryId, itemTitle) {
    const descs = {
        'food-boxes': 'كرتونة طعام متكاملة تحتوي على أساسيات الغذاء لدعم الأسر المحتاجة. تشمل الأرز والمكرونة والزيت والسكر والمواد الغذائية الأساسية.',
        'iftar': 'وجبة إفطار متكاملة للصائمين في شهر رمضان المبارك. تهدف لإدخال الفرحة على قلوب الصائمين وتوفير وجبة دافئة.',
        'education': 'دعم تعليمي للأطفال والطلاب غير القادرين. يشمل المصروفات الدراسية والكتب والأدوات المدرسية.',
        'food-support': 'دعم غذائي شامل للأسر الأكثر احتياجاً لضمان حياة كريمة وآمنة.',
        'relief': 'مساعدات إغاثية عاجلة للمناطق المتضررة والنازحين. تشمل الغذاء والدواء والمواد الأساسية.',
        'human-cases': 'دعم الحالات الإنسانية الصعبة وتوفير الاحتياجات الأساسية للحالات الأكثر تضرراً.',
        'urgent': 'تدخل عاجل للحالات الطارئة التي تحتاج إلى استجابة سريعة.',
        'economic': 'تمكين اقتصادي للأسر من خلال مشاريع صغيرة ومصادر دخل مستدامة.',
        'social': 'برامج تمكين اجتماعي تهدف لدمج الفئات الأكثر احتياجاً في المجتمع.',
        'engineering': 'مشاريع هندسية وإنشائية لتوفير المسكن الكريم والبنية التحتية.',
        'winter': 'مساعدات شتوية تشمل البطانيات والملابس الثقيلة والوجبات الساخنة.',
        'health': 'دعم صحي شامل يشمل العلاج والأطراف الصناعية والتأهيل الطبي.',
    };
    return descs[categoryId] || `تبرع بقيمة لدعم "${itemTitle}" والمساهمة في تحقيق الأثر المطلوب.`;
}

function DonateItem() {
    const { categoryId, itemId } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { state } = useAdminData();
    const donationCategories = state.donationCategories || [];
    const result = findItem(donationCategories, categoryId, itemId);

    if (!result) {
        return (
            <div className="text-center py-16 min-h-[60vh] flex flex-col items-center justify-center">
                <div style={{
                    width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
                    backgroundColor: 'rgba(0,177,106,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <i className="fa-solid fa-search" style={{ fontSize: '2rem', color: GREEN }} />
                </div>
                <p style={{
                    fontFamily: ARABIC_FONT, fontWeight: 800, fontSize: '1.3rem', marginBottom: 12,
                    color: isDark ? '#e2e8f0' : '#2d3436',
                }}>
                    العنصر غير موجود
                </p>
                <Link to="/donate" style={{
                    backgroundColor: GREEN, borderRadius: '14px', padding: '10px 28px',
                    fontFamily: ARABIC_FONT, fontWeight: 700, color: '#fff', textDecoration: 'none',
                }}>
                    العودة للتبرعات
                </Link>
            </div>
        );
    }

    const { category, item } = result;
    const colors = categoryColors[category.id] || ['#e8f5e9', '#4caf50'];
    const description = getDescription(category.id, item.title);
    const related = category.items.filter(i => i.id !== item.id);
    const gradient = `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: isDark ? '#0f172a' : '#f8fcf9' }}>
            {/* Hero */}
            <div style={{
                background: gradient, padding: '60px 16px 40px', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />
                <div style={{ maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <button onClick={() => navigate(-1)} style={{
                        marginBottom: 16, fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.82rem',
                        color: 'rgba(255,255,255,0.8)', cursor: 'pointer', border: 'none',
                        background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '6px 14px',
                        display: 'inline-flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(4px)',
                    }}>
                        <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.65rem' }} />
                        العودة
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <i className={category.icon} style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }} />
                        <span style={{
                            fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.8rem',
                            color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.15)',
                            borderRadius: '8px', padding: '3px 12px', backdropFilter: 'blur(4px)',
                        }}>
                            {category.name}
                        </span>
                    </div>
                    <h1 style={{
                        fontFamily: ARABIC_FONT, fontWeight: 900, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                        color: '#fff', margin: '0 0 8px', lineHeight: 1.3,
                    }}>
                        {item.title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <i className="fa-solid fa-coins" style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }} />
                        <span style={{
                            fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#fff',
                        }}>
                            {item.price.toLocaleString()}
                        </span>
                        <span style={{
                            fontFamily: ARABIC_FONT, fontWeight: 600, fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)',
                        }}>
                            ج.م
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1120, margin: '0 auto', padding: '24px 16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="lg:flex-row">
                    {/* Main content */}
                    <div className="lg:flex-[0_0_calc(66.666%-10px)] lg:w-[calc(66.666%-10px)]">
                        <div style={{
                            borderRadius: '18px', padding: 'clamp(16px, 2.5vw, 24px)',
                            backgroundColor: isDark ? '#1e293b' : '#fff',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#eef2f7'}`,
                            boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.04)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 4, height: 20, borderRadius: 2, background: `linear-gradient(180deg, ${GREEN}, #10b981)` }} />
                                <p style={{
                                    fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.95rem',
                                    color: isDark ? '#f8fafc' : '#1a1a1a', margin: 0,
                                }}>
                                    تفاصيل المشروع
                                </p>
                            </div>
                            <p style={{
                                fontSize: '0.9rem', lineHeight: 2, fontFamily: ARABIC_FONT,
                                color: isDark ? 'rgba(226,232,240,0.78)' : '#555', margin: 0,
                            }}>
                                {description}
                            </p>

                            <hr style={{
                                margin: '20px 0', border: 'none',
                                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#f0f4f8'}`,
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <div style={{ width: 4, height: 20, borderRadius: 2, background: `linear-gradient(180deg, ${GREEN}, #10b981)` }} />
                                <p style={{
                                    fontFamily: ARABIC_FONT, fontWeight: 700, fontSize: '0.95rem',
                                    color: isDark ? '#f8fafc' : '#1a1a1a', margin: 0,
                                }}>
                                    أثر تبرعك
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {[
                                    { icon: 'fa-hand-holding-heart', text: 'تقديم الدعم المباشر للمحتاجين في جميع المحافظات' },
                                    { icon: 'fa-chart-line', text: 'ضمان وصول التبرعات لمستحقيها بشفافية كاملة' },
                                    { icon: 'fa-clock', text: 'متابعة مستمرة وتقارير دورية عن أثر التبرع' },
                                ].map((goal, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 12px', borderRadius: '12px',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafbfc',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#f0f4f8'}`,
                                    }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '8px',
                                            backgroundColor: 'rgba(0,177,106,0.12)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <i className={`fa-solid ${goal.icon}`} style={{ fontSize: '0.65rem', color: GREEN }} />
                                        </div>
                                        <p style={{
                                            fontSize: '0.85rem', lineHeight: 1.6, fontFamily: ARABIC_FONT,
                                            color: isDark ? '#e2e8f0' : '#444', margin: 0,
                                        }}>
                                            {goal.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <RelatedItems related={related} category={category} isDark={isDark} navigate={navigate} />
                    </div>

                    <DonationSidebar item={item} category={category} isDark={isDark} />
                </div>
            </div>
        </div>
    );
}

export default DonateItem;
