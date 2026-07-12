import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminData, adminActions } from '../contexts/AdminDataContext';
import { t } from '../i18n';
import { createDonation } from '../api';

function useDonateFlow({ preSelectedAmount, preSelectedProject }) {
    const navigate = useNavigate();
    const { state, dispatch } = useAdminData();
    const projects = state.projects;

    const [step, setStep] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [formData, setFormData] = useState({
        amount: preSelectedAmount || 100,
        customAmount: '',
        donationType: 'sadaqah',
        projectId: preSelectedProject || null,
        isRecurring: false,
        fullName: '',
        email: '',
        phone: '',
        isAnonymous: false,
        paymentMethod: 'card',
    });
    const [errors, setErrors] = useState({});

    const selectedProject = projects.find(p => p.id === formData.projectId);

    const updateForm = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => prev[field] ? { ...prev, [field]: null } : prev);
        if (field === 'customAmount' && value) setMultiplier(1);
    }, []);

    const validateStep = (stepNum) => {
        const newErrors = {};
        if (stepNum === 0) {
            const amount = formData.customAmount || formData.amount;
            if (!amount || amount < 10) {
                newErrors.amount = 'الحد الأدنى للتبرع 10 ج.م';
            }
        }
        if (stepNum === 1) {
            if (!formData.isAnonymous) {
                if (!formData.fullName.trim()) newErrors.fullName = t('validation.required');
                if (!formData.phone.trim()) newErrors.phone = t('validation.required');
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    const prevStep = () => setStep(prev => prev - 1);

    const getTotalAmount = () => {
        if (formData.customAmount) return Number(formData.customAmount);
        return Number(formData.amount) * multiplier;
    };

    const getDonationTypeLabel = (type) => {
        if (!type) return '';
        return type.title || type.label || type.name || t(`donate.${type.id}`) || type.id;
    };

    const handleSubmit = async () => {
        const totalAmount = getTotalAmount();
        try {
            const payload = {
                amount: Number(totalAmount),
                type: formData.donationType,
                projectId: formData.projectId || null,
                paymentMethod: formData.paymentMethod === 'card' ? 'CREDIT_CARD' : formData.paymentMethod === 'wallet' ? 'MOBILE_WALLET' : formData.paymentMethod,
                isAnonymous: formData.isAnonymous,
                fullName: formData.isAnonymous ? undefined : formData.fullName,
                phone: formData.isAnonymous ? undefined : formData.phone,
                email: formData.isAnonymous ? undefined : formData.email || undefined,
            };
            const result = await createDonation(payload);
            dispatch(adminActions.addActivity({
                type: 'donation',
                message: `تبرع جديد بقيمة ${totalAmount} ج.م`
            }));
            navigate('/confirmation?receipt=' + (result.receiptNumber || Date.now()));
        } catch (err) {
            console.error('Donation failed:', err);
            setErrors({ submit: err.message || 'فشلت عملية التبرع' });
        }
    };

    const amounts = [50, 100, 200, 500, 1000, 2000];
    const steps = [
        t('donate.selectAmount') || 'المبلغ',
        t('donate.yourInfo') || 'البيانات',
        t('donate.paymentMethod') || 'الدفع',
    ];

    return {
        step, formData, errors, selectedProject, projects,
        updateForm, nextStep, prevStep, handleSubmit,
        getTotalAmount, getDonationTypeLabel,
        amounts, steps, setErrors,
        multiplier, setMultiplier,
    };
}

export default useDonateFlow;
