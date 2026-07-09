import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { t, formatCurrency } from '../../i18n';
import { AdminPageHeader, AdminStatsGrid } from '../../components/admin';
import { getPriorityColor } from '../../utils/admin.helpers';
import { useAdminData } from '../../contexts/AdminDataContext';
import { dashboardPendingTasks } from '../../data/adminMockData';

function Dashboard() {
    const { state } = useAdminData();
    const dashboardStats = state.dashboardStats || {};

    const [tasks, setTasks] = useState(dashboardPendingTasks || []);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const handleCompleteTask = useCallback((taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        setSnackbar({ open: true, msg: 'تم إنهاء المهمة بنجاح ✓', severity: 'success' });
    }, []);

    const handleExportCSV = () => {
        if (!state.donations || state.donations.length === 0) {
            setSnackbar({ open: true, msg: 'لا توجد بيانات لتصديرها', severity: 'error' });
            return;
        }

        const headers = ['ID', 'المتبرع', 'المبلغ', 'المشروع', 'طريقة الدفع', 'التاريخ', 'الحالة'];
        const csvRows = [headers.join(',')];

        state.donations.forEach(d => {
            const row = [
                d.id,
                `"${d.donor || ''}"`,
                d.amount,
                `"${d.project || ''}"`,
                d.method || '',
                d.date || d.time || '',
                d.status || ''
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Nour_Donations_Report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSnackbar({ open: true, msg: 'تم تصدير التقرير بنجاح ✓', severity: 'success' });
    };

    const kpis = [
        {
            label: 'إجمالي التبرعات',
            value: formatCurrency(dashboardStats.totalDonations || 0),
            icon: 'fa-solid fa-coins',
            color: 'success',
            change: `${state.donations.length} تبرع`,
            link: '/admin/donations',
        },
        {
            label: 'المشاريع النشطة',
            value: String(dashboardStats.activeProjects || 0),
            icon: 'fa-solid fa-clipboard-list',
            color: 'primary',
            change: `من أصل ${dashboardStats.totalProjects || 0} مشروع`,
            link: '/admin/projects',
        },
        {
            label: 'عدد البرامج',
            value: String(dashboardStats.totalPrograms || 0),
            icon: 'fa-solid fa-folder-open',
            color: 'info',
            change: 'إجمالي البرامج',
            link: '/admin/programs',
        },
        {
            label: 'المستفيدون المسجّلون',
            value: String(dashboardStats.beneficiaries || 0),
            icon: 'fa-solid fa-users',
            color: 'warning',
            change: 'إجمالي الحالات',
            link: '/admin/beneficiaries',
        },
    ];

    const quickActions = [
        { label: t('admin.addProject'), icon: 'fa-solid fa-clipboard-list', link: '/admin/projects', color: 'primary' },
        { label: t('admin.addProgram'), icon: 'fa-solid fa-folder-open', link: '/admin/programs', color: 'secondary' },
        { label: t('admin.viewReports'), icon: 'fa-solid fa-chart-line', link: '/admin/reports', color: 'info' },
        { label: t('admin.manageUsers'), icon: 'fa-solid fa-users', link: '/admin/settings', color: 'success' },
    ];

    const recentDonations = [...state.donations].reverse().slice(0, 5);

    const priorityBarColor = (priority) => {
        const map = { error: 'var(--color-error-500)', warning: 'var(--color-warning-500)', success: 'var(--color-success-500)' };
        return map[getPriorityColor(priority)] || 'var(--color-neutral-500)';
    };

    const dynamicBg100 = (color) => `color-mix(in srgb, var(--color-${color || 'primary'}-500) 10%, transparent)`;
    const dynamicColor = (color) => `var(--color-${color || 'primary'}-500)`;

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader
                title={t('admin.dashboard')}
                subtitle="مرحباً بك في لوحة تحكم جمعية نور الخيرية 👋"
                secondaryAction={{ label: t('admin.exportReport'), icon: 'fa-solid fa-download', onClick: handleExportCSV }}
            />

            <AdminStatsGrid stats={kpis} columns={3} />

            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 lg:col-span-8">
                    <div className="flex flex-col gap-3">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                            <div className="p-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
                                <h6 className="font-bold text-base">{t('admin.recentDonations')}</h6>
                                <Link to="/admin/donations" className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">{t('admin.viewAllBtn')}</Link>
                            </div>
                            {recentDonations.length === 0 ? (
                                <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">
                                    <p className="text-sm">لا توجد تبرعات بعد</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-700">
                                                <th className="p-3 text-right text-sm font-bold">{t('admin.donationsPage.donor')}</th>
                                                <th className="p-3 text-right text-sm font-bold">{t('admin.donationsPage.amount')}</th>
                                                <th className="p-3 text-right text-sm font-bold">{t('admin.donationsPage.project')}</th>
                                                <th className="p-3 text-right text-sm font-bold">طريقة الدفع</th>
                                                <th className="p-3 text-right text-sm font-bold">{t('admin.donationsPage.date')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentDonations.map(donation => (
                                                <tr key={donation.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                                                    <td className="p-3 font-medium">{donation.donor}</td>
                                                    <td className="p-3 font-bold text-success-500">{formatCurrency(donation.amount)}</td>
                                                    <td className="p-3">{donation.project}</td>
                                                    <td className="p-3">{donation.method}</td>
                                                    <td className="p-3 text-neutral-500 dark:text-neutral-400 text-sm">{donation.date || donation.time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h6 className="font-bold text-base">{t('admin.quickActions')}</h6>
                            </div>
                            <div className="p-4">
                                <div className="grid grid-cols-12 gap-2">
                                    {quickActions.map((action, i) => (
                                        <div className="col-span-6 sm:col-span-3" key={i}>
                                            <Link to={action.link}
                                                className="flex flex-col items-center gap-1 py-4 px-2 h-full rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
                                                style={{ hover: {} }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = `var(--color-${action.color}-500)`; e.currentTarget.style.color = `var(--color-${action.color}-500)`; e.currentTarget.style.backgroundColor = `color-mix(in srgb, var(--color-${action.color}-500) 4%, transparent)`; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = ''; e.currentTarget.style.backgroundColor = ''; }}
                                            >
                                                <span className="text-2xl mb-1"><i className={action.icon} /></span>
                                                <span className="text-sm font-medium">{action.label}</span>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-4">
                    <div className="flex flex-col gap-3">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                            <div className="p-4 flex justify-between items-center border-b border-neutral-200 dark:border-neutral-700">
                                <h6 className="font-bold text-base">{t('admin.pendingTasks')}</h6>
                                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${tasks.length > 0 ? 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400' : 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400'}`}>{tasks.length}</span>
                            </div>
                            {tasks.length === 0 ? (
                                <div className="p-3 text-center">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">لا توجد مهام معلقة ✓</p>
                                </div>
                            ) : (
                                <div>
                                    {tasks.map((task, i) => (
                                        <div key={task.id} className={`flex items-center px-4 py-3 gap-3 ${i !== tasks.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`}>
                                            <div className="w-1 h-10 rounded" style={{ backgroundColor: priorityBarColor(task.priority) }} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{task.title}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">← {task.assignee}</p>
                                            </div>
                                            <button
                                                className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-success-500"
                                                onClick={() => handleCompleteTask(task.id)}
                                                title="إكمال المهمة"
                                            >
                                                <i className="fa-regular fa-square-check" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h6 className="font-bold text-base">{t('admin.recentActivity')}</h6>
                            </div>
                            <div>
                                {state.activities.length === 0 ? (
                                    <div className="p-3 text-center">
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">لا توجد نشاطات حديثة</p>
                                    </div>
                                ) : state.activities.map((activity) => (
                                    <div key={activity.id} className="flex items-start px-4 py-3 gap-3">
                                        <div className="w-8 h-8 rounded flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: dynamicBg100(activity.color || 'primary'), color: dynamicColor(activity.color || 'primary') }}>
                                            <i className={activity.icon || 'fa-solid fa-bolt'} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{activity.action}</p>
                                            <div className="flex gap-1 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                <span>{activity.user || 'المدير'}</span><span>•</span><span>{new Date(activity.timestamp).toLocaleString('ar-EG')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg flex items-center gap-2 ${
                        snackbar.severity === 'success' ? 'bg-success-500 text-white' :
                        snackbar.severity === 'error' ? 'bg-error-500 text-white' :
                        'bg-primary-500 text-white'
                    }`}>
                        <span>{snackbar.msg}</span>
                        <button className="text-white/80 hover:text-white mr-2" onClick={() => setSnackbar(s => ({ ...s, open: false }))}>
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
