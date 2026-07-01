import { useRef, useState } from 'react';
import { t } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { updateDonorProfile, changePassword, updateNotificationSettings } from '../../api';

export default function ProfileTab({ isDark, donorInfo, updateDonorPhoto }) {
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
        <div className="flex flex-col gap-6 max-w-md">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                <div className="p-4 flex flex-col items-center py-8">
                    <div className="relative mb-4">
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
                            className="absolute bottom-0 right-0 p-2 rounded-md bg-white dark:bg-neutral-700 shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors"
                            onClick={() => profilePhotoRef.current?.click()}
                        >
                            <i className="fa-solid fa-camera"></i>
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => profilePhotoRef.current?.click()} className="border border-primary-500 text-primary-500 px-4 py-1.5 rounded-md font-semibold hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-sm">
                            {t('account.changePhoto')}
                        </button>
                        {donorInfo?.photo && (
                            <button onClick={() => updateDonorPhoto(null)} className="border border-error-500 text-error-500 px-4 py-1.5 rounded-md font-semibold hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors text-sm">
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

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                <div className="p-4">
                    <h6 className="text-base font-bold mb-3 dark:text-white">{'معلومات الحساب'}</h6>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                        <input
                            label={'الاسم الكامل'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                            placeholder="الاسم الكامل"
                            required
                            disabled={isSaving}
                        />
                        <input
                            label={'البريد الإلكتروني'}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                            placeholder="البريد الإلكتروني"
                            required
                            disabled={isSaving}
                        />
                        <input
                            label={'رقم الهاتف'}
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 outline-none dark:text-white"
                            placeholder="رقم الهاتف"
                            required
                            disabled={isSaving}
                        />
                        {successMsg && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">{successMsg}</p>
                        )}
                        {errorMsg && (
                            <p className="text-sm text-error-500 font-semibold">{errorMsg}</p>
                        )}
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="self-start bg-primary-500 text-white px-5 py-2 rounded-md font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                <div className="p-4">
                    <h6 className="text-base font-bold mb-3 dark:text-white">{'إعدادات الحساب'}</h6>
                    <div className="flex flex-col gap-4 mt-3">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium dark:text-white">{'تغيير كلمة المرور'}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{'قم بتحديث كلمة المرور الخاصة بك'}</p>
                                </div>
                                <button 
                                    onClick={() => setShowPasswordForm(!showPasswordForm)} 
                                    className="border border-primary-500 text-primary-500 px-4 py-1.5 rounded-md font-semibold hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-sm"
                                >
                                    {showPasswordForm ? 'إلغاء' : 'تغيير'}
                                </button>
                            </div>
                            
                            {showPasswordForm && (
                                <form onSubmit={handlePasswordChange} className="flex flex-col gap-3 bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg mt-2 border border-neutral-100 dark:border-neutral-800">
                                    <input
                                        type="password"
                                        placeholder="كلمة المرور الحالية"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-transparent text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                        disabled={pwSaving}
                                    />
                                    <input
                                        type="password"
                                        placeholder="كلمة المرور الجديدة"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-transparent text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                        disabled={pwSaving}
                                    />
                                    <input
                                        type="password"
                                        placeholder="تأكيد كلمة المرور الجديدة"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-transparent text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                        disabled={pwSaving}
                                    />
                                    {pwError && <p className="text-xs text-error-500 font-semibold">{pwError}</p>}
                                    {pwSuccess && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{pwSuccess}</p>}
                                    <button 
                                        type="submit" 
                                        disabled={pwSaving}
                                        className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-5 rounded-md font-semibold text-sm self-start transition-colors disabled:opacity-50"
                                    >
                                        {pwSaving ? 'جاري الحفظ...' : 'حفظ كلمة المرور'}
                                    </button>
                                </form>
                            )}
                            {pwSuccess && !showPasswordForm && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">{pwSuccess}</p>}
                            {pwError && !showPasswordForm && <p className="text-xs text-error-500 font-semibold">{pwError}</p>}
                        </div>

                        <hr className="border-t border-neutral-200 dark:border-neutral-700" />
                        
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium dark:text-white">{'إشعارات البريد'}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{'تلقي إشعارات التحديثات والتبرعات عبر البريد'}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={emailNotifications} 
                                        onChange={handleNotificationToggle}
                                        disabled={notifSaving}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-primary-500"></div>
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
