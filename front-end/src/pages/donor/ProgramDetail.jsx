import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatNumber } from '../../i18n';
import { getProgramById } from '../../api/programs.api';
import { getProjects } from '../../api/projects.api';
import { paths } from '../../constants/paths';
import { HeroBanner } from '../../components/common';
import { BookOpen, HeartPulse, Home, Award } from 'lucide-react';

function ProgramDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [program, setProgram] = useState(null);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchProgramData() {
            try {
                setIsLoading(true);
                const [progData, projRes] = await Promise.all([
                    getProgramById(id),
                    getProjects({ programId: id })
                ]);
                if (isMounted) {
                    setProgram(progData);
                    // Filter projects for active status client-side
                    const activeProjects = (projRes?.data || []).filter(p => p.status === 'active');
                    setProjects(activeProjects);
                    setError(null);
                }
            } catch (err) {
                console.error('Error fetching program details:', err);
                if (isMounted) {
                    setError('حدث خطأ أثناء تحميل تفاصيل البرنامج. يرجى المحاولة مرة أخرى لاحقاً.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }
        fetchProgramData();
        return () => {
            isMounted = false;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="pb-16 bg-gray-200 dark:bg-[#060d18] min-h-screen">
                {/* HeroBanner Skeleton */}
                <div className="h-64 bg-emerald-900/10 dark:bg-emerald-950/20 animate-pulse w-full border-b border-gray-300 dark:border-gray-800 flex items-center justify-center">
                    <div className="h-8 bg-emerald-800/20 dark:bg-emerald-900/30 rounded w-1/3"></div>
                </div>

                {/* Projects Grid Section Skeleton */}
                <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-6">
                    <div className="h-6 bg-gray-300 dark:bg-gray-850 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-12 gap-6">
                        <SkeletonProjectCard />
                        <SkeletonProjectCard />
                        <SkeletonProjectCard />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="text-center py-16 min-h-[60vh] flex flex-col items-center justify-center bg-gray-200 dark:bg-[#060d18]">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-red-100 dark:bg-red-950/20 flex items-center justify-center text-red-500 dark:text-red-400">
                    <i className="fa-solid fa-triangle-exclamation text-3xl" />
                </div>
                <h5 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                    {error || 'البرنامج غير موجود'}
                </h5>
                <Link 
                    to={paths.donor.programs} 
                    className="bg-primary-500 hover:bg-primary-600 text-white hover:!text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 text-sm"
                >
                    العودة للبرامج
                </Link>
            </div>
        );
    }

    const totalRaised = projects.reduce((sum, p) => sum + (p.raised || 0), 0);

    return (
        <div className="pb-16 bg-gray-200 dark:bg-[#060d18] min-h-screen">
            <HeroBanner 
                badgeText="تفاصيل البرنامج"
                headline={program.name}
                highlightedWord=""
                subtext={program.description || `برنامج ${program.name} التنموي يهدف لتحقيق أثر إيجابي مستدام.`}
                primaryCtaText="تبرع الآن"
                primaryCtaLink={paths.donor.donate}
                secondaryCtaText="العودة للبرامج"
                secondaryCtaLink={paths.donor.programs}
                stats={[
                    { number: `${projects.length}`, label: "مشروع نشط" },
                    { number: formatCurrency(totalRaised), label: "إجمالي التبرعات" },
                    { number: `${program._count?.beneficiaries || 0}+`, label: "مستفيد" }
                ]}
                floatingIcons={[
                    <Award key="award" size={24} />,
                    <BookOpen key="edu" size={24} />,
                    <HeartPulse key="health" size={24} />,
                    <Home key="shelter" size={24} />
                ]}
            />

            {/* Projects Grid Section */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 -mt-5 relative z-20">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/60 dark:border-gray-700/80 shadow-md mb-6 text-center">
                    <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100">المشاريع التنموية التابعة للبرنامج</h5>
                </div>

                {projects.length === 0 ? (
                    <EmptyProjectsState />
                ) : (
                    <div className="grid grid-cols-12 gap-6">
                        {projects.map((project) => {
                            const pct = project.goal > 0 ? Math.min(100, Math.round((project.raised / project.goal) * 100)) : 0;
                            return (
                                <div className="col-span-12 sm:col-span-6 md:col-span-4 flex" key={project.id}>
                                    <div 
                                        className="group bg-white dark:bg-gray-800 border-t-4 border-x border-b border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 overflow-hidden flex flex-col h-full w-full"
                                        style={{ borderTopColor: program.color || '#0B6B6B' }}
                                    >
                                        <img
                                            className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                                            src={project.image || project.imageUrl || 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=350&fit=crop'}
                                            alt={project.title}
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=350&fit=crop'; }}
                                        />
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h6 className="font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors line-clamp-1">
                                                {project.title}
                                            </h6>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 flex-1 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">
                                                {project.description || 'مشروع تنموي مستدام يسعى لإحداث تغيير إيجابي.'}
                                            </p>
                                            
                                            <div className="mb-4">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-xs font-bold text-primary-500 dark:text-primary-400">
                                                        {formatCurrency(project.raised || 0)}
                                                    </span>
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        {pct}%
                                                    </span>
                                                </div>
                                                <div className="h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                                    <div className="h-full rounded-full bg-primary-500 dark:bg-primary-400 transition-all" style={{ width: `${pct}%` }}></div>
                                                </div>
                                            </div>

                                            <Link
                                                to={paths.donor.projectDetail.replace(':id', project.id)}
                                                className="block w-full bg-primary-500 hover:bg-primary-600 text-white hover:!text-white text-center px-4 py-2.5 rounded-xl font-bold transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 text-sm mt-auto"
                                            >
                                                عرض تفاصيل المشروع
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

// Skeleton Loader for projects
const SkeletonProjectCard = () => (
    <div className="col-span-12 sm:col-span-6 md:col-span-4 bg-white dark:bg-gray-800 border-t-4 border-x border-b border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-md h-full animate-pulse flex flex-col" style={{ borderTopColor: '#e5e7eb' }}>
        <div className="h-44 bg-gray-200 dark:bg-gray-700 w-full"></div>
        <div className="p-4 flex-1 flex flex-col">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-6"></div>
            <hr className="border-t border-gray-100 dark:border-gray-700 mb-4 w-full" />
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full"></div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full mt-auto"></div>
        </div>
    </div>
);

// Empty Projects State
const EmptyProjectsState = () => (
    <div className="col-span-12 text-center py-16 px-4 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/80 rounded-2xl shadow-md my-4 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-4xl mb-4">
            <i className="fa-solid fa-folder-open"></i>
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            لا توجد مشاريع نشطة حالياً
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[400px]">
            لم يتم إضافة أي مشاريع نشطة في هذا البرنامج بعد من قِبل الإدارة. يرجى العودة لاحقاً لمتابعة مبادرتنا.
        </p>
    </div>
);

export default ProgramDetail;
