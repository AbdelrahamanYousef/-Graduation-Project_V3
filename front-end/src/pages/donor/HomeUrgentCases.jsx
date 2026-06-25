import { Link } from 'react-router-dom';
import { t } from '../../i18n';
import CampaignCardItem from './CampaignCardItem';

function HomeUrgentCases({ featuredProjectsList, isDark, setDonateProject, navigate }) {
    const sectionPyMedium = 'py-12 md:py-16';

    return (
        <div className={`relative overflow-hidden ${sectionPyMedium}`}
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
                <div className="text-center mb-3 md:mb-5">
                    <div className="inline-flex items-center gap-1.5 mb-1.5">
                        <h4
                            className="font-black"
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

                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-4">
                    {featuredProjectsList.length === 0 ? (
                        <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                            <i className="fa-regular fa-star" style={{ fontSize: 48, opacity: 0.3 }} />
                            <p className="mt-2">{'لا توجد حالات مميزة بعد'}</p>
                        </div>
                    ) : featuredProjectsList.map((project, i) => (
                        <div key={project.id} className="flex justify-center" style={{ width: 'clamp(280px, 100%, 100%)', maxWidth: '100%' }}>
                            <CampaignCardItem
                                campaign={project}
                                index={i}
                                onClick={() => navigate(`/campaigns`)}
                                onDonate={(p) => setDonateProject(p)}
                            />
                        </div>
                    ))}
                </div>

                <div className="text-center">
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
                        {t('common.viewAll')} ←
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomeUrgentCases;
