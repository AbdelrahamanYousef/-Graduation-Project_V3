import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { t, formatNumber, formatCurrency } from '../../i18n';
import { useAdminData } from '../../contexts/AdminDataContext';
import { paths } from '../../constants/paths';

function Projects() {
    const { isDark } = useTheme();
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProgram, setSelectedProgram] = useState(searchParams.get('program') || 'all');
    const [sortBy, setSortBy] = useState('newest');

    const { state } = useAdminData();
    const activePrograms = state.programs?.filter(p => !p.status || p.status === 'active') || [];
    const projects = state.projects;
    const programs = activePrograms;

    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.includes(searchQuery) ||
            project.description.includes(searchQuery);
        const matchesProgram = selectedProgram === 'all' ||
            project.programId.toString() === selectedProgram;
        return matchesSearch && matchesProgram;
    });

    const sortedProjects = [...filteredProjects].sort((a, b) => {
        switch (sortBy) {
            case 'mostFunded':
                return (b.raised / b.goal) - (a.raised / a.goal);
            case 'endingSoon':
                return a.daysLeft - b.daysLeft;
            default:
                return b.id - a.id;
        }
    });

    return (
        <div className="py-8 min-h-[80vh]">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                <h1 className="text-3xl font-bold mb-4">{t('projects.title')}</h1>

                <div className="mb-4 flex gap-2 flex-wrap md:flex-nowrap">
                    <div className="relative flex-[2]">
                        <i className="fa-solid fa-magnifying-glass absolute top-1/2 -translate-y-1/2 right-3 text-neutral-400"></i>
                        <input
                            placeholder={t('projects.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                        />
                    </div>

                    <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="w-full md:flex-1 min-w-[200px] px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="all">{t('projects.allPrograms')}</option>
                        {programs.map(program => (
                            <option key={program.id} value={program.id}>{program.name}</option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full md:flex-1 min-w-[200px] px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="newest">{t('projects.newest')}</option>
                        <option value="mostFunded">{t('projects.mostFunded')}</option>
                        <option value="endingSoon">{t('projects.endingSoon')}</option>
                    </select>
                </div>

                {sortedProjects.length === 0 ? (
                    <div className="text-center py-8">
                        <h2 className="text-4xl mb-2">🔍</h2>
                        <h5 className="text-lg mb-1">{t('states.noSearchResults')}</h5>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-4">{t('projects.noResults')}</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedProgram('all'); }}
                            className="border border-primary-500 text-primary-500 px-5 py-2 rounded-md font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        >
                            {t('common.viewAll')}
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-3">
                        {sortedProjects.map(project => (
                            <div className="col-span-12" key={project.id}>
                                <ProjectListCard project={project} isDark={isDark} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ProjectListCard({ project, isDark }) {
    const progress = Math.min(100, Math.round((project.raised / project.goal) * 100));

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card border border-neutral-100 dark:border-neutral-700 flex flex-col md:flex-row h-auto md:h-[280px] overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative md:h-full md:w-80 shrink-0">
                <img
                    className="w-full h-48 md:h-full object-cover"
                    src={project.image || project.imageUrl || '/vite.svg'}
                    alt={project.title}
                    onError={(e) => { e.target.src = '/vite.svg'; }}
                />
                <span className="absolute top-4 left-4 inline-flex px-2 py-0.5 rounded text-xs font-medium bg-primary-500 text-white shadow-md">
                    {project.program}
                </span>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    <Link
                        to={paths.getProjectDetails(project.programId, project.id)}
                        className="text-xl font-bold hover:text-primary-500 transition-colors no-underline text-inherit"
                    >
                        {project.title}
                    </Link>
                </div>

                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-2">
                    {project.description}
                </p>

                <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 text-sm mb-3">
                    <i className="fa-solid fa-location-dot"></i>
                    {project.location}
                </div>

                <div className="mt-auto space-y-2">
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
                        <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress}%` }}></div>
                    </div>

                    <div className="flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500 font-medium">
                        <span>نسبة الإنجاز: {progress}%</span>
                        <span>{project.daysLeft} يوم متبقي</span>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            <strong>{formatNumber(project.donors)}</strong> {t('projects.donors')}
                        </span>
                        <Link
                            to={paths.getProjectDetails(project.programId, project.id)}
                            className="bg-primary-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-primary-600 transition-colors"
                        >
                            {t('common.donate')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Projects;
