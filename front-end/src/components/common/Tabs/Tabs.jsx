import { useState } from 'react';
import './Tabs.css';

/**
 * Tabs Component - Tab navigation
 */
function Tabs({
    tabs = [],
    defaultTab,
    onChange,
    variant = 'default',
    fullWidth = false,
    className = '',
    children,
}) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        onChange?.(tabId);
    };

    const classNames = [
        'tabs',
        `tabs--${variant}`,
        fullWidth && 'tabs--full',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            <div className="tabs__list" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        role="tab"
                        className={`tabs__tab ${activeTab === tab.id ? 'tabs__tab--active' : ''}`}
                        aria-selected={activeTab === tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        disabled={tab.disabled}
                    >
                        {tab.icon && <span className="tabs__tab-icon">{tab.icon}</span>}
                        <span className="tabs__tab-label">{tab.label}</span>
                        {tab.badge !== undefined && (
                            <span className="tabs__tab-badge">{tab.badge}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="tabs__content" role="tabpanel">
                {typeof children === 'function' ? children(activeTab) : children}
            </div>
        </div>
    );
}

export default Tabs;
