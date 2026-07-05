import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { t, formatCurrency } from '../../i18n';
import { paths } from '../../constants/paths';

function ProjectCard({ project }) {
    const { isDark } = useTheme();
    const percentage = Math.round((project.raised / project.goal) * 100);
    const title = project.title;

    return (
        <div
            className="h-full flex flex-col transition-all duration-300 hover:-translate-y-2 overflow-hidden rounded-lg bg-white dark:bg-neutral-800 shadow-card border border-neutral-100 dark:border-neutral-700"
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
        >
            <div className="relative">
                <img
                    className="w-full h-[200px] object-cover"
                    src={project.image || project.imageUrl || '/vite.svg'}
                    alt={title}
                    onError={(e) => { e.target.src = '/vite.svg'; }}
                />
                {project.daysLeft <= 10 && (
                    <span className="absolute top-3 right-3 inline-flex px-2 py-0.5 rounded text-xs font-bold bg-error-500 text-white">
                        {'عاجل'}
                    </span>
                )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <span className="text-xs text-primary-500 font-bold mb-1">{project.program}</span>
                <h6 className="font-bold flex-1 mb-1">{title}</h6>

                <div className="mt-3 space-y-2">
                    {project.donationAmount > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                            <span>قيمة المساهمة:</span>
                            <span className="text-primary-600 dark:text-primary-400 font-extrabold">{formatCurrency(project.donationAmount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span>تم جمع {formatCurrency(project.raised || 0)}</span>
                        <span>الهدف {formatCurrency(project.goal)}</span>
                    </div>

                    <div className="h-2.5 rounded-full bg-neutral-100 dark:bg-neutral-700/60 overflow-hidden">
                        <div className="h-full rounded-full bg-primary-500 transition-all duration-500" style={{ width: `${percentage > 100 ? 100 : percentage}%` }}></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                        <span>نسبة الإنجاز: {percentage}%</span>
                        <span>{project.daysLeft} يوم متبقي</span>
                    </div>
                </div>

                <Link
                    to={paths.getProjectDetails(project.programId, project.id)}
                    className="w-full mt-3 border border-primary-500 text-primary-500 px-5 py-2 rounded-md font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-center block"
                >
                    {t('campaigns.donateNow')}
                </Link>
            </div>
        </div>
    );
}

export default ProjectCard;
