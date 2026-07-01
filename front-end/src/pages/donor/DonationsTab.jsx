import { formatCurrency, formatDate } from '../../i18n';

export default function DonationsTab({ donations }) {
    if (donations.length === 0) {
        return (
            <div className="bg-white dark:bg-neutral-100 rounded-2xl shadow-md p-8 md:p-12 text-center text-neutral-500 dark:text-neutral-600 flex flex-col items-center justify-center gap-3 border border-neutral-100 dark:border-neutral-100">
                <div className="text-4xl text-neutral-300 dark:text-neutral-400 mb-2">
                    <i className="fa-solid fa-hand-holding-heart"></i>
                </div>
                <p className="text-base font-bold">{'لا توجد تبرعات حتى الآن'}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-100 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-200 bg-neutral-50/50 dark:bg-neutral-50/10">
                            <th className="p-4 text-right text-sm font-bold dark:text-white">{'التاريخ'}</th>
                            <th className="p-4 text-right text-sm font-bold dark:text-white">{'المشروع'}</th>
                            <th className="p-4 text-right text-sm font-bold dark:text-white">{'المبلغ'}</th>
                            <th className="p-4 text-right text-sm font-bold dark:text-white">{'الحالة'}</th>
                            <th className="p-4 text-right text-sm font-bold dark:text-white">{'الإيصال'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {donations.map(donation => (
                            <tr key={donation.id} className="border-b border-neutral-100 dark:border-neutral-100 hover:bg-neutral-50/30 dark:hover:bg-neutral-200/10 transition-colors last:border-b-0">
                                <td className="p-4 text-sm text-neutral-600 dark:text-neutral-300">{formatDate(donation.date)}</td>
                                <td className="p-4 text-sm font-medium text-neutral-800 dark:text-neutral-200">{donation.project}</td>
                                <td className="p-4 text-sm font-bold text-primary-500">{formatCurrency(donation.amount)}</td>
                                <td className="p-4">
                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-success-50 dark:bg-success-50/20 text-success-600 dark:text-success-500 border border-success-100 dark:border-success-500/20">{'مكتمل'}</span>
                                </td>
                                <td className="p-4">
                                    <button className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-200/50 transition-colors text-neutral-500 dark:text-neutral-400">
                                        <i className="fa-solid fa-file-invoice"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
