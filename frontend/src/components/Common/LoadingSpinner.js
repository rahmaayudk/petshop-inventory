import React from 'react';

const LoadingSpinner = ({ size = 'lg', text = 'Memuat...' }) => {
    return (
        <div className="loading-spinner text-center">
            <div className={`spinner-border text-primary spinner-border-${size}`} role="status">
                <span className="visually-hidden">Memuat...</span>
            </div>
            {text && <p className="mt-2 text-muted">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;