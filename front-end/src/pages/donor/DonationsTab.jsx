import { formatCurrency, formatDate } from '../../i18n';

export default function DonationsTab({ donations }) {
    if (donations.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card p-12 text-center text-neutral-500 dark:text-neutral-400 flex flex-col items-center justify-center gap-2">
                <div className="text-4xl text-neutral-300 dark:text-neutral-600 mb-2">
                    <i className="fa-solid fa-hand-holding-heart"></i>
                </div>
                <p className="text-base font-medium">{'لا توجد تبرعات حتى الآن'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card overflow-hidden">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="p-3 text-right text-sm font-semibold dark:text-white">{'التاريخ'}</th>
                        <th className="p-3 text-right text-sm font-semibold dark:text-white">{'المشروع'}</th>
                        <th className="p-3 text-right text-sm font-semibold dark:text-white">{'المبلغ'}</th>
                        <th className="p-3 text-right text-sm font-semibold dark:text-white">{'الحالة'}</th>
                        <th className="p-3 text-right text-sm font-semibold dark:text-white">{'الإيصال'}</th>
                    </tr>
                </thead>
                <tbody>
                    {donations.map(donation => (
                        <tr key={donation.id} className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                            <td className="p-3 dark:text-neutral-300">{formatDate(donation.date)}</td>
                            <td className="p-3 dark:text-neutral-300">{donation.project}</td>
                            <td className="p-3 font-bold text-primary-500">{formatCurrency(donation.amount)}</td>
                            <td className="p-3">
                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300">{'مكتمل'}</span>
                            </td>
                            <td className="p-3">
                                <button className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700/50 transition-colors text-neutral-500 dark:text-neutral-400">
                                    <i className="fa-solid fa-file-invoice"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
