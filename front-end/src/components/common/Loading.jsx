import './Loading.css';

/**
 * Loading Spinner Component
 * Displays a centered loading spinner with optional text
 */
function Loading({ text = 'جاري التحميل...', fullScreen = false }) {
    return (
        <div className={`loading-container ${fullScreen ? 'loading-container--fullscreen' : ''}`}>
            <div className="loading-spinner"></div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
}

export default Loading;
