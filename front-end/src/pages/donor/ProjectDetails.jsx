import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { t, formatCurrency, formatNumber, formatDate, getLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { paths } from '../../constants/paths';
import { getProjectById } from '../../api';

function ProjectDetails() {
    const { projectId } = useParams();
    const { isDonorLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);
    const [donationAmount, setDonationAmount] = useState(100);
    const [multiplier, setMultiplier] = useState(1);
    const isEn = getLanguage() === 'en';

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const projectUpdates = []; // mocked updates since it is not in the db schema

    useEffect(() => {
        let isMounted = true;
        async function fetchProject() {
            try {
                setLoading(true);
                const data = await getProjectById(projectId);
                if (isMounted) {
                    setProject(data);
                }
            } catch (err) {
                console.error('Failed to fetch project details:', err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        fetchProject();
        return () => { isMounted = false; };
    }, [projectId]);

    if (loading) {
        return (
            <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="py-12 text-center">
                <h4 className="text-xl mb-2 text-slate-900 dark:text-slate-100 font-bold">{'المشروع غير موجود'}</h4>
                <Link to="/projects" className="bg-emerald-500 text-white px-5 py-2.5 rounded-md font-semibold hover:bg-emerald-600 transition-colors">
                    {'العودة للمشاريع'}
                </Link>
            </div>
        );
    }

    const title = project.title;
    const program = typeof project.program === 'object' ? (project.program?.name || '') : (project.program || '');
    const percentage = project.goal > 0 ? Math.min(100, Math.round((project.raised / project.goal) * 100)) : 0;

    const goals = Array.isArray(project.goals)
        ? project.goals
        : (typeof project.goals === 'string'
            ? (project.goals.startsWith('[') ? JSON.parse(project.goals) : [project.goals])
            : [
                'الوصول إلى الفئات المستهدفة في المناطق الأكثر احتياجًا',
                'توفير الدعم المادي والعيني بشكل مباشر',
                'ضمان الشفافية الكاملة في توزيع التبرعات',
                'متابعة وتقييم الأثر بشكل دوري'
              ]);

    const tabs = [t('projectDetails.overview'), t('projectDetails.updates'), t('projectDetails.budget'), t('projectDetails.faq')];

    return (
        <div className="pb-12 bg-gray-100 dark:bg-slate-950 min-h-screen transition-colors duration-200">
            {/* Hero / Header Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-12">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 p-6 md:p-8">
                    {/* Text/Content Wrapper (Col-Span-7) */}
                    <div className="col-span-1 md:col-span-7 flex flex-col justify-center items-start text-right space-y-4">
                        <div>
                            <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-primary-500/10 text-primary-600 dark:text-primary-400 tracking-wide uppercase">
                                {program}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-50 leading-tight tracking-tight">
                            {title}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-sm text-muted pt-2 font-medium">
                            <div className="flex items-center gap-2">
                                <i className="fa-solid fa-location-dot text-emerald-500"></i>
                                <span>{project.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fa-regular fa-clock text-emerald-500"></i>
                                <span>{project.daysLeft} {t('projects.daysLeft')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Wrapper (Col-Span-5) */}
                    <div className="col-span-1 md:col-span-5 w-full aspect-video bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2">
                        <img
                            className="w-full h-full object-contain"
                            src={project.image || project.imageUrl || '/vite.svg'}
                            alt={title}
                            onError={(e) => { e.target.src = '/vite.svg'; }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-4 md:px-6 mt-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Content Column */}
                    <div className="col-span-12 lg:col-span-8">
                        <div className="bg-card-bg rounded-3xl p-6 md:p-8 shadow-sm border border-card-border transition-colors duration-200">
                            {/* Tabs Navigation */}
                            <div className="border-b border-slate-100 dark:border-slate-800 mb-6">
                                <div className="flex overflow-x-auto gap-2 pb-px no-scrollbar">
                                    {tabs.map((label, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveTab(i)}
                                            className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap rounded-t-xl transition-all duration-200 ${
                                                activeTab === i 
                                                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10' 
                                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                                            }`}
                                        >
                                            {i === 1 ? (
                                                <span className="flex items-center gap-1.5">
                                                    {label}
                                                    {projectUpdates.length > 0 && (
                                                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-500 text-white">
                                                            {projectUpdates.length}
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                label
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Panels */}
                            <div className="mt-4">
                                <div role="tabpanel" hidden={activeTab !== 0}>
                                    {activeTab === 0 && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <h5 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                                                    {t('projectDetails.aboutProject')}
                                                </h5>
                                                <p className="text-slate-600 dark:text-slate-350 leading-relaxed text-sm md:text-base font-normal">
                                                    {project.description}
                                                </p>
                                            </div>

                                            <div className="p-5 bg-emerald-500/5 dark:bg-emerald-450/5 border-r-4 border-emerald-500 dark:border-emerald-400 rounded-l-md rounded-r-xl">
                                                <p className="italic text-slate-600 dark:text-slate-350 text-sm md:text-base leading-relaxed">
                                                    {isEn
                                                        ? 'Through this project, we aim to provide support and assistance to the most vulnerable communities in Egyptian society. Your generous donation helps change many lives and achieve lasting positive impact.'
                                                        : 'نسعى من خلال هذا المشروع إلى تقديم الدعم والمساعدة للفئات الأكثر احتياجًا في المجتمع المصري. بتبرعك الكريم، تساهم في تغيير حياة الكثيرين وتحقيق الأثر الإيجابي المستدام.'}
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                <h5 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
                                                    {t('projectDetails.projectGoals')}
                                                </h5>
                                                <ul className="space-y-3.5 pr-1">
                                                    {goals.map((goal, index) => (
                                                        <li key={index} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 transition-all hover:translate-x-1 duration-200">
                                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5">
                                                                <i className="fa-solid fa-check text-[10px]"></i>
                                                            </span>
                                                            <span className="leading-relaxed text-sm md:text-base font-normal">{goal}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div role="tabpanel" hidden={activeTab !== 1}>
                                    {activeTab === 1 && (
                                        <div className="flex flex-col gap-4">
                                            {projectUpdates.length === 0 ? (
                                                <div className="text-center py-12 bg-slate-50 dark:bg-slate-950/45 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <i className="fa-regular fa-folder-open text-3xl text-slate-400 dark:text-slate-600 mb-2 block"></i>
                                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                                        {'لا توجد تحديثات حالياً لهذا المشروع.'}
                                                    </p>
                                                </div>
                                            ) : (
                                                projectUpdates.map(update => (
                                                    <div key={update.id} className="bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/85 p-4 transition-all hover:shadow-[0_8px_20px_rgba(0,0,0,0.03)] hover:border-slate-200">
                                                        <div className="flex flex-col sm:flex-row gap-4">
                                                            <img
                                                                src={update.image || '/vite.svg'}
                                                                alt={update.title}
                                                                className="w-full sm:w-[140px] h-[140px] object-cover object-center rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800"
                                                                onError={(e) => { e.target.src = '/vite.svg'; }}
                                                            />
                                                            <div className="flex-1 flex flex-col justify-between">
                                                                <div>
                                                                    <h6 className="font-extrabold text-slate-900 dark:text-slate-50 text-base mb-1.5">{update.title}</h6>
                                                                    <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed mb-3">{update.content}</p>
                                                                </div>
                                                                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-medium">
                                                                    <i className="fa-regular fa-calendar"></i>
                                                                    {formatDate(update.date)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div role="tabpanel" hidden={activeTab !== 2}>
                                    {activeTab === 2 && (
                                        <div className="space-y-6">
                                            <h5 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight mb-4">{t('projectDetails.budgetBreakdown')}</h5>
                                            <div className="flex flex-col gap-4">
                                                {[
                                                    { label: 'المستلزمات والمواد', value: 60 },
                                                    { label: 'النقل والتوزيع', value: 20 },
                                                    { label: 'التشغيل والإدارة', value: 15 },
                                                    { label: 'الطوارئ والاحتياطي', value: 5 }
                                                ].map((item, index) => (
                                                    <div key={index} className="space-y-2">
                                                        <div className="flex justify-between text-sm font-semibold">
                                                            <span className="text-slate-700 dark:text-slate-350">{item.label}</span>
                                                            <span className="text-emerald-600 dark:text-emerald-450 font-black">{item.value}%</span>
                                                        </div>
                                                        <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                                                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${item.value}%` }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div role="tabpanel" hidden={activeTab !== 3}>
                                    {activeTab === 3 && (
                                        <div className="space-y-3">
                                            {[
                                                { q: 'كيف يمكنني التأكد من وصول تبرعي؟', a: 'نلتزم بالشفافية الكاملة وننشر تحديثات دورية عن توزيع التبرعات مع صور وتقارير مفصلة.'},
                                                { q: 'هل يمكنني التبرع بشكل شهري؟', a: 'نعم، يمكنك إعداد تبرع شهري متكرر لدعم المشروع بشكل مستمر.'},
                                                { q: 'هل التبرع معفى من الضرائب؟', a: 'نعم، التبرعات معفاة من الضرائب وفقًا للقوانين المصرية ونوفر إيصالات رسمية.'}
                                            ].map((faq, index) => (
                                                <div key={index} className="bg-slate-50/50 dark:bg-slate-950/30 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 p-5 hover:border-slate-200 transition-all duration-200">
                                                    <p className="font-extrabold text-slate-900 dark:text-slate-50 text-base mb-2">{faq.q}</p>
                                                    <p className="text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-normal">{faq.a}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Donation Sidebar Column */}
                    <div className="col-span-12 lg:col-span-4">
                        <div className="bg-card-bg rounded-3xl shadow-sm border border-card-border sticky top-24 transition-all p-6 md:p-8">
                            <div className="space-y-5">
                                {/* Raised and Goal Progress */}
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1">المبلغ المجمع</span>
                                            <h4 className="text-3xl font-black text-emerald-600 dark:text-emerald-450 tracking-tight leading-none">
                                                {formatCurrency(project.raised || 0)}
                                            </h4>
                                        </div>
                                        <div className="text-left">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block mb-1">الهدف</span>
                                            <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300 leading-none">
                                                {formatCurrency(project.goal)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                                        <div 
                                            className="h-full rounded-full bg-emerald-500 transition-all duration-700" 
                                            style={{ width: `${percentage > 100 ? 100 : percentage}%` }}
                                        ></div>
                                    </div>
                                    
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-3 text-center bg-slate-50/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                                        <div className="flex flex-col justify-center">
                                            <h6 className="font-black text-emerald-600 dark:text-emerald-450 text-lg md:text-xl leading-none">{percentage}%</h6>
                                            <span className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 block">مكتمل</span>
                                        </div>
                                        <div className="flex flex-col justify-center border-x border-slate-200/60 dark:border-slate-800/60">
                                            <h6 className="font-black text-slate-900 dark:text-slate-100 text-lg md:text-xl leading-none">{formatNumber(project.donors || 0)}</h6>
                                            <span className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 block">{t('projects.donors')}</span>
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <h6 className="font-black text-slate-900 dark:text-slate-100 text-lg md:text-xl leading-none">{project.daysLeft || 0}</h6>
                                            <span className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 block">{t('projects.daysLeft')}</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className="border-t border-slate-100 dark:border-slate-800" />

                                {!isDonorLoggedIn ? (
                                     <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-center my-4 font-sans">
                                         <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
                                             <i className="fa-solid fa-lock text-lg"></i>
                                         </div>
                                         <p className="text-sm font-semibold text-slate-700 dark:text-slate-350 mb-5 leading-relaxed">
                                             قم بتسجيل الدخول للتبرع لهذا المشروع ومتابعة سجل عطائك.
                                         </p>
                                         <button
                                             type="button"
                                             onClick={() => navigate(paths.auth.login, { state: { from: location.pathname + location.search } })}
                                             className="w-full py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20 text-sm"
                                         >
                                             تسجيل الدخول للتبرع
                                         </button>
                                     </div>
                                 ) : (
                                     <>
                                          {/* Donation Value options */}
                                          <div className="mb-4">
                                              <p className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-3">{t('donate.selectAmount')}</p>
                                              <div className="grid grid-cols-3 gap-2">
                                                  {[50, 100, 200, 500, 1000, 2000].map(amount => (
                                                      <button
                                                          key={amount}
                                                          onClick={() => setDonationAmount(amount)}
                                                          className={`rounded-2xl border py-3 text-xs md:text-sm font-extrabold transition-all duration-200 ${
                                                              donationAmount === amount
                                                                  ? 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                                                                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-950/30 hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50/10 dark:hover:bg-emerald-950/20'
                                                          }`}
                                                      >
                                                          {formatCurrency(amount).replace(' ج.م', '')} <span className="text-[10px] block font-semibold opacity-85 mt-0.5">ج.م</span>
                                                      </button>
                                                  ))}
                                              </div>
                                              <div className="flex gap-1.5 mt-2">
                                                  {[1, 2, 3, 5, 10].map(m => (
                                                      <button key={m} type="button" onClick={() => setMultiplier(m)}
                                                          className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-colors ${multiplier === m ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500'}`}
                                                      >
                                                          ×{m}
                                                      </button>
                                                  ))}
                                              </div>
                                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">المجموع: {(donationAmount * multiplier).toLocaleString()} ج.م</p>
                                          </div>

                                          {/* Donate Button */}
                                          <Link
                                              to={`${paths.donor.donate}?project=${project.id}&amount=${donationAmount * multiplier}`}
                                             className="block bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white hover:text-white text-center py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/20 hover:-translate-y-0.5 text-sm md:text-base mb-3"
                                         >
                                             {t('common.donate')}
                                         </Link>
                                     </>
                                 )}
                                <button className="w-full text-slate-500 dark:text-slate-400 text-xs py-1.5 flex items-center justify-center gap-2 hover:text-emerald-650 dark:hover:text-emerald-400 transition-colors font-semibold">
                                    <i className="fa-solid fa-share-nodes"></i>
                                    {t('projectDetails.shareProject')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProjectDetails;
