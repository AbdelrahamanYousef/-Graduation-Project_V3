import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { t, formatCurrency, formatNumber } from '../../i18n';
import { getPrograms } from '../../api/programs.api';
import { getTransparencyStats } from '../../api/transparency.api';
import { paths } from '../../constants/paths';
import { HeroBanner } from '../../components/common';
import { BookOpen, Utensils, HeartPulse, Home } from 'lucide-react';

function Programs() {
    const [programs, setPrograms] = useState([]);
    const [beneficiaryCount, setBeneficiaryCount] = useState("50,000+");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchProgramsAndStats() {
            try {
                setIsLoading(true);
                const data = await getPrograms();
                let bCount = "50,000+";
                try {
                    const transData = await getTransparencyStats();
                    if (transData?.financialData?.beneficiaries !== undefined) {
                        bCount = formatNumber(transData.financialData.beneficiaries) + "+";
                    }
                } catch (err) {
                    console.warn('Could not fetch transparency stats, using fallback', err);
                }

                if (isMounted) {
                    // Filter for active programs client-side
                    const activePrograms = data.filter(p => !p.status || p.status.toLowerCase() === 'active');
                    setPrograms(activePrograms);
                    setBeneficiaryCount(bCount);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching programs:', err);
                if (isMounted) {
                    setError('حدث خطأ أثناء تحميل البرامج. يرجى المحاولة مرة أخرى لاحقاً.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        fetchProgramsAndStats();
        return () => {
            isMounted = false;
        };
    }, []);

    const activeProjectsCount = programs.reduce((sum, p) => sum + (p.projectCount || 0), 0);

    return (
        <div className="pb-16 bg-gray-200 dark:bg-[#060d18] min-h-screen">
            <HeroBanner 
                badgeText="برامجنا التنموية"
                headline="اكتشف برامجنا المتنوعة التي تستهدف فئات المحتاجين في المجتمع المصري"
                highlightedWord="المتنوعة"
                subtext="شاركنا في صناعة الأثر الإيجابي وتوفير حياة كريمة من خلال دعم مشاريعنا المستدامة."
                primaryCtaText="تبرع الآن"
                primaryCtaLink={paths.donor.donate}
                secondaryCtaText="اكتشف المشاريع"
                secondaryCtaLink={paths.donor.projects}
                stats={[
                    { number: `${programs.length}+`, label: "برامج أساسية" },
                    { number: `${activeProjectsCount}+`, label: "مشروع نشط" },
                    { number: beneficiaryCount, label: "مستفيد" }
                ]}
                floatingIcons={[
                    <BookOpen key="edu" size={24} />,
                    <Utensils key="food" size={24} />,
                    <HeartPulse key="health" size={24} />,
                    <Home key="shelter" size={24} />
                ]}
            />

            {/* Programs Grid Section */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 -mt-5 relative z-20">
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-5 rounded-2xl text-center my-8 shadow-sm">
                        <i className="fa-solid fa-triangle-exclamation text-3xl mb-2 block"></i>
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                ) : error ? null : programs.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map(program => {
                            const detailPath = paths.donor.programDetail.replace(':id', program.id);
                            const description = program.description || getProgramDescription(program.id) || 'لم يتم إضافة وصف لهذا البرنامج بعد.';

                            return (
                                <div 
                                    className="group bg-white dark:bg-gray-800 border-t-4 border-x border-b border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
                                    style={{ borderTopColor: program.color || '#0B6B6B' }}
                                    key={program.id}
                                >
                                    {/* Card Header: Banner Image or Soft Brand Background */}
                                    {program.imageUrl ? (
                                        <div className="relative h-36 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-gray-100 dark:border-gray-700">
                                            <img
                                                src={program.imageUrl}
                                                alt={program.name}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                                            {/* Integrated icon badge */}
                                            <div
                                                className="absolute bottom-3 right-3 w-11 h-11 rounded-lg flex items-center justify-center text-lg text-white shadow-md border border-white dark:border-gray-800"
                                                style={{ backgroundColor: program.color || '#0B6B6B' }}
                                            >
                                                <i className={program.icon || 'fa-solid fa-cube'}></i>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            className="h-28 w-full flex items-center justify-center relative overflow-hidden"
                                            style={{ 
                                                background: `linear-gradient(135deg, ${program.color || '#0B6B6B'}20 0%, ${program.color || '#0B6B6B'}40 100%)` 
                                            }}
                                        >
                                            <div
                                                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow-sm"
                                                style={{ backgroundColor: program.color || '#0B6B6B' }}
                                            >
                                                <i className={program.icon || 'fa-solid fa-cube'}></i>
                                            </div>
                                        </div>
                                    )}

                                    {/* Card Body */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-2 mb-2">
                                            <h5 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                                                {program.name}
                                            </h5>
                                            {program.isHighlighted && (
                                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                                                    الأشد احتياجاً ⭐
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 min-h-[60px] leading-relaxed">
                                            {description}
                                        </p>

                                        {/* Separator */}
                                        <hr className="border-t border-gray-100 dark:border-gray-700 mb-4" />

                                        {/* Dynamic Stats */}
                                        <div className="grid grid-cols-2 gap-4 text-center mb-5">
                                            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-100/50 dark:border-neutral-800/50">
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                                                    مشروع نشط
                                                </span>
                                                <h6 className="text-base md:text-lg font-bold text-primary-500 dark:text-primary-400">
                                                    {formatNumber(program.projectCount || 0)}
                                                </h6>
                                            </div>
                                            <div className="bg-neutral-50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-neutral-100/50 dark:border-neutral-800/50 overflow-hidden">
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                                                    ج.م تم جمعها
                                                </span>
                                                <h6 className="text-sm md:text-base font-bold text-secondary-500 dark:text-secondary-400 truncate" title={formatCurrency(program.totalDonations || 0)}>
                                                    {formatCurrency(program.totalDonations || 0)}
                                                </h6>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="mt-auto">
                                            <Link
                                                to={detailPath}
                                                className="block w-full bg-primary-500 hover:bg-primary-600 text-white hover:!text-white text-center px-4 py-2.5 rounded-xl font-bold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 text-sm"
                                            >
                                                عرض التفاصيل
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Skeleton Loader
const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 border-t-4 border-x border-b border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-md h-full animate-pulse" style={{ borderTopColor: '#e5e7eb' }}>
        <div className="h-36 bg-gray-200 dark:bg-gray-700 w-full"></div>
        <div className="p-5 flex flex-col items-center">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-6"></div>
            <hr className="w-3/5 border-t border-gray-100 dark:border-gray-700 mb-4 w-full" />
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900/20 p-2.5 rounded-xl">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                </div>
                <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-900/20 p-2.5 rounded-xl">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                </div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
        </div>
    </div>
);

// Empty State
const EmptyState = () => (
    <div className="col-span-12 text-center py-16 px-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-md my-8 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-4xl mb-4">
            <i className="fa-solid fa-folder-open"></i>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            لا توجد برامج متاحة حالياً
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[400px]">
            لم يتم إضافة أي برامج نشطة بعد من قِبل الإدارة. يرجى العودة لاحقاً لمتابعة مبادرتنا الخيرية.
        </p>
    </div>
);

// Legacy descriptions mapping fallback
function getProgramDescription(id) {
    const descriptions = {
        1: 'نوفر الرعاية الشاملة للأيتام من تعليم وصحة ومعيشة كريمة لضمان مستقبل أفضل لهم.',
        2: 'نقدم خدمات طبية مجانية وقوافل علاجية للمناطق المحرومة والفئات الأكثر احتياجًا.',
        3: 'ندعم العملية التعليمية من خلال توفير المستلزمات والمنح الدراسية للطلاب المتفوقين.',
        4: 'نستجيب للأزمات والكوارث بتوفير المساعدات العاجلة للمتضررين.',
        5: 'تنمية شاملة لتحسين مستوى المعيشة ومحاربة الفقر.',
        6: 'مشاريع موسمية في رمضان والأعياد لإدخل الفرحة على الأسر المحتاجة.',
    };
    return descriptions[id] || '';
}

export default Programs;
