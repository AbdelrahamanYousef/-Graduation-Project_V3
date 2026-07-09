import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminData, adminActions } from '../contexts/AdminDataContext';
import { t } from '../i18n';

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

    const handleSubmit = () => {
        const totalAmount = getTotalAmount();
        const newDonation = {
            id: Date.now(),
            donor: formData.isAnonymous ? 'متبرع مجهول' : (formData.fullName || 'متبرع'),
            project: selectedProject?.title || 'تبرع عام',
            amount: Number(totalAmount),
            date: new Date().toISOString().split('T')[0],
            method: formData.paymentMethod,
            status: 'completed',
        };
        dispatch(adminActions.addDonation(newDonation));
        navigate('/confirmation?receipt=' + Date.now());
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
