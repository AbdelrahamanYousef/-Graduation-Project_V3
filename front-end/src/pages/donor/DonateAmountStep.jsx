import { t, formatCurrency } from '../../i18n';

function DonateAmountStep({ formData, updateForm, amounts, donationTypes, projects, errors, getDonationTypeLabel, onNext, multiplier, setMultiplier }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h6 className="font-bold mb-3">{t('donate.selectAmount')}</h6>
                <div className="grid grid-cols-12 gap-2">
                    {amounts.map(amount => (
                        <div className="col-span-4 sm:col-span-4" key={amount}>
                            <button
                                className={`w-full h-14 text-lg border rounded-lg font-semibold transition-colors ${
                                    formData.amount === amount && !formData.customAmount
                                        ? 'bg-primary-500/10 border-primary-500 text-primary-500 font-bold'
                                        : 'border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                                }`}
                                onClick={() => { updateForm('amount', amount); updateForm('customAmount', ''); }}
                            >
                                {formatCurrency(amount, 'USD').replace('$', '')}
                            </button>
                        </div>
                    ))}
                </div>
                {!formData.customAmount && (
                    <div className="mt-3">
                        <div className="flex gap-1.5">
                            {[1, 2, 3, 5, 10].map(m => (
                                <button key={m} type="button" onClick={() => setMultiplier(m)}
                                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-colors ${multiplier === m ? 'bg-primary-500 text-white border-primary-500' : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400'}`}
                                >
                                    ×{m}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-center">المجموع: {(Number(formData.amount) * multiplier).toLocaleString()} ج.م</p>
                    </div>
                )}
                <div className="relative mt-3">
                    <input
                        placeholder={t('donate.customAmount')}
                        type="number"
                        value={formData.customAmount}
                        onChange={(e) => updateForm('customAmount', e.target.value)}
                        className="w-full px-3 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-transparent focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                    />
                    <span className="absolute top-1/2 -translate-y-1/2 left-3 text-neutral-500 dark:text-neutral-400 text-sm">ج.م</span>
                </div>
                {errors.amount && <p className="text-error-500 text-sm mt-1">{errors.amount}</p>}
            </div>

            <div>
                <h6 className="font-bold mb-3">{t('donate.donationType')}</h6>
                <div className="flex flex-col sm:flex-row gap-2">
                    {donationTypes.map(type => (
                        <button
                            key={type.id}
                            className={`w-full text-right px-4 py-3 border rounded-lg font-medium transition-colors ${
                                formData.donationType === type.id
                                    ? 'bg-primary-500/5 border-primary-500 text-primary-500'
                                    : 'border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                            }`}
                            onClick={() => updateForm('donationType', type.id)}
                        >
                            {getDonationTypeLabel(type)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h6 className="font-bold mb-3">{t('donate.selectProject')}</h6>
                <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 sm:col-span-6">
                        <button
                            className={`w-full text-right px-4 py-3 border rounded-lg font-medium transition-colors ${
                                !formData.projectId
                                    ? 'bg-primary-500/5 border-primary-500 text-primary-500'
                                    : 'border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                            }`}
                            onClick={() => updateForm('projectId', null)}
                        >
                            {t('donate.generalDonation')}
                        </button>
                    </div>
                    {projects.slice(0, 4).map(project => (
                        <div className="col-span-12 sm:col-span-6" key={project.id}>
                            <button
                                className={`w-full text-right px-4 py-3 border rounded-lg font-medium transition-colors ${
                                    formData.projectId === project.id
                                        ? 'bg-primary-500/5 border-primary-500 text-primary-500'
                                        : 'border-neutral-200 dark:border-neutral-600 text-neutral-500 dark:text-neutral-400 hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                                }`}
                                onClick={() => updateForm('projectId', project.id)}
                            >
                                {project.title}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => updateForm('isRecurring', e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm">{t('donate.monthly')}</span>
                </label>
            </div>

            <button className="px-5 py-2.5 rounded-lg font-semibold transition-colors cursor-pointer bg-primary-500 text-white hover:bg-primary-600" onClick={onNext}>
                {t('common.next')}
            </button>
        </div>
    );
}

export default DonateAmountStep;
