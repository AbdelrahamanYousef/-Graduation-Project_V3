import { useState, useEffect, useRef } from 'react';
import { AdminPageHeader, AdminStatsGrid, AdminIconBox } from '../../components/admin';
import { t, formatCurrency, formatNumber } from '../../i18n';
import { recentReports, reportTypes } from '../../data/adminMockData';
import { useAdminData } from '../../contexts/AdminDataContext';
import { getAuditReports, createAuditReport, updateAuditReport, deleteAuditReport, uploadDocument } from '../../api';

function AdminReports() {
    const { state } = useAdminData();
    const dashboardStats = state.dashboardStats || {};
    const [reports, setReports] = useState(recentReports || []);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [auditReports, setAuditReports] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editReport, setEditReport] = useState(null);
    const [newReport, setNewReport] = useState({ year: '', firm: '', status: 'معتمد', fileUrl: '' });
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFileSelect = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await uploadDocument(file);
            setNewReport(prev => ({ ...prev, fileUrl: res.url }));
            setSnackbar({ open: true, msg: 'تم رفع الملف بنجاح', severity: 'success' });
        } catch (err) {
            console.error('Failed to upload file:', err);
            setSnackbar({ open: true, msg: err.message || 'فشل رفع الملف', severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    const quickStats = [
        { label: t('admin.reportsPage.totalDonations'), value: formatCurrency(dashboardStats.totalDonations || 0), icon: 'fa-solid fa-coins', color: 'success' },
        { label: t('admin.reportsPage.donorCount'), value: formatNumber(new Set(state.donations.map(d => d.donor || d.donorName)).size), icon: 'fa-solid fa-users', color: 'primary' },
        { label: t('admin.reportsPage.newBeneficiaries'), value: formatNumber(state.beneficiaries?.length || 0), icon: 'fa-solid fa-user-plus', color: 'info' },
        { label: t('admin.reportsPage.completedProjects'), value: formatNumber(state.projects.filter(p => p.status === 'completed').length), icon: 'fa-solid fa-circle-check', color: 'warning' },
    ];

    const generateCSV = (typeTitle) => {
        let headers = [];
        let rows = [];
        
        if (typeTitle.includes('تبرعات')) {
            headers = ['ID', 'المتبرع', 'المبلغ', 'المشروع', 'التاريخ', 'الحالة'];
            rows = state.donations.map(d => [d.id, `"${d.donor || ''}"`, d.amount, `"${d.project || ''}"`, d.date || d.time || '', d.status || '']);
        } else if (typeTitle.includes('مشاريع')) {
            headers = ['ID', 'المشروع', 'الهدف', 'تم جمعه', 'الحالة'];
            rows = state.projects.map(p => [p.id, `"${p.title}"`, p.goal, p.raised || 0, p.status || 'active']);
        } else if (typeTitle.includes('مستفيدين')) {
            headers = ['ID', 'الاسم', 'النوع', 'البرنامج', 'المحافظة', 'الحالة'];
            rows = state.beneficiaries.map(b => [b.id, `"${b.name}"`, b.type, `"${b.program || ''}"`, `"${b.location || ''}"`, b.status || 'active']);
        } else if (typeTitle.includes('مالي')) {
            headers = ['النوع', 'الجهة / المتبرع', 'المبلغ', 'التاريخ', 'الحالة'];
            const incomeRows = state.donations.map(d => ['إيراد (تبرع)', `"${d.donor}"`, d.amount, d.date || '', d.status || '']);
            const expenseRows = state.disbursements.map(d => ['مصروف', `"${d.beneficiary}"`, d.amount, d.date || '', d.status || '']);
            rows = [...incomeRows, ...expenseRows];
        } else {
            headers = ['الوصف', 'القيمة'];
            rows = [
                ['إجمالي التبرعات', dashboardStats.totalDonations || 0],
                ['عدد المستفيدين', dashboardStats.beneficiaries || 0],
                ['المشاريع النشطة', dashboardStats.activeProjects || 0],
            ];
        }
        
        const csvRows = [headers.join(','), ...rows.map(r => r.join(','))];
        const csvString = csvRows.join('\n');
        const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Report_${typeTitle}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCreateReport = (type) => {
        const newReport = {
            id: Math.max(...reports.map(r => r.id), 0) + 1,
            title: type.title,
            icon: type.icon,
            color: type.color,
            period: 'تقرير مخصص',
            generated: new Date().toLocaleDateString('ar-EG'),
        };
        setReports(prev => [newReport, ...prev]);
        generateCSV(type.title);
        setSnackbar({ open: true, msg: `تم إنشاء وتحميل التقرير "${type.title}" بنجاح`, severity: 'success' });
    };

    const handleViewReport = (report) => {
        setSnackbar({ open: true, msg: `جاري فتح التقرير: ${report.title}`, severity: 'info' });
    };

    const handleDownloadReport = (report) => {
        generateCSV(report.title);
        setSnackbar({ open: true, msg: `تم تحميل التقرير: ${report.title}`, severity: 'success' });
    };

    const handleDeleteReport = (reportId) => {
        setReports(prev => prev.filter(r => r.id !== reportId));
        setSnackbar({ open: true, msg: 'تم حذف التقرير', severity: 'success' });
    };

    useEffect(() => {
        async function fetchAuditReports() {
            try {
                const data = await getAuditReports();
                setAuditReports(data || []);
            } catch (err) {
                console.error('Failed to fetch audit reports:', err);
            }
        }
        fetchAuditReports();
    }, []);

    const handleSaveAuditReport = async (e) => {
        e.preventDefault();
        try {
            if (editReport) {
                const report = await updateAuditReport(editReport.id, newReport);
                setAuditReports(prev => prev.map(r => r.id === editReport.id ? report : r));
                setSnackbar({ open: true, msg: 'تم تحديث تقرير المراجعة بنجاح', severity: 'success' });
            } else {
                const report = await createAuditReport(newReport);
                setAuditReports(prev => [report, ...prev]);
                setSnackbar({ open: true, msg: 'تم إضافة تقرير المراجعة بنجاح', severity: 'success' });
            }
            setIsModalOpen(false);
            setEditReport(null);
            setNewReport({ year: '', firm: '', status: 'معتمد', fileUrl: '' });
        } catch (err) {
            console.error('Failed to save audit report:', err);
            setSnackbar({ open: true, msg: err.message || 'حدث خطأ أثناء حفظ التقرير', severity: 'error' });
        }
    };

    const handleEditAuditReport = (report) => {
        setEditReport(report);
        setNewReport({
            year: report.year,
            firm: report.firm,
            status: report.status,
            fileUrl: report.fileUrl || ''
        });
        setIsModalOpen(true);
    };

    const handleDeleteAuditReport = async (id) => {
        if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا التقرير؟')) return;
        try {
            await deleteAuditReport(id);
            setAuditReports(prev => prev.filter(r => r.id !== id));
            setSnackbar({ open: true, msg: 'تم حذف تقرير المراجعة بنجاح', severity: 'success' });
        } catch (err) {
            console.error('Failed to delete audit report:', err);
            setSnackbar({ open: true, msg: err.message || 'حدث خطأ أثناء حذف التقرير', severity: 'error' });
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader
                title={t('admin.reportsPage.title')}
                subtitle={t('admin.reportsPage.subtitle')}
                action={{ label: t('admin.reportsPage.createReport'), icon: 'fa-solid fa-plus', onClick: () => handleCreateReport(reportTypes[0]) }}
            />

            <AdminStatsGrid stats={quickStats} columns={3} />

            {/* Report Types - Quick Create */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h6 className="text-base font-bold">{t('admin.reportsPage.quickCreate')}</h6>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-12 gap-4">
                        {reportTypes.map((rt, i) => (
                            <div className="col-span-12 sm:col-span-6 md:col-span-3" key={i}>
                                <div
                                    onClick={() => handleCreateReport(rt)}
                                    className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-100 dark:border-neutral-700 p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                                >
                                    <AdminIconBox icon={rt.icon} color={rt.color} size={44} />
                                    <p className="font-bold mt-3">{rt.title}</p>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{rt.desc}</span>
                                    <button className="block text-xs font-bold p-0 mt-1 text-primary-500">
                                        {t('admin.reportsPage.create')} <i className="fa-solid fa-arrow-left" style={{ marginInlineEnd: 4 }} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                    <h6 className="text-base font-bold">{t('admin.reportsPage.recentReports')}</h6>
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium border border-primary-500 text-primary-500">
                        {reports.length}
                    </span>
                </div>
                {reports.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-neutral-500 dark:text-neutral-400">لا توجد تقارير</p>
                    </div>
                ) : (
                    <div>
                        {reports.map((report, i) => (
                            <div key={report.id} className={`flex items-center gap-3 p-3 ${i !== reports.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`}>
                                <AdminIconBox icon={report.icon} color={report.color} size={40} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{report.title}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300">
                                            {report.period}
                                        </span>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{t('admin.reportsPage.createdOn')}: {report.generated}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button className="border border-primary-500 text-primary-500 px-3 py-1 rounded-md text-xs font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" onClick={() => handleViewReport(report)}>{t('admin.reportsPage.view')}</button>
                                    <button className="border border-neutral-400 text-neutral-600 dark:text-neutral-300 px-3 py-1 rounded-md text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors" onClick={() => handleDownloadReport(report)}>{t('admin.reportsPage.download')}</button>
                                    <button className="border border-error-500 text-error-500 px-2 py-1 rounded-md text-xs hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors" onClick={() => handleDeleteReport(report.id)}><i className="fa-solid fa-trash" style={{ fontSize: 12 }} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Audit Reports (تقارير المراجعة الخارجية) */}
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 mt-4">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                    <h6 className="text-base font-bold">تقارير المراجعة الخارجية (الشفافية)</h6>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                        <i className="fa-solid fa-plus"></i> إضافة تقرير مالي
                    </button>
                </div>
                {auditReports.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-neutral-500 dark:text-neutral-400">لا توجد تقارير مراجعة</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-right">
                            <thead className="bg-neutral-50 dark:bg-neutral-700/50">
                                <tr>
                                    <th className="p-3 text-sm font-bold text-neutral-600 dark:text-neutral-300">السنة</th>
                                    <th className="p-3 text-sm font-bold text-neutral-600 dark:text-neutral-300">مكتب المراجعة</th>
                                    <th className="p-3 text-sm font-bold text-neutral-600 dark:text-neutral-300">الحالة</th>
                                    <th className="p-3 text-sm font-bold text-neutral-600 dark:text-neutral-300">رابط الملف</th>
                                    <th className="p-3 text-sm font-bold text-neutral-600 dark:text-neutral-300">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditReports.map((report) => (
                                    <tr key={report.id} className="border-t border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50/50 dark:hover:bg-neutral-700/30 transition-colors">
                                        <td className="p-3 text-sm font-medium">{report.year}</td>
                                        <td className="p-3 text-sm">{report.firm}</td>
                                        <td className="p-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                                                report.status === 'معتمد' ? 'bg-success-500/10 text-success-600 dark:text-success-400' : 'bg-warning-500/10 text-warning-600 dark:text-warning-400'
                                            }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm truncate max-w-[150px]">
                                            {report.fileUrl ? (
                                                <a href={report.fileUrl} className="text-primary-500 hover:underline">
                                                    {report.fileUrl}
                                                </a>
                                            ) : (
                                                <span className="text-neutral-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 flex gap-1 justify-end">
                                            <button 
                                                onClick={() => handleEditAuditReport(report)}
                                                className="text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 p-1.5 rounded transition-all"
                                                title="تعديل"
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteAuditReport(report.id)}
                                                className="text-error-500 hover:bg-error-50 dark:hover:bg-error-950/30 p-1.5 rounded transition-all"
                                                title="حذف"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Audit Report Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full p-6 shadow-xl border border-neutral-100 dark:border-neutral-700 text-right" style={{ direction: 'rtl' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-bold">{editReport ? 'تعديل تقرير مالي مراجع' : 'إضافة تقرير مالي مراجع'}</h5>
                            <button onClick={() => { setIsModalOpen(false); setEditReport(null); setNewReport({ year: '', firm: '', status: 'معتمد', fileUrl: '' }); }} className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
                                <i className="fa-solid fa-times text-lg"></i>
                            </button>
                        </div>
                        <form onSubmit={handleSaveAuditReport} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1 text-neutral-600 dark:text-neutral-300">السنة المالية</label>
                                <input 
                                    type="text" 
                                    placeholder="مثال: 2024" 
                                    required
                                    value={newReport.year}
                                    onChange={(e) => setNewReport(prev => ({ ...prev, year: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-primary-500 focus:outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1 text-neutral-600 dark:text-neutral-300">مكتب المراجعة</label>
                                <input 
                                    type="text" 
                                    placeholder="مثال: PWC مصر" 
                                    required
                                    value={newReport.firm}
                                    onChange={(e) => setNewReport(prev => ({ ...prev, firm: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-primary-500 focus:outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1 text-neutral-600 dark:text-neutral-300">الحالة</label>
                                <select 
                                    value={newReport.status}
                                    onChange={(e) => setNewReport(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:border-primary-500 focus:outline-none text-sm text-right"
                                >
                                    <option value="معتمد">معتمد</option>
                                    <option value="قيد المراجعة">قيد المراجعة</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold mb-1 text-neutral-600 dark:text-neutral-300">ملف التقرير (PDF)</label>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        type="text" 
                                        placeholder="مثال: /uploads/reports/2024.pdf" 
                                        value={newReport.fileUrl}
                                        onChange={(e) => setNewReport(prev => ({ ...prev, fileUrl: e.target.value }))}
                                        className="flex-1 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent focus:border-primary-500 focus:outline-none text-sm text-left"
                                        style={{ direction: 'ltr' }}
                                    />
                                    <input 
                                        type="file" 
                                        accept=".pdf,.doc,.docx,.xls,.xlsx" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect} 
                                        className="hidden" 
                                    />
                                    <button 
                                        type="button" 
                                        disabled={uploading}
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="px-3 py-2 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                                    >
                                        {uploading ? 'جاري الرفع...' : 'رفع ملف'}
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => { setIsModalOpen(false); setEditReport(null); setNewReport({ year: '', firm: '', status: 'معتمد', fileUrl: '' }); }}
                                    className="px-4 py-2 text-xs font-bold rounded-lg border border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-700 transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 text-xs font-bold rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
                                >
                                    حفظ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {snackbar.open && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
                    <div className={`px-4 py-3 rounded-lg text-sm font-medium shadow-lg text-white ${
                        snackbar.severity === 'success' ? 'bg-success-500' :
                        snackbar.severity === 'error' ? 'bg-error-500' :
                        snackbar.severity === 'warning' ? 'bg-warning-500' :
                        'bg-primary-500'
                    }`}>
                        {snackbar.msg}
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminReports;
