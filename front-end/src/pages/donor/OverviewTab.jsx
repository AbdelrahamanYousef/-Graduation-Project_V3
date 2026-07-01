import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../i18n';

export default function OverviewTab({ user, donations }) {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 relative overflow-hidden flex flex-col items-center justify-center text-center p-6 h-full">
                        <div className="h-1 w-full absolute top-0 left-0 bg-primary-500"></div>
                        <div className="text-primary-500 text-3xl mb-4"><i className="fa-solid fa-coins"></i></div>
                        <h4 className="text-2xl font-bold mb-2 dark:text-white">{formatCurrency(user.totalDonations)}</h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{'إجمالي تبرعاتك'}</p>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 relative overflow-hidden flex flex-col items-center justify-center text-center p-6 h-full">
                        <div className="h-1 w-full absolute top-0 left-0 bg-secondary-500"></div>
                        <div className="text-secondary-500 text-3xl mb-4"><i className="fa-solid fa-gift"></i></div>
                        <h4 className="text-2xl font-bold mb-2 dark:text-white">{user.donationCount}</h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{'عدد التبرعات'}</p>
                    </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 relative overflow-hidden flex flex-col items-center justify-center text-center p-6 h-full">
                        <div className="h-1 w-full absolute top-0 left-0 bg-success-500"></div>
                        <div className="text-success-500 text-3xl mb-4"><i className="fa-solid fa-chart-pie"></i></div>
                        <h4 className="text-2xl font-bold mb-2 dark:text-white">
                            {user.donationCount > 0 ? formatCurrency(Math.round(user.totalDonations / user.donationCount)) : formatCurrency(0)}
                        </h4>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{'متوسط التبرع'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 overflow-hidden">
                <div className="p-4">
                    <h6 className="text-base font-bold mb-3 dark:text-white">{'آخر التبرعات'}</h6>
                    <hr className="border-t border-neutral-200 dark:border-neutral-700 mb-3" />
                    <div className="flex flex-col gap-3">
                        {donations.length === 0 ? (
                            <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                                <p className="text-sm">{'لا توجد تبرعات حتى الآن'}</p>
                            </div>
                        ) : (
                            donations.slice(0, 3).map(donation => (
                                <div key={donation.id} className="flex justify-between items-center py-2 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-sm font-bold overflow-hidden">
                                            <i className="fa-solid fa-hand-holding-heart"></i>
                                        </div>
                                        <span className="font-medium dark:text-white">{donation.project}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary-500">{formatCurrency(donation.amount)}</p>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(donation.date)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div>
                <h6 className="text-base font-bold mb-3 dark:text-white">{'إجراءات سريعة'}</h6>
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-4">
                        <Link to="/donate" className="block bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 p-8 text-center cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all h-full flex flex-col items-center justify-center">
                            <div className="text-3xl text-primary-500 mb-3"><i className="fa-solid fa-credit-card"></i></div>
                            <span className="font-bold dark:text-white">{'تبرع الآن'}</span>
                        </Link>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <Link to="/projects" className="block bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 p-8 text-center cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all h-full flex flex-col items-center justify-center">
                            <div className="text-3xl text-secondary-500 mb-3"><i className="fa-solid fa-folder-open"></i></div>
                            <span className="font-bold dark:text-white">{'تصفح المشاريع'}</span>
                        </Link>
                    </div>
                    <div className="col-span-12 md:col-span-4">
                        <Link to="/transparency" className="block bg-white dark:bg-neutral-800 rounded-lg shadow-card border border-neutral-100 dark:border-neutral-700 p-8 text-center cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all h-full flex flex-col items-center justify-center">
                            <div className="text-3xl text-info-500 mb-3"><i className="fa-solid fa-file-lines"></i></div>
                            <span className="font-bold dark:text-white">{'تقارير الشفافية'}</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
