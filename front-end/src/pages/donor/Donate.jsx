import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { paths } from '../../constants/paths';
import {
    initiateDonation,
    verifyDonation,
    getProjectById,
    getCampaignById,
    getProjects,
    getCampaigns
} from '../../api';
import { formatCurrency } from '../../i18n';
import { HeroBanner } from '../../components/common';

function Donate() {
    const { isDonorLoggedIn, donorUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    
    const projectId = searchParams.get('project');
    const campaignId = searchParams.get('campaign');

    // Page states
    const [target, setTarget] = useState(null);
    const [projectsList, setProjectsList] = useState([]);
    const [campaignsList, setCampaignsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // 1: Amount, 2: Payment, 3: Review, 4: Success
    
    // Donation target type: 'general', 'project', 'campaign'
    const [targetType, setTargetType] = useState('general');
    const [selectedTargetId, setSelectedTargetId] = useState('');

    // Form fields
    const [amount, setAmount] = useState(100);
    const [shares, setShares] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
    const [walletPhone, setWalletPhone] = useState('');
    const [collectionAddress, setCollectionAddress] = useState('');
    
    // OTP Modal states
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState(null);
    const [otpLoading, setOtpLoading] = useState(false);
    const [timer, setTimer] = useState(300); // 5 minutes
    
    // Result states
    const [donationResult, setDonationResult] = useState(null);
    const [fawryCode, setFawryCode] = useState(null);
    
    // Preset amounts for flexible config
    const presetAmounts = [50, 100, 250, 500, 1000, 2500];

    // Fetch lists and target on load
    useEffect(() => {
        let isMounted = true;
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch dynamic suggestions (projects and campaigns)
                const [projectsRes, campaignsRes] = await Promise.all([
                    getProjects({ limit: 100, status: 'active' }),
                    getCampaigns()
                ]);

                const activeProjects = projectsRes?.data || [];
                const activeCampaigns = campaignsRes || [];

                if (isMounted) {
                    setProjectsList(activeProjects);
                    setCampaignsList(activeCampaigns);
                }

                let fetchedTarget = null;
                if (projectId) {
                    fetchedTarget = await getProjectById(projectId);
                    if (isMounted) {
                        setTargetType('project');
                        setSelectedTargetId(`project:${projectId}`);
                    }
                } else if (campaignId) {
                    fetchedTarget = await getCampaignById(campaignId);
                    if (isMounted) {
                        setTargetType('campaign');
                        setSelectedTargetId(`campaign:${campaignId}`);
                    }
                } else {
                    // Default to virtual General Donation
                    if (isMounted) {
                        setTargetType('general');
                        setSelectedTargetId('general');
                    }
                    const firstProj = activeProjects[0];
                    fetchedTarget = {
                        id: firstProj?.id || null, // fallback behind the scenes
                        title: 'تبرع عام لدعم أنشطة الجمعية',
                        description: 'توجيه مساهمتك لدعم المشاريع والأنشطة الأكثر احتياجاً وإلحاحاً لدى الجمعية بشكل عام.',
                        amountConfig: 'FLEXIBLE',
                        imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
                        goal: 1000000,
                        raised: 450000,
                        donorsCount: 650
                    };
                }

                if (isMounted) {
                    if (fetchedTarget) {
                        setTarget(fetchedTarget);
                        const initialUrlAmount = searchParams.get('amount');
                        if (fetchedTarget.amountConfig === 'FIXED_SHARES') {
                            const price = Number(fetchedTarget.sharePrice) || 50;
                            const urlAmt = Number(initialUrlAmount);
                            if (urlAmt > 0 && price > 0) {
                                setShares(Math.max(1, Math.round(urlAmt / price)));
                            } else {
                                setShares(1);
                            }
                            setAmount(price);
                        } else {
                            const urlAmt = Number(initialUrlAmount);
                            if (urlAmt >= 10) {
                                setAmount(urlAmt);
                            } else {
                                setAmount(100);
                            }
                        }
                    } else {
                        setError('لم يتم العثور على هدف التبرع المحدد.');
                    }
                }
            } catch (err) {
                console.error('Error loading donation data:', err);
                if (isMounted) {
                    setError('حدث خطأ أثناء تحميل تفاصيل التبرع. يرجى المحاولة مرة أخرى.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        
        loadData();
        return () => {
            isMounted = false;
        };
    }, [projectId, campaignId]);

    // Handle target selection change
    const handleTargetChange = (value) => {
        setSelectedTargetId(value);
        if (value === 'general') {
            setTargetType('general');
            const firstProj = projectsList[0];
            setTarget({
                id: firstProj?.id || null,
                title: 'تبرع عام لدعم أنشطة الجمعية',
                description: 'توجيه مساهمتك لدعم المشاريع والأنشطة الأكثر احتياجاً وإلحاحاً لدى الجمعية بشكل عام.',
                amountConfig: 'FLEXIBLE',
                imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop',
                goal: 1000000,
                raised: 450000,
                donorsCount: 650
            });
            setAmount(100);
        } else {
            const [type, id] = value.split(':');
            if (type === 'project') {
                setTargetType('project');
                const selectedProj = projectsList.find(p => p.id === id);
                if (selectedProj) {
                    setTarget(selectedProj);
                    if (selectedProj.amountConfig === 'FIXED_SHARES') {
                        const price = Number(selectedProj.sharePrice) || 50;
                        setAmount(price);
                        setShares(1);
                    } else {
                        setAmount(100);
                    }
                }
            } else if (type === 'campaign') {
                setTargetType('campaign');
                const selectedCamp = campaignsList.find(c => c.id === id);
                if (selectedCamp) {
                    setTarget(selectedCamp);
                    if (selectedCamp.amountConfig === 'FIXED_SHARES') {
                        const price = Number(selectedCamp.sharePrice) || 50;
                        setAmount(price);
                        setShares(1);
                    } else {
                        setAmount(100);
                    }
                }
            }
        }
    };

    // OTP Timer countdown
    useEffect(() => {
        let interval = null;
        if (showOtpModal && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setOtpError('انتهت صلاحية رمز التحقق. يرجى إعادة الإرسال.');
        }
        return () => clearInterval(interval);
    }, [showOtpModal, timer]);

    if (!isDonorLoggedIn) {
        return (
            <div className="py-12 px-4 max-w-[600px] mx-auto" dir="rtl">
                <div className="bg-card-bg rounded-2xl shadow-sm border border-card-border p-8 text-center my-8 font-sans">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/30 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-500">
                        <i className="fa-solid fa-lock text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-3">تسجيل الدخول مطلوب</h3>
                    <p className="text-muted mb-8 leading-relaxed text-sm">
                        يرجى تسجيل الدخول لتتمكن من إتمام عملية التبرع ومتابعة سجل عطائك.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate(paths.auth.login, { state: { from: location.pathname + location.search } })}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 text-sm"
                    >
                        تسجيل الدخول الآن
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-page-bg" dir="rtl">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-muted font-semibold text-sm">جاري تحميل البيانات...</p>
            </div>
        );
    }

    if (error || !target) {
        return (
            <div className="text-center py-16 min-h-[60vh] flex flex-col items-center justify-center bg-page-bg" dir="rtl">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-error-50 dark:bg-error-950/20 flex items-center justify-center text-error-500">
                    <i className="fa-solid fa-triangle-exclamation text-3xl" />
                </div>
                <h5 className="text-xl font-bold mb-2 text-neutral-900">
                    {error || 'الهدف غير موجود'}
                </h5>
                <Link 
                    to={paths.home} 
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all duration-300 text-sm"
                >
                    العودة للرئيسية
                </Link>
            </div>
        );
    }

    const calculatedAmount = target.amountConfig === 'FIXED_SHARES'
        ? shares * (Number(target.sharePrice) || 0)
        : Number(amount);

    const goal = Number(target.goal) || 0;
    const raised = Number(target.raised) || 0;
    const progressPct = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

    const handleInitiate = async () => {
        if (calculatedAmount < 10) {
            alert('الحد الأدنى للتبرع هو 10 ج.م');
            return;
        }

        if (paymentMethod === 'E_WALLET' && !/^01[0-9]{9}$/.test(walletPhone)) {
            alert('يرجى إدخال رقم محفظة إلكترونية صحيح مكون من 11 رقماً ويبدأ بـ 01');
            return;
        }

        if (paymentMethod === 'CASH_COLLECTION' && !collectionAddress.trim()) {
            alert('يرجى إدخال عنوان تحصيل نقدي صحيح');
            return;
        }

        try {
            setOtpLoading(true);
            const isCampaign = targetType === 'campaign';
            const reqData = {
                amount: calculatedAmount,
                projectId: isCampaign ? null : target.id,
                campaignId: isCampaign ? target.id : null,
                paymentMethod,
                collectionAddress: paymentMethod === 'CASH_COLLECTION' ? collectionAddress : null,
                walletPhone: paymentMethod === 'E_WALLET' ? walletPhone : null
            };
            
            const res = await initiateDonation(reqData);
            if (res.success) {
                setFawryCode(res.fawryCode);
                setTimer(300);
                setOtpCode('');
                setOtpError(null);
                setShowOtpModal(true);
            }
        } catch (err) {
            console.error('Donation initiation failed:', err);
            alert(err.response?.data?.error?.message || 'فشلت عملية تهيئة التبرع. يرجى المحاولة لاحقاً.');
        } finally {
            setOtpLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otpCode || otpCode.length !== 6) {
            setOtpError('يرجى إدخال كود تحقق مكون من 6 أرقام');
            return;
        }

        try {
            setOtpLoading(true);
            setOtpError(null);
            
            const res = await verifyDonation({ otpCode });
            setDonationResult(res);
            setShowOtpModal(false);
            setStep(4); // Advance to Success Screen
        } catch (err) {
            console.error('OTP verification failed:', err);
            setOtpError(err.response?.data?.error?.message || 'رمز التحقق غير صحيح أو منتهي الصلاحية');
        } finally {
            setOtpLoading(false);
        }
    };

    const formatTimer = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // Determine grid columns: centered full-width on Step 4 (Success), side-by-side on other steps
    const isSuccessStep = step === 4;

    return (
        <div className="min-h-screen bg-page-bg pb-16 font-sans text-neutral-900" dir="rtl">
            <HeroBanner 
                themeVariant={campaignId || targetType === 'campaign' ? "campaigns" : "programs"}
                badgeText="بوابة التبرعات الأمنة"
                headline="ساهم بصدقة"
                highlightedWord="جارية"
                subtext="قال رسول الله ﷺ: «ما نقصت صدقة من مال». تبرعك الآمن يصل لمستحقيه بإشراف كامل من الجمعية."
            />

            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-10 relative z-20">
                <div className="grid grid-cols-12 gap-6 items-stretch">
                    
                    {/* Main Step Panel */}
                    <div className={isSuccessStep ? "col-span-12 max-w-2xl mx-auto w-full" : "col-span-12 md:col-span-8"}>
                        <div className="bg-card-bg rounded-2xl shadow-card p-6 md:p-8 border border-card-border h-full flex flex-col justify-between">
                            <div>
                                {/* Steps Stepper */}
                                {step < 4 && (
                                    <div className="flex items-center justify-between mb-8 border-b border-card-border pb-5">
                                        {[
                                            { s: 1, label: "المبلغ" },
                                            { s: 2, label: "طريقة الدفع" },
                                            { s: 3, label: "مراجعة وتأكيد" }
                                        ].map((item) => (
                                            <button
                                                key={item.s}
                                                disabled={item.s > step}
                                                onClick={() => setStep(item.s)}
                                                className="flex items-center gap-2 focus:outline-none"
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                                                    step === item.s 
                                                        ? "bg-primary-500 text-white" 
                                                        : step > item.s 
                                                            ? "bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400" 
                                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500"
                                                }`}>
                                                    {step > item.s ? <i className="fa-solid fa-check text-xs"></i> : item.s}
                                                </div>
                                                <span className={`text-sm font-semibold transition-colors ${
                                                    step === item.s 
                                                        ? "text-primary-500" 
                                                        : "text-neutral-500 dark:text-neutral-400"
                                                }`}>
                                                    {item.label}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* STEP 1: AMOUNT CONFIG & DYNAMIC TARGET SELECTOR */}
                                {step === 1 && (
                                    <div className="space-y-6">
                                        {/* Dynamic Target Selection Row */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">وجه تبرعك:</label>
                                            <select
                                                value={selectedTargetId}
                                                onChange={(e) => handleTargetChange(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-card-border bg-card-bg text-neutral-900 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                            >
                                                <option value="general">تبرع عام لدعم مشاريع الجمعية</option>
                                                <optgroup label="المشاريع والبرامج النشطة">
                                                    {projectsList.map(p => (
                                                        <option key={p.id} value={`project:${p.id}`}>{p.title}</option>
                                                    ))}
                                                </optgroup>
                                                <optgroup label="الحملات النشطة">
                                                    {campaignsList.map(c => (
                                                        <option key={c.id} value={`campaign:${c.id}`}>{c.title}</option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                        </div>

                                        <hr className="border-t border-card-border" />

                                        <h4 className="text-lg font-bold text-neutral-900">تحديد مبلغ المساهمة</h4>
                                        
                                        {target.amountConfig === 'FIXED_SHARES' ? (
                                            // Fixed Shares Layout
                                            <div className="space-y-6">
                                                <div className="bg-primary-500/5 p-4 rounded-xl border border-primary-500/10 text-center">
                                                    <p className="text-sm text-primary-700 dark:text-primary-400 mb-1">هذا المشروع مقسم إلى أسهم خيرية</p>
                                                    <h5 className="text-xl font-bold text-primary-600 dark:text-primary-400">قيمة السهم الواحد: {formatCurrency(target.sharePrice || 0)}</h5>
                                                </div>
                                                
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <label className="text-sm font-semibold text-neutral-500">اختر عدد الأسهم التي تريد التبرع بها:</label>
                                                    <div className="flex items-center gap-4">
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShares(prev => Math.max(1, prev - 1))}
                                                            className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-900"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-2xl font-extrabold w-12 text-center text-neutral-900">{shares}</span>
                                                        <button 
                                                            type="button"
                                                            onClick={() => setShares(prev => prev + 1)}
                                                            className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-neutral-900"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Flexible Layout
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                                    {presetAmounts.map((preset) => (
                                                        <button
                                                            key={preset}
                                                            type="button"
                                                            onClick={() => setAmount(preset)}
                                                            className={`py-3 px-2 rounded-xl font-bold border transition-all duration-200 text-sm ${
                                                                amount === preset
                                                                    ? "bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20"
                                                                    : "border-card-border hover:bg-page-bg text-neutral-900"
                                                            }`}
                                                        >
                                                            {preset} ج.م
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="relative">
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">مبلغ مخصص:</span>
                                                    <input
                                                        type="number"
                                                        min="10"
                                                        value={amount}
                                                        onChange={(e) => setAmount(Number(e.target.value))}
                                                        className="w-full pr-28 pl-12 py-3.5 rounded-xl border border-card-border bg-transparent text-lg font-bold focus:ring-2 focus:ring-primary-500 outline-none text-left text-neutral-900"
                                                    />
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">ج.م</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 2: PAYMENT METHOD */}
                                {step === 2 && (
                                    <div className="space-y-6">
                                        <h4 className="text-lg font-bold mb-4 text-neutral-900">اختر طريقة الدفع المناسبة</h4>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {[
                                                { id: 'CREDIT_CARD', label: "بطاقة ائتمان (فيزا / ماستركارد)", icon: "fa-solid fa-credit-card", desc: "ادفع أونلاين ببطاقتك الائتمانية بشكل آمن" },
                                                { id: 'E_WALLET', label: "محفظة إلكترونية", icon: "fa-solid fa-mobile-screen-button", desc: "فودافون كاش، اتصالات كاش، أورانج كاش، إنستاباي" },
                                                { id: 'FAWRY', label: "فوري", icon: "fa-solid fa-barcode", desc: "احصل على رمز سداد وادفع في أي منفذ فوري" },
                                                { id: 'BANK_TRANSFER', label: "تحويل بنكي", icon: "fa-solid fa-building-columns", desc: "تحويل مباشر لحساب الجمعية البنكي" },
                                                { id: 'CASH_COLLECTION', label: "تحصيل نقدي من المنزل", icon: "fa-solid fa-house-chimney", desc: "مندوبنا يصلك لباب المنزل لاستلام تبرعك" }
                                            ].map((method) => (
                                                <div
                                                    key={method.id}
                                                    onClick={() => setPaymentMethod(method.id)}
                                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-4 ${
                                                        paymentMethod === method.id 
                                                            ? "border-primary-500 bg-primary-500/5" 
                                                            : "border-card-border hover:border-neutral-300 dark:hover:border-neutral-700"
                                                    }`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition-colors ${
                                                        paymentMethod === method.id 
                                                            ? "bg-primary-500 border-primary-500 text-white" 
                                                            : "bg-page-bg border-card-border text-muted"
                                                    }`}>
                                                        <i className={method.icon}></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="font-bold text-sm mb-0.5 text-neutral-900">{method.label}</h5>
                                                        <p className="text-xs text-muted">{method.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* E-Wallet Phone Sub-input */}
                                        {paymentMethod === 'E_WALLET' && (
                                            <div className="mt-4 p-4 bg-page-bg rounded-2xl border border-card-border space-y-2">
                                                <label className="text-xs font-semibold text-neutral-500 block">رقم الهاتف المرتبط بالمحفظة الإلكترونية:</label>
                                                <input
                                                    type="tel"
                                                    placeholder="مثال: 01012345678"
                                                    value={walletPhone}
                                                    onChange={(e) => setWalletPhone(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card-bg outline-none focus:ring-2 focus:ring-primary-500 text-sm font-bold text-neutral-900"
                                                />
                                            </div>
                                        )}

                                        {/* Cash Collection Address Sub-input */}
                                        {paymentMethod === 'CASH_COLLECTION' && (
                                            <div className="mt-4 p-4 bg-page-bg rounded-2xl border border-card-border space-y-2">
                                                <label className="text-xs font-semibold text-neutral-500 block">عنوان تحصيل التبرع بالتفصيل:</label>
                                                <textarea
                                                    placeholder="الشارع، رقم المبنى، الشقة، المنطقة/المحافظة..."
                                                    value={collectionAddress}
                                                    rows="3"
                                                    onChange={(e) => setCollectionAddress(e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-xl border border-card-border bg-card-bg outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none text-neutral-900"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 3: REVIEW & SUBMIT */}
                                {step === 3 && (
                                    <div className="space-y-6">
                                        <h4 className="text-lg font-bold mb-4 text-neutral-900">مراجعة وتأكيد تفاصيل التبرع</h4>
                                        
                                        <div className="bg-page-bg rounded-2xl border border-card-border overflow-hidden text-sm">
                                            <div className="p-4 border-b border-card-border flex justify-between">
                                                <span className="text-neutral-500">هدف التبرع:</span>
                                                <span className="font-bold text-neutral-900">{target.title}</span>
                                            </div>
                                            
                                            {target.amountConfig === 'FIXED_SHARES' && (
                                                <div className="p-4 border-b border-card-border flex justify-between">
                                                    <span className="text-neutral-500">عدد الأسهم:</span>
                                                    <span className="font-bold text-neutral-900">{shares} أسهم</span>
                                                </div>
                                            )}
                                            
                                            <div className="p-4 border-b border-card-border flex justify-between">
                                                <span className="text-neutral-500">طريقة الدفع:</span>
                                                <span className="font-bold text-neutral-900">
                                                    {paymentMethod === 'CREDIT_CARD' && 'بطاقة ائتمانية'}
                                                    {paymentMethod === 'E_WALLET' && 'محفظة إلكترونية'}
                                                    {paymentMethod === 'FAWRY' && 'فوري'}
                                                    {paymentMethod === 'BANK_TRANSFER' && 'تحويل بنكي'}
                                                    {paymentMethod === 'CASH_COLLECTION' && 'تحصيل نقدي'}
                                                </span>
                                            </div>
                                            
                                            {paymentMethod === 'E_WALLET' && (
                                                <div className="p-4 border-b border-card-border flex justify-between">
                                                    <span className="text-neutral-500">رقم المحفظة:</span>
                                                    <span className="font-mono font-bold text-neutral-900">{walletPhone}</span>
                                                </div>
                                            )}
                                            
                                            {paymentMethod === 'CASH_COLLECTION' && (
                                                <div className="p-4 border-b border-card-border flex justify-between">
                                                    <span className="text-neutral-500">عنوان التحصيل:</span>
                                                    <span className="font-bold text-neutral-900">{collectionAddress}</span>
                                                </div>
                                            )}

                                            <div className="p-4 bg-primary-500/5 flex justify-between items-center">
                                                <span className="text-neutral-500 font-bold">إجمالي المبلغ:</span>
                                                <span className="text-xl font-extrabold text-primary-600 dark:text-primary-400">{formatCurrency(calculatedAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: SUCCESS SCREEN */}
                                {step === 4 && (
                                    <div className="text-center py-8 space-y-6">
                                        <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto text-primary-500 border-2 border-primary-500 animate-bounce">
                                            <i className="fa-solid fa-check text-4xl"></i>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">تقبل الله طاعتكم وجزاكم خيراً</h3>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">تم تسجيل مساهمتكم بنجاح ومثبتة في ميزان حسناتكم.</p>
                                        </div>

                                        {fawryCode && (
                                            <div className="bg-accent-50 dark:bg-accent-950/20 p-5 rounded-2xl border border-accent-100 dark:border-accent-900/40 max-w-sm mx-auto space-y-1">
                                                <p className="text-xs text-accent-700 dark:text-accent-400 font-bold">رمز سداد فوري الخاص بك:</p>
                                                <h4 className="text-2xl font-extrabold text-accent-600 dark:text-accent-400 font-mono tracking-wider">{fawryCode}</h4>
                                                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 leading-normal">يرجى التوجه لأي منفذ سداد فوري واستخدام هذا الرمز لإتمام العملية.</p>
                                            </div>
                                        )}

                                        <div className="bg-page-bg rounded-2xl border border-card-border p-5 max-w-md mx-auto text-sm text-right space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">رقم الإيصال:</span>
                                                <span className="font-mono font-bold text-neutral-900">#{donationResult?.receiptNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">المبلغ المدفوع:</span>
                                                <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(donationResult?.amount || 0)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">الحالة:</span>
                                                <span className={`font-bold px-2 py-0.5 rounded-lg text-xs ${
                                                    (donationResult?.status?.toLowerCase() === 'completed' || donationResult?.status?.toLowerCase() === 'success')
                                                        ? 'bg-success-50 dark:bg-success-950/20 text-success-600 dark:text-success-400'
                                                        : 'bg-warning-50 dark:bg-warning-950/20 text-warning-600 dark:text-warning-400'
                                                }`}>
                                                    {(donationResult?.status?.toLowerCase() === 'completed' || donationResult?.status?.toLowerCase() === 'success') ? 'مكتمل' : 'قيد الانتظار'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">التاريخ:</span>
                                                <span className="font-bold text-neutral-900">{donationResult?.date || (donationResult?.createdAt ? new Date(donationResult.createdAt).toLocaleDateString('ar-EG') : '')}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Navigation Footer */}
                            <div className="mt-8 pt-6 border-t border-card-border flex justify-between items-center">
                                {step === 1 && <div />}
                                {step > 1 && step < 4 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(prev => prev - 1)}
                                        className="px-6 py-2.5 rounded-xl font-bold border border-card-border hover:bg-page-bg text-neutral-600 dark:text-neutral-300 text-sm flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-arrow-right text-xs"></i>
                                        <span>السابق</span>
                                    </button>
                                )}
                                
                                {step < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(prev => prev + 1)}
                                        className="px-8 py-3 rounded-xl font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 text-sm flex items-center gap-2 mr-auto"
                                    >
                                        <span>الخطوة التالية</span>
                                        <i className="fa-solid fa-arrow-left text-xs"></i>
                                    </button>
                                )}

                                {step === 3 && (
                                    <button
                                        type="button"
                                        onClick={handleInitiate}
                                        disabled={otpLoading}
                                        className="px-8 py-3 rounded-xl font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/20 text-sm flex items-center gap-2 mr-auto disabled:opacity-50"
                                    >
                                        {otpLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                                <span>جاري معالجة الطلب...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-shield-heart text-xs"></i>
                                                <span>تبرع الآن</span>
                                            </>
                                        )}
                                    </button>
                                )}

                                {step === 4 && (
                                    <div className="w-full flex justify-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep(1);
                                                setShares(1);
                                                setAmount(100);
                                                setFawryCode(null);
                                                setDonationResult(null);
                                                setTargetType('general');
                                                setSelectedTargetId('general');
                                            }}
                                            className="px-6 py-2.5 rounded-xl font-bold bg-primary-500 hover:bg-primary-600 text-white text-sm"
                                        >
                                            تبرع مرة أخرى
                                        </button>
                                        
                                        <Link
                                            to={paths.home}
                                            className="px-6 py-2.5 rounded-xl font-bold border border-card-border hover:bg-page-bg text-neutral-600 dark:text-neutral-300 text-sm"
                                        >
                                            العودة للرئيسية
                                        </Link>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Target Sidebar / Order Summary (Hidden in Success step to align center) */}
                    {!isSuccessStep && (
                        <div className="col-span-12 md:col-span-4">
                            <div className="bg-card-bg rounded-2xl shadow-card p-6 border border-card-border sticky top-4 space-y-6 h-full flex flex-col justify-between">
                                
                                {/* Target Meta */}
                                <div className="space-y-4">
                                    <h4 className="text-base font-bold pb-3 border-b border-card-border text-neutral-900">مساهمتك موجهة إلى</h4>
                                    
                                    {(target.image || target.imageUrl) && (
                                        <img 
                                            src={target.image || target.imageUrl} 
                                            alt={target.title} 
                                            className="w-full h-36 object-cover rounded-xl shadow-sm"
                                            onError={(e) => { e.target.src = '/vite.svg'; }}
                                        />
                                    )}
                                    
                                    <div className="space-y-1">
                                        <h5 className="font-bold text-sm text-neutral-900">{target.title}</h5>
                                        <p className="text-xs text-muted line-clamp-3 leading-normal">
                                            {target.description || 'مشروع تنموي مستدام تحت إشراف الجمعية يهدف لتحقيق تماسك وتنمية مجتمعية.'}
                                        </p>
                                    </div>

                                    {/* Goal Progress */}
                                    <div className="space-y-2 pt-2 text-xs">
                                        <div className="flex justify-between text-muted">
                                            <span>تم جمع {formatCurrency(raised)}</span>
                                            <span>الهدف {formatCurrency(goal)}</span>
                                        </div>
                                        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-muted">
                                            <span>نسبة الإنجاز: {progressPct}%</span>
                                            <span>{target.donorsCount || 0} متبرع</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Invoice Card */}
                                <div className="bg-page-bg p-4 rounded-xl border border-card-border space-y-3 text-xs mt-auto">
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">طريقة الدفع:</span>
                                        <span className="font-bold text-neutral-950 dark:text-neutral-200">
                                            {paymentMethod === 'CREDIT_CARD' && 'بطاقة ائتمانية'}
                                            {paymentMethod === 'E_WALLET' && 'محفظة إلكترونية'}
                                            {paymentMethod === 'FAWRY' && 'فوري'}
                                            {paymentMethod === 'BANK_TRANSFER' && 'تحويل بنكي'}
                                            {paymentMethod === 'CASH_COLLECTION' && 'تحصيل نقدي'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-neutral-500">النوع:</span>
                                        <span className="font-bold text-neutral-950 dark:text-neutral-200">صدقة</span>
                                    </div>
                                    <hr className="border-t border-card-border" />
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-neutral-900">مبلغ المساهمة:</span>
                                        <span className="text-primary-500 font-extrabold">{formatCurrency(calculatedAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* OTP VERIFICATION MODAL */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" dir="rtl">
                    <div className="bg-card-bg rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-card-border text-center space-y-6">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/20 rounded-full flex items-center justify-center mx-auto text-primary-500 text-2xl border border-primary-500/20">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-neutral-900">تأكيد عملية التبرع</h3>
                            <p className="text-xs text-muted leading-relaxed">
                                لقد قمنا بإرسال رمز تحقق (OTP) مكون من 6 أرقام إلى بريدك الإلكتروني المسجل: <strong className="font-mono text-neutral-750 dark:text-neutral-200">{donorUser?.email}</strong>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                maxLength="6"
                                placeholder="أدخل 6 أرقام الكود هنا"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-full text-center tracking-widest font-mono text-2xl font-extrabold px-4 py-3 rounded-xl border border-card-border bg-transparent outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900"
                            />
                            
                            {otpError && (
                                <div className="text-error-500 text-xs font-bold text-right flex items-center gap-1.5 justify-center">
                                    <i className="fa-solid fa-circle-exclamation text-[11px]"></i>
                                    <span>{otpError}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-xs text-muted">
                                <span>صلاحية الكود تنتهي خلال: <strong className="font-mono text-primary-500">{formatTimer(timer)}</strong></span>
                                <button
                                    type="button"
                                    disabled={timer > 0 || otpLoading}
                                    onClick={handleInitiate}
                                    className="text-primary-500 font-bold hover:underline disabled:opacity-40 disabled:hover:no-underline"
                                >
                                    إعادة إرسال الكود
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={handleVerify}
                                disabled={otpLoading || otpCode.length !== 6}
                                className="flex-1 py-3 rounded-xl font-bold text-white bg-primary-500 hover:bg-primary-600 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {otpLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        <span>جاري التحقق...</span>
                                    </>
                                ) : (
                                    <span>تأكيد الرمز وإتمام التبرع</span>
                                )}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setShowOtpModal(false)}
                                className="px-5 py-3 rounded-xl font-semibold border border-card-border hover:bg-page-bg text-muted text-sm bg-transparent"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Donate;
