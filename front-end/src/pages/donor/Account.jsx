import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { t, formatDate } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';
import { getDonorDonations, getDonorStats } from '../../api';
import OverviewTab from './OverviewTab';
import DonationsTab from './DonationsTab';
import ProfileTab from './ProfileTab';
import SubmissionsTab from './SubmissionsTab';

function Account() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { isDonorLoggedIn, donorUser, donorLogout, updateDonorPhoto } = useAuth();

    const photoInputRef = useRef(null);

    const handlePhotoUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await updateDonorPhoto(file);
    }, [updateDonorPhoto]);
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const tab = searchParams.get('tab');
        return ['overview', 'donations', 'profile', 'submissions'].includes(tab) ? tab : 'overview';
    });

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['overview', 'donations', 'profile', 'submissions'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const [donations, setDonations] = useState([]);
    const [stats, setStats] = useState({ totalDonated: 0, donationsCount: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isDonorLoggedIn) return;

        let isMounted = true;
        async function fetchData() {
            try {
                const [donationsData, statsData] = await Promise.all([
                    getDonorDonations(),
                    getDonorStats()
                ]);
                if (isMounted) {
                    setDonations(donationsData || []);
                    setStats(statsData || { totalDonated: 0, donationsCount: 0 });
                }
            } catch (error) {
                console.error('Error fetching donor data:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        fetchData();
        return () => {
            isMounted = false;
        };
    }, [isDonorLoggedIn]);

    if (!isDonorLoggedIn) {
        return (
            <div className="py-20 min-h-[60vh] flex items-center justify-center">
                <div className="max-w-lg mx-auto px-4 md:px-6 w-full">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card p-8 text-center">
                        <div className="text-neutral-500 dark:text-neutral-400 text-4xl mb-4">
                            <i className="fa-solid fa-lock"></i>
                        </div>
                        <h4 className="text-xl font-bold mb-3 dark:text-white">{'يجب تسجيل الدخول'}</h4>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-6">{'يرجى تسجيل الدخول لعرض حسابك وسجل تبرعاتك'}</p>
                        <Link to="/login" className="inline-block bg-primary-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-primary-600 transition-colors">
                            {t('nav.login')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }



    const user = {
        name: donorUser.name,
        email: donorUser.email,
        phone: donorUser.phone,
        joinDate: donorUser.joinDate || donorUser.loggedInAt,
        totalDonations: stats.totalDonated || 0,
        donationCount: stats.donationsCount || 0,
    };

    const handleLogout = () => {
        donorLogout();
        navigate('/');
    };

    const tabs = [
        { value: 'overview', label: 'نظرة عامة', icon: 'fa-solid fa-chart-pie' },
        { value: 'donations', label: 'تبرعاتي', icon: 'fa-solid fa-hand-holding-heart' },
        { value: 'submissions', label: 'طلباتي', icon: 'fa-solid fa-file-invoice' },
        { value: 'profile', label: 'بياناتي', icon: 'fa-solid fa-user' },
    ];

    const donorInfo = { ...user, photo: donorUser?.photo };

    return (
        <div className="py-12 bg-neutral-50 dark:bg-neutral-900 min-h-[90vh]">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-6 mb-8 p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-card">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div
                                className="w-20 h-20 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-bold overflow-hidden cursor-pointer border-2 border-primary-500"
                                onClick={() => photoInputRef.current?.click()}
                            >
                                {donorUser?.photo ? (
                                    <img src={donorUser.photo} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <i className="fa-solid fa-user"></i>
                                )}
                            </div>
                            <button
                                className="absolute bottom-0 left-[-10px] p-1.5 rounded-md bg-white dark:bg-neutral-700 shadow hover:bg-white dark:hover:bg-neutral-700 transition-colors"
                                onClick={() => photoInputRef.current?.click()}
                            >
                                <i className="fa-solid fa-camera text-xs"></i>
                            </button>
                            <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />
                        </div>
                        <div>
                            <h5 className="text-lg font-bold dark:text-white">{'أهلاً'}، {user.name}</h5>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{'عضو منذ'} {formatDate(user.joinDate)}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="border border-error-500 text-error-500 px-4 py-1.5 rounded-md font-semibold hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors text-sm">
                        <i className="fa-solid fa-right-from-bracket ml-1"></i>
                        {'تسجيل الخروج'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
                    <div className="flex gap-0">
                        {tabs.map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.value
                                        ? 'border-primary-500 text-primary-500'
                                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                                }`}
                            >
                                <i className={tab.icon}></i>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div>
                    {loading ? (
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card p-12 text-center text-neutral-500 dark:text-neutral-400 flex flex-col items-center justify-center gap-2">
                            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-primary-500"></i>
                            <p className="text-sm">{'جاري تحميل البيانات...'}</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && <OverviewTab user={user} donations={donations} />}
                            {activeTab === 'donations' && <DonationsTab donations={donations} />}
                            {activeTab === 'submissions' && <SubmissionsTab isDark={isDark} />}
                            {activeTab === 'profile' && <ProfileTab isDark={isDark} donorInfo={donorInfo} updateDonorPhoto={updateDonorPhoto} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Account;
