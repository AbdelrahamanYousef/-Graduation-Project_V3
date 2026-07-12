import { useState } from 'react';
import { useAdminData, adminActions } from '../contexts/AdminDataContext';
import { getLanguage } from '../i18n';
import { createDonation } from '../api';

const loc = (ar, en) => (getLanguage() === 'en' ? (en || ar) : ar);

const WALLETS = [
    { id: 'vodafone', name: 'فودافون كاش', nameEn: 'Vodafone Cash', color: '#e60000', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/vodafone.svg' },
    { id: 'orange', name: 'أورانج كاش', nameEn: 'Orange Cash', color: '#ff6600', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/orange.svg' },
    { id: 'etisalat', name: 'اتصالات كاش', nameEn: 'Etisalat Cash', color: '#00a651', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/etisalat.svg' },
    { id: 'we', name: 'وي كاش', nameEn: 'WE Cash', color: '#7b2d8e', icon: 'fa-solid fa-mobile-screen', logoUrl: '/assets/wallets/we.svg' },
];

function useQuickDonate({ open, onClose, project }) {
    const { dispatch } = useAdminData();

    const [step, setStep] = useState('info');
    const [quantity, setQuantity] = useState(1);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [walletPhone, setWalletPhone] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [errors, setErrors] = useState({});

    const amount = project?.donationAmount || 0;
    const total = amount * quantity;

    const submitDonation = async (paymentMethod) => {
        try {
            const payload = {
                amount: total,
                type: 'GENERAL',
                projectId: project?.id || null,
                paymentMethod: paymentMethod === 'card' ? 'CREDIT_CARD' : paymentMethod === 'wallet' ? 'MOBILE_WALLET' : paymentMethod,
                isAnonymous: !name.trim(),
                fullName: name || undefined,
                phone: phone || undefined,
            };
            await createDonation(payload);
            dispatch(adminActions.addActivity({
                type: 'donation',
                message: `تبرع جديد بقيمة ${total} ج.م لمشروع ${project?.title || 'تبرع عام'}`
            }));
            setStep('success');
        } catch (err) {
            console.error('Donation failed:', err);
            setErrors({ submit: err.message || 'فشلت عملية التبرع' });
        }
    };

    const handleClose = () => {
        setStep('info');
        setQuantity(1);
        setName('');
        setPhone('');
        setSelectedWallet(null);
        setWalletPhone('');
        setCardNumber('');
        setCardExpiry('');
        setCardCvv('');
        setCardHolder('');
        setErrors({});
        onClose();
    };

    const validateInfo = () => {
        const e = {};
        if (!name.trim()) e.name = loc('الاسم مطلوب', 'Name is required');
        if (!phone.trim()) e.phone = loc('رقم الهاتف مطلوب', 'Phone is required');
        else if (!/^01[0-9]{9}$/.test(phone.trim())) e.phone = loc('رقم هاتف غير صحيح', 'Invalid phone number');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateCard = () => {
        const e = {};
        if (!cardHolder.trim()) e.cardHolder = loc('اسم حامل البطاقة مطلوب', 'Cardholder name is required');
        if (!cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) e.cardNumber = loc('رقم بطاقة غير صحيح (16 رقم)', 'Invalid card number (16 digits)');
        if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) e.cardExpiry = loc('تاريخ غير صحيح (MM/YY)', 'Invalid date (MM/YY)');
        if (!cardCvv.match(/^\d{3,4}$/)) e.cardCvv = loc('CVV غير صحيح', 'Invalid CVV');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateWallet = () => {
        const e = {};
        if (!selectedWallet) e.wallet = loc('اختر المحفظة', 'Select a wallet');
        if (!walletPhone.trim()) e.walletPhone = loc('رقم المحفظة مطلوب', 'Wallet number required');
        else if (!/^01[0-9]{9}$/.test(walletPhone.trim())) e.walletPhone = loc('رقم غير صحيح', 'Invalid number');
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const goToMethod = () => { if (validateInfo()) setStep('method'); };
    const goBack = () => { setErrors({}); if (step === 'method') setStep('info'); else if (step === 'card' || step === 'wallet') setStep('method'); };

    const title = project ? loc(project.title, project.titleEn) : '';
    const stepTitles = {
        info: loc('تبرع سريع', 'Quick Donate'),
        method: loc('اختار طريقة الدفع', 'Choose Payment Method'),
        card: loc('بطاقة بنكية', 'Bank Card'),
        wallet: loc('المحفظة الإلكترونية', 'Mobile Wallet'),
        success: loc('تم بنجاح!', 'Success!'),
    };

    return {
        step, setStep, quantity, setQuantity, name, setName, phone, setPhone,
        selectedWallet, setSelectedWallet, walletPhone, setWalletPhone,
        cardNumber, setCardNumber, cardExpiry, setCardExpiry, cardCvv, setCardCvv,
        cardHolder, setCardHolder, errors, setErrors, amount, total,
        submitDonation, handleClose, validateInfo, validateCard, validateWallet,
        goToMethod, goBack, title, stepTitles,
        WALLETS, loc,
    };
}

export default useQuickDonate;
export { WALLETS };
