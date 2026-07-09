import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { paths } from '../../constants/paths';
import { donationTypes, paymentMethods } from '../../data/mockData';
import useDonateFlow from '../../hooks/useDonateFlow';
import DonateStepIndicator from './DonateStepIndicator';
import DonateAmountStep from './DonateAmountStep';
import DonateInfoStep from './DonateInfoStep';
import DonatePaymentStep from './DonatePaymentStep';
import DonateOrderSummary from './DonateOrderSummary';

function Donate() {
    const { isDark } = useTheme();
    const { isDonorLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const preSelectedAmount = parseInt(searchParams.get('amount')) || null;
    const preSelectedProject = searchParams.get('project') || null;

    const {
        step, formData, errors, selectedProject, projects,
        updateForm, nextStep, prevStep, handleSubmit,
        getTotalAmount, getDonationTypeLabel,
        amounts, steps,
        multiplier, setMultiplier,
    } = useDonateFlow({ preSelectedAmount, preSelectedProject });

    if (!isDonorLoggedIn) {
        return (
            <div className="py-12 px-4 max-w-[600px] mx-auto" dir="rtl">
                <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 text-center my-8 font-sans">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                        <i className="fa-solid fa-lock text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mb-3">تسجيل الدخول مطلوب</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                        يرجى تسجيل الدخول لتتمكن من إإتمام عملية التبرع ومتابعة سجل عطائك.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate(paths.auth.login, { state: { from: location.pathname + location.search } })}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        تسجيل الدخول الآن
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 md:col-span-8">
                        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-card p-4 md:p-8">
                            <DonateStepIndicator steps={steps} step={step} />

                            {step === 0 && (
                                <DonateAmountStep
                                    formData={formData}
                                    updateForm={updateForm}
                                    amounts={amounts}
                                    donationTypes={donationTypes}
                                    projects={projects}
                                    errors={errors}
                                    getDonationTypeLabel={getDonationTypeLabel}
                                    onNext={nextStep}
                                    multiplier={multiplier}
                                    setMultiplier={setMultiplier}
                                />
                            )}

                            {step === 1 && (
                                <DonateInfoStep
                                    formData={formData}
                                    updateForm={updateForm}
                                    errors={errors}
                                    onNext={nextStep}
                                    onBack={prevStep}
                                />
                            )}

                            {step === 2 && (
                                <DonatePaymentStep
                                    formData={formData}
                                    updateForm={updateForm}
                                    paymentMethods={paymentMethods}
                                    onSubmit={handleSubmit}
                                    onBack={prevStep}
                                />
                            )}
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <DonateOrderSummary
                            formData={formData}
                            selectedProject={selectedProject}
                            getTotalAmount={getTotalAmount}
                            getDonationTypeLabel={getDonationTypeLabel}
                            donationTypes={donationTypes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Donate;
