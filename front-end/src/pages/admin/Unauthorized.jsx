import React from 'react';
import { Link } from 'react-router-dom';
import { paths } from '../../constants/paths';

function Unauthorized() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-colors duration-200">
            <div className="max-w-md w-full text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 font-arabic">
                    غير مصرح بالدخول
                </h1>
                
                <p className="text-gray-600 dark:text-gray-400 mb-8 font-arabic text-sm leading-relaxed">
                    عذراً، حسابك الحالي لا يمتلك الصلاحيات الكافية للوصول إلى هذه الصفحة. يرجى مراجعة إدارة النظام إذا كنت تعتقد أن هذا خطأ.
                </p>

                <Link
                    to={paths.admin.dashboard}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-sm transition-all duration-155 font-arabic w-full"
                >
                    العودة للرئيسية
                </Link>
            </div>
        </div>
    );
}

export default Unauthorized;
