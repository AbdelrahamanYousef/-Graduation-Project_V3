import { useState, useCallback, useEffect } from 'react';
import { AdminPageHeader, AdminFilterBar, AdminDataTable, AdminIconBox, AdminFormDialog } from '../../components/admin';
import { t } from '../../i18n';
import { settingsUsers as initialUsers, settingsIntegrations as initialIntegrations, settingsNotifications } from '../../data/adminMockData';
import { getStatusColor, getStatusLabel } from '../../utils/admin.helpers';
import { useAdminData, adminActions } from '../../contexts/AdminDataContext';
import { getUsers, createUser, updateUser, deleteUser } from '../../api';

function AdminSettings() {
    const { state, dispatch } = useAdminData();
    const [activeTab, setActiveTab] = useState('general');
    const [users, setUsers] = useState([]);
    const [integrations, setIntegrations] = useState(initialIntegrations || []);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [resetDialog, setResetDialog] = useState({ open: false, input: '' });

    const loadUsers = useCallback(async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            setSnackbar({ open: true, msg: 'فشل تحميل المستخدمين: ' + err.message, severity: 'error' });
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab, loadUsers]);

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => setSnackbar(s => ({ ...s, open: false })), 3000);
            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    // Org form state
    const [orgData, setOrgData] = useState({
        name: state.settings?.organization?.name || state.settings?.orgName || 'جمعية نور الخيرية',
        email: state.settings?.organization?.email || state.settings?.email || 'info@nour.org',
        phone: state.settings?.organization?.phone || state.settings?.phone || '+20 2 1234 5678',
        address: state.settings?.organization?.address || state.settings?.address || 'القاهرة، مصر',
        workingHours: state.settings?.organization?.workingHours || state.settings?.workingHours || 'من 9 صباحاً إلى 5 مساءً',
    });
    const [socialData, setSocialData] = useState({
        facebook: state.settings?.social?.facebook || '',
        twitter: state.settings?.social?.twitter || '',
        instagram: state.settings?.social?.instagram || '',
        youtube: state.settings?.social?.youtube || '',
        whatsapp: state.settings?.social?.whatsapp || '',
    });
    const [sysData, setSysData] = useState({ language: 'ar', timezone: 'africa-cairo', currency: 'egp' });

    // User form state
    const emptyUserForm = { name: '', email: '', password: '', role: 'EDITOR', status: 'ACTIVE' };
    const [userForm, setUserForm] = useState(emptyUserForm);

    const handleSaveOrg = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: {
            organization: {
                name: orgData.name,
                email: orgData.email,
                phone: orgData.phone,
                address: orgData.address,
                workingHours: orgData.workingHours,
            },
            social: socialData,
            // Legacy flat fields for backward compat
            orgName: orgData.name,
            email: orgData.email,
            phone: orgData.phone,
            address: orgData.address,
            workingHours: orgData.workingHours,
        }});
        setSnackbar({ open: true, msg: 'تم حفظ بيانات المؤسسة بنجاح ✓', severity: 'success' });
    };
    const handleSaveSys = () => setSnackbar({ open: true, msg: 'تم حفظ إعدادات النظام بنجاح ✓', severity: 'success' });

    const handleAddUser = () => { setEditUser(null); setUserForm(emptyUserForm); setIsUserModalOpen(true); };
    const handleEditUser = useCallback((user) => {
        setEditUser(user);
        setUserForm({ name: user.name, email: user.email, password: '', role: user.role, status: user.status || 'ACTIVE' });
        setIsUserModalOpen(true);
    }, []);

    const handleDeleteUser = useCallback(async (user) => {
        try {
            await deleteUser(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            setSnackbar({ open: true, msg: `تم حذف المستخدم "${user.name}"`, severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, msg: 'فشل حذف المستخدم: ' + err.message, severity: 'error' });
        }
    }, []);

    const handleSubmitUser = async () => {
        if (!userForm.name.trim() || !userForm.email.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال اسم وبريد المستخدم', severity: 'error' }); return;
        }
        if (!editUser && !userForm.password.trim()) {
            setSnackbar({ open: true, msg: 'يرجى إدخال كلمة المرور للمستخدم الجديد', severity: 'error' }); return;
        }
        try {
            if (editUser) {
                const updateData = {
                    name: userForm.name,
                    email: userForm.email,
                    role: userForm.role,
                    status: userForm.status
                };
                if (userForm.password && userForm.password.trim() !== '') {
                    updateData.password = userForm.password;
                }
                const updated = await updateUser(editUser.id, updateData);
                setUsers(prev => prev.map(u => u.id === editUser.id ? updated : u));
                setSnackbar({ open: true, msg: `تم تحديث "${userForm.name}"`, severity: 'success' });
            } else {
                const created = await createUser({
                    name: userForm.name,
                    email: userForm.email,
                    password: userForm.password,
                    role: userForm.role
                });
                setUsers(prev => [created, ...prev]);
                setSnackbar({ open: true, msg: `تم إضافة "${userForm.name}" بنجاح`, severity: 'success' });
            }
            setIsUserModalOpen(false);
            setUserForm(emptyUserForm);
        } catch (err) {
            setSnackbar({ open: true, msg: 'حدث خطأ: ' + (err.message || 'فشلت العملية'), severity: 'error' });
        }
    };

    const handleToggleIntegration = useCallback((index) => {
        setIntegrations(prev => prev.map((intg, i) =>
            i === index ? { ...intg, status: intg.status === 'connected' ? 'disconnected' : 'connected' } : intg
        ));
        setSnackbar({ open: true, msg: 'تم تحديث حالة وسيلة الدفع', severity: 'success' });
    }, []);

    const handleResetAll = () => {
        if (resetDialog.input === 'حذف جميع البيانات') {
            dispatch(adminActions.resetAll());
            setSnackbar({ open: true, msg: 'تم إعادة تعيين جميع البيانات إلى حالتها الافتراضية', severity: 'warning' });
            setResetDialog({ open: false, input: '' });
        } else {
            setSnackbar({ open: true, msg: 'النص غير متطابق. لم يتم حذف البيانات.', severity: 'error' });
        }
    };

    const handleToggleNotification = (index) => {
        setSnackbar({ open: true, msg: 'تم تحديث إعداد الإشعارات', severity: 'success' });
    };

    const tabs = [
        { label: t('admin.settingsPage.general'), value: 'general', icon: 'fa-solid fa-gear' },
        { label: `${t('admin.settingsPage.usersTab')} (${users.length})`, value: 'users', icon: 'fa-solid fa-users' },
        { label: t('admin.settingsPage.notifications'), value: 'notifications', icon: 'fa-solid fa-bell' },
        { label: 'بوابات الدفع', value: 'integrations', icon: 'fa-solid fa-credit-card' },
    ];

    const statusColorMap = {
        connected: { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success-700 dark:text-success-400' },
        active: { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success-700 dark:text-success-400' },
        disconnected: { bg: 'bg-neutral-100 dark:bg-neutral-700', text: 'text-neutral-700 dark:text-neutral-300' },
        pending: { bg: 'bg-warning-100 dark:bg-warning-900/30', text: 'text-warning-700 dark:text-warning-400' },
        error: { bg: 'bg-error-100 dark:bg-error-900/30', text: 'text-error-700 dark:text-error-400' },
    };

    const userColumns = [
        {
            key: 'name', label: t('admin.settingsPage.name'), fontWeight: 'medium',
            render: (_, row) => (
                <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-sm font-bold overflow-hidden">
                        {row.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{row.name}</p>
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{row.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: 'role', label: t('admin.settingsPage.role'),
            render: (role) => {
                if (role === 'ADMIN') return 'مدير النظام';
                if (role === 'EDITOR') return 'محرر محتوى';
                if (role === 'RESEARCHER') return 'باحث ميداني';
                if (role === 'USER') return 'مستخدم عادي';
                return role;
            }
        },
        {
            key: 'status', label: t('admin.settingsPage.status'),
            render: (status) => {
                const colors = {
                    ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
                    INACTIVE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                };
                const labels = {
                    ACTIVE: 'نشط',
                    INACTIVE: 'غير نشط',
                    PENDING: 'معلق',
                };
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                        {labels[status] || status}
                    </span>
                );
            }
        },
    ];

    const userActions = [
        { icon: 'fa-solid fa-pen', tooltip: t('common.edit'), onClick: (row) => handleEditUser(row) },
        { icon: 'fa-solid fa-trash', tooltip: t('common.delete'), color: 'error', onClick: (row) => handleDeleteUser(row) },
    ];

    const updateUserField = (field) => (e) => setUserForm(prev => ({ ...prev, [field]: e.target.value }));

    return (
        <div className="flex flex-col gap-3">
            <AdminPageHeader
                title={t('admin.settingsPage.title')}
                subtitle={t('admin.settingsPage.subtitle')}
            />

            <AdminFilterBar tabs={tabs} activeTab={activeTab} onTabChange={(_, v) => setActiveTab(v)} />

            {/* General Settings */}
            {activeTab === 'general' && (
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-6">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h6 className="text-base font-bold">{t('admin.settingsPage.orgInfo')}</h6>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('admin.settingsPage.orgName')} value={orgData.name} onChange={e => setOrgData(d => ({ ...d, name: e.target.value }))} />
                                <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('admin.settingsPage.email')} value={orgData.email} onChange={e => setOrgData(d => ({ ...d, email: e.target.value }))} />
                                <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('admin.settingsPage.phone')} value={orgData.phone} onChange={e => setOrgData(d => ({ ...d, phone: e.target.value }))} />
                                <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('admin.settingsPage.address')} value={orgData.address} onChange={e => setOrgData(d => ({ ...d, address: e.target.value }))} />
                                <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="مواعيد العمل" value={orgData.workingHours} onChange={e => setOrgData(d => ({ ...d, workingHours: e.target.value }))} />
                                <p className="text-sm font-bold mt-2">روابط التواصل الاجتماعي</p>
                                <div className="relative">
                                    <i className="fa-brands fa-facebook absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#1877F2' }} />
                                    <input className="w-full px-3 py-2.5 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://facebook.com/..." value={socialData.facebook} onChange={e => setSocialData(d => ({ ...d, facebook: e.target.value }))} />
                                </div>
                                <div className="relative">
                                    <i className="fa-brands fa-x-twitter absolute right-3 top-1/2 -translate-y-1/2" />
                                    <input className="w-full px-3 py-2.5 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://x.com/..." value={socialData.twitter} onChange={e => setSocialData(d => ({ ...d, twitter: e.target.value }))} />
                                </div>
                                <div className="relative">
                                    <i className="fa-brands fa-instagram absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#E4405F' }} />
                                    <input className="w-full px-3 py-2.5 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://instagram.com/..." value={socialData.instagram} onChange={e => setSocialData(d => ({ ...d, instagram: e.target.value }))} />
                                </div>
                                <div className="relative">
                                    <i className="fa-brands fa-youtube absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#FF0000' }} />
                                    <input className="w-full px-3 py-2.5 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://youtube.com/..." value={socialData.youtube} onChange={e => setSocialData(d => ({ ...d, youtube: e.target.value }))} />
                                </div>
                                <div className="relative">
                                    <i className="fa-brands fa-whatsapp absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#25D366' }} />
                                    <input className="w-full px-3 py-2.5 pr-10 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://wa.me/..." value={socialData.whatsapp} onChange={e => setSocialData(d => ({ ...d, whatsapp: e.target.value }))} />
                                </div>
                                <button className="self-start bg-primary-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-primary-600 transition-colors" onClick={handleSaveOrg}>{t('admin.settingsPage.saveChanges')}</button>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700">
                            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                                <h6 className="text-base font-bold">{t('admin.settingsPage.systemSettings')}</h6>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <select className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={sysData.language} onChange={e => setSysData(d => ({ ...d, language: e.target.value }))}>
                                    <option value="ar">العربية</option>
                                    <option value="en">English</option>
                                </select>
                                <select className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={sysData.timezone} onChange={e => setSysData(d => ({ ...d, timezone: e.target.value }))}>
                                    <option value="africa-cairo">القاهرة (GMT+2)</option>
                                    <option value="asia-riyadh">الرياض (GMT+3)</option>
                                </select>
                                <select className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={sysData.currency} onChange={e => setSysData(d => ({ ...d, currency: e.target.value }))}>
                                    <option value="egp">جنيه مصري (EGP)</option>
                                    <option value="usd">دولار أمريكي (USD)</option>
                                </select>
                                <button className="self-start bg-primary-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-primary-600 transition-colors" onClick={handleSaveSys}>{t('admin.settingsPage.saveChanges')}</button>
                            </div>
                        </div>

                        <div className="rounded-lg shadow-card border border-error-500 mt-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                            <div className="p-4 border-b border-error-500 text-error-500">
                                <h6 className="text-base font-bold">منطقة الخطر (Danger Zone)</h6>
                            </div>
                            <div className="p-4">
                                <p className="text-sm mb-4">
                                    حذف جميع البيانات (تبرعات، مشاريع، مستفيدين، إلخ) وإعادة النظام لحالته الأولية الافتراضية.
                                </p>
                                <button className="bg-error-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-error-600 transition-colors" onClick={() => setResetDialog({ open: true, input: '' })}>
                                    إعادة تعيين النظام
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
                <div className="flex flex-col gap-2">
                    <div className="flex justify-end">
                        <button className="bg-primary-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-primary-600 transition-colors inline-flex items-center gap-2" onClick={handleAddUser}>
                            <i className="fa-solid fa-plus" /> {t('admin.settingsPage.addUser')}
                        </button>
                    </div>
                    <AdminDataTable columns={userColumns} data={users} actions={userActions} />
                </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
                <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700">
                    <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                        <h6 className="text-base font-bold">{t('admin.settingsPage.notificationSettings')}</h6>
                    </div>
                    <div>
                        {settingsNotifications.map((n, i) => (
                            <div key={i} className={`flex items-center justify-between p-3 ${i !== settingsNotifications.length - 1 ? 'border-b border-neutral-200 dark:border-neutral-700' : ''}`}>
                                <div>
                                    <p className="font-medium">{n.label}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{n.desc}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" defaultChecked={n.enabled} className="sr-only peer" onChange={() => handleToggleNotification(i)} />
                                    <div className="w-11 h-6 bg-neutral-200 peer-checked:bg-primary-500 rounded-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Integrations */}
            {activeTab === 'integrations' && (
                <div className="grid grid-cols-12 gap-4">
                    {integrations.map((intg, i) => {
                        const sc = statusColorMap[intg.status] || statusColorMap.disconnected;
                        return (
                            <div className="col-span-12 sm:col-span-6 md:col-span-3" key={i}>
                                <div className={`bg-white dark:bg-neutral-800 rounded-lg shadow-card border text-center p-4 ${intg.status === 'connected' ? 'border-success-500' : 'border-neutral-100 dark:border-neutral-700'}`}>
                                    <AdminIconBox icon={intg.icon} color={intg.color} size={50} fontSize={24} />
                                    <p className="font-bold mt-3">{intg.name}</p>
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400 block">{intg.desc}</span>
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium mt-1 ${sc.bg} ${sc.text}`}>
                                        {getStatusLabel(intg.status)}
                                    </span>
                                    <div className="mt-1">
                                        <button
                                            className={`px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
                                                intg.status === 'connected'
                                                    ? 'border border-error-500 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20'
                                                    : 'bg-primary-500 text-white hover:bg-primary-600'
                                            }`}
                                            onClick={() => handleToggleIntegration(i)}
                                        >
                                            {intg.status === 'connected' ? 'قطع الاتصال' : t('admin.settingsPage.connect')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit User Dialog */}
            <AdminFormDialog
                open={isUserModalOpen}
                onClose={() => { setIsUserModalOpen(false); setUserForm(emptyUserForm); }}
                onSubmit={handleSubmitUser}
                title={editUser ? `تعديل: ${editUser.name}` : t('admin.settingsPage.addUser')}
                submitLabel={editUser ? t('admin.programsPage.saveChanges') : t('admin.settingsPage.addUser')}
            >
                <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('admin.settingsPage.name')} required value={userForm.name} onChange={updateUserField('name')} />
                <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder={t('admin.settingsPage.email')} required value={userForm.email} onChange={updateUserField('email')} type="email" />
                {!editUser && (
                    <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="كلمة المرور" required value={userForm.password} onChange={updateUserField('password')} type="password" />
                )}
                {editUser && (
                    <input className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" placeholder="كلمة المرور الجديدة (اختياري)" value={userForm.password} onChange={updateUserField('password')} type="password" />
                )}
                <select className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={userForm.role} onChange={updateUserField('role')}>
                    <option value="ADMIN">مدير النظام</option>
                    <option value="EDITOR">محرر محتوى</option>
                    <option value="RESEARCHER">باحث ميداني</option>
                    <option value="USER">مستخدم عادي</option>
                </select>
                {editUser && (
                    <select className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none" value={userForm.status} onChange={updateUserField('status')}>
                        <option value="ACTIVE">نشط</option>
                        <option value="INACTIVE">غير نشط</option>
                        <option value="PENDING">معلق</option>
                    </select>
                )}
            </AdminFormDialog>

            {/* Reset Data Confirmation Dialog */}
            {resetDialog.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black/50" onClick={() => setResetDialog({ open: false, input: '' })}></div>
                    <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-modal max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto">
                        <h2 className="text-lg font-bold p-4 border-b border-neutral-200 dark:border-neutral-700 text-error-500">تحذير: إعادة تعيين جميع البيانات</h2>
                        <div className="p-4">
                            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                                أنت على وشك حذف جميع السجلات من النظام. لا يمكن التراجع عن هذا الإجراء!
                                الرجاء كتابة <strong style={{ color: 'red' }}>حذف جميع البيانات</strong> للتأكيد.
                            </p>
                            <input
                                className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-error-500 outline-none"
                                autoFocus
                                placeholder="حذف جميع البيانات"
                                value={resetDialog.input}
                                onChange={(e) => setResetDialog(prev => ({ ...prev, input: e.target.value }))}
                            />
                        </div>
                        <div className="flex justify-end gap-2 p-4 border-t border-neutral-200 dark:border-neutral-700">
                            <button onClick={() => setResetDialog({ open: false, input: '' })} className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-md font-semibold transition-colors">إلغاء</button>
                            <button
                                onClick={handleResetAll}
                                className={`px-5 py-2 rounded-md font-semibold transition-colors text-white ${
                                    resetDialog.input !== 'حذف جميع البيانات'
                                        ? 'bg-neutral-400 cursor-not-allowed'
                                        : 'bg-error-500 hover:bg-error-600'
                                }`}
                                disabled={resetDialog.input !== 'حذف جميع البيانات'}
                            >
                                حذف نهائياً
                            </button>
                        </div>
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

export default AdminSettings;
