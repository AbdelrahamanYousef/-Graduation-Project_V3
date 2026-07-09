import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="max-w-lg mx-auto mt-8 mb-4 text-center px-4">
                    <div className="p-6 border border-neutral-200 rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-700">
                        <h1 className="text-2xl font-bold mb-4 text-error-500">
                            حدث خطأ غير متوقع
                        </h1>
                        <p className="text-neutral-500 mb-4">
                            واجه التطبيق خطأ غير متوقع. يرجى المحاولة مرة أخرى.
                        </p>
                        {this.state.error && (
                            <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-900 rounded text-left overflow-auto">
                                <pre className="text-xs font-mono text-neutral-700 dark:text-neutral-300">
                                    {this.state.error.toString()}
                                </pre>
                            </div>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 px-6 py-2.5 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-colors"
                        >
                            إعادة تحميل الصفحة
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
