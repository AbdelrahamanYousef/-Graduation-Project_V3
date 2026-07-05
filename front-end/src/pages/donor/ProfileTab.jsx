import { useRef, useState } from 'react';
import { t } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { updateDonorProfile, changePassword, updateNotificationSettings } from '../../api';

export default function ProfileTab({ donorInfo, updateDonorPhoto }) {
    const profilePhotoRef = useRef(null);
    const { updateDonorUser } = useAuth();

    const [name, setName] = useState(donorInfo?.name || '');
    const [email, setEmail] = useState(donorInfo?.email || '');
    const [phone, setPhone] = useState(donorInfo?.phone || '');
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Password state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [pwSaving, setPwSaving] = useState(false);
    const [pwError, setPwError] = useState(null);
    const [pwSuccess, setPwSuccess] = useState(null);

    // Notification state
    const [emailNotifications, setEmailNotifications] = useState(donorInfo?.emailNotifications ?? true);
    const [notifSaving, setNotifSaving] = useState(false);
    const [notifError, setNotifError] = useState(null);
    const [notifSuccess, setNotifSuccess] = useState(null);

    const handleProfilePhoto = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await updateDonorPhoto(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);
        try {
            await updateDonorProfile({ name, email, phone });
            updateDonorUser({ name, email, phone });
            setSuccessMsg('تم حفظ التغييرات بنجاح');
        } catch (err) {
            console.error('Failed to update profile:', err);
            console.log('API error response:', err.response?.data || err);
            setErrorMsg(err.message || 'فشل حفظ التغييرات');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPwError(null);
        setPwSuccess(null);

        if (newPassword !== confirmPassword) {
            setPwError('كلمتا المرور الجديدتان غير متطابقتين');
            return;
        }

        setPwSaving(true);
        try {
            await changePassword({ oldPassword, newPassword });
            setPwSuccess('تم تغيير كلمة المرور بنجاح');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordForm(false);
        } catch (err) {
            console.error('Failed to change password:', err);
            setPwError(err.message || 'فشل تغيير كلمة المرور');
        } finally {
            setPwSaving(false);
        }
    };

    const handleNotificationToggle = async (e) => {
        const newValue = e.target.checked;
        setEmailNotifications(newValue);
        setNotifError(null);
        setNotifSuccess(null);
        setNotifSaving(true);

        try {
            await updateNotificationSettings({ emailNotifications: newValue });
            updateDonorUser({ emailNotifications: newValue });
            setNotifSuccess('تم حفظ التغييرات بنجاح');
        } catch (err) {
            console.error('Failed to update notifications:', err);
            setEmailNotifications(!newValue);
            setNotifError(err.message || 'فشل حفظ التغييرات');
        } finally {
            setNotifSaving(false);
        }
    };


    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            {/* Profile Avatar Card */}
            <div className="bg-white dark:bg-neutral-100 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-100 overflow-hidden">
                <div className="p-6 flex flex-col items-center py-8">
                    <div className="relative mb-6">
                        <div
                            className="w-28 h-28 rounded-full bg-primary-500 text-white flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => profilePhotoRef.current?.click()}
                        >
                            {donorInfo?.photo ? (
                                <img src={donorInfo.photo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <i className="fa-solid fa-user text-4xl"></i>
                            )}
                        </div>
                        <button
                            className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-neutral-200 shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-300 text-neutral-600 dark:text-neutral-900 transition-colors border border-neutral-100 dark:border-neutral-200"
                            onClick={() => profilePhotoRef.current?.click()}
                        >
                            <i className="fa-solid fa-camera text-sm"></i>
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => profilePhotoRef.current?.click()} className="border border-primary-500 text-primary-500 px-5 py-2 rounded-xl font-bold hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-xs text-center">
                            {t('account.changePhoto')}
                        </button>
                        {donorInfo?.photo && (
                            <button onClick={() => updateDonorPhoto(null)} className="border border-error-500 text-error-500 px-5 py-2 rounded-xl font-bold hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors text-xs text-center">
                                {t('account.removePhoto')}
                            </button>
                        )}
                    </div>
                    <input
                        ref={profilePhotoRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhoto}
                    />
                </div>
            </div>

            {/* Account Info Form */}
            <div className="bg-white dark:bg-neutral-100 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-100 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h6 className="text-base font-bold mb-4 dark:text-white">{'معلومات الحساب'}</h6>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">الاسم الكامل</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-300 rounded-xl bg-neutral-50 dark:bg-neutral-200 text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                placeholder="الاسم الكامل"
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-300 rounded-xl bg-neutral-50 dark:bg-neutral-200 text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                placeholder="البريد الإلكتروني"
                                required
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">رقم الهاتف</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-300 rounded-xl bg-neutral-50 dark:bg-neutral-200 text-neutral-900 dark:text-white focus:bg-white dark:focus:bg-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm"
                                placeholder="رقم الهاتف"
                                required
                                disabled={isSaving}
                            />
                        </div>
                        {successMsg && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{successMsg}</p>
                        )}
                        {errorMsg && (
                            <p className="text-sm text-error-500 font-semibold">{errorMsg}</p>
                        )}
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="self-start bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 text-sm shadow-sm hover:shadow-md"
                        >
                            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Account Settings Form */}
            <div className="bg-white dark:bg-neutral-100 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-100 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h6 className="text-base font-bold mb-4 dark:text-white">{'إعدادات الحساب'}</h6>
                    <div className="flex flex-col gap-5 mt-2">
                        {/* Change Password Block */}
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <p className="font-semibold text-sm dark:text-white">{'تغيير كلمة المرور'}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-600 mt-0.5">{'قم بتحديث كلمة المرور الخاصة بك'}</p>
                                </div>
                                <button 
                                    onClick={() => setShowPasswordForm(!showPasswordForm)} 
                                    className="border border-primary-500 text-primary-500 px-4 py-1.5 rounded-xl font-bold hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-xs"
                                >
                                    {showPasswordForm ? 'إلغاء' : 'تغيير'}
                                </button>
                            </div>
                            
                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-50 p-5 rounded-xl mt-2 border border-neutral-100 dark:border-neutral-100 animate-slideDown">
                                    <input
                                        type="password"
                                        placeholder="كلمة المرور الحالية"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-200 rounded-xl bg-white dark:bg-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                                        required
                                        disabled={pwSaving}
                                    />
                                    <input
                                        type="password"
                                        placeholder="كلمة المرور الجديدة"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-200 rounded-xl bg-white dark:bg-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                                        required
                                        disabled={pwSaving}
                                    />
                                    <input
                                        type="password"
                                        placeholder="تأكيد كلمة المرور الجديدة"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-200 rounded-xl bg-white dark:bg-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                                        required
                                        disabled={pwSaving}
                                    />
                                    {pwError && <p className="text-xs text-error-500 font-semibold">{pwError}</p>}
                                    {pwSuccess && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{pwSuccess}</p>}
                                    <button 
                                        type="submit" 
                                        disabled={pwSaving}
                                        className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-5 rounded-xl font-bold text-xs self-start transition-colors disabled:opacity-50"
                                    >
                                        {pwSaving ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
                                    </button>
                                </form>
                            )}
                            {pwSuccess && !showPasswordForm && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{pwSuccess}</p>}
                            {pwError && !showPasswordForm && <p className="text-xs text-error-500 font-semibold">{pwError}</p>}
                        </div>

                        <hr className="border-t border-neutral-200 dark:border-neutral-200" />
                        
                        {/* Email Notifications Block */}
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div>
                                    <p className="font-semibold text-sm dark:text-white">{'إشعارات البريد'}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-600 mt-0.5">{'تلقي إشعارات التحديثات والتبرعات عبر البريد'}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={emailNotifications} 
                                        onChange={handleNotificationToggle}
                                        disabled={notifSaving}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-200 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-200 peer-checked:bg-primary-500"></div>
                                </label>
                            </div>
                            {notifError && <p className="text-xs text-error-500 font-semibold">{notifError}</p>}
                            {notifSuccess && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{notifSuccess}</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
