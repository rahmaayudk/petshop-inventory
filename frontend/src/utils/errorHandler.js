// Centralized error handling utility

export class AppError extends Error {
    constructor(message, code = 'UNKNOWN_ERROR', details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

export const handleError = (error, context = '') => {
    console.error(`🔴 Error in ${context}:`, error);
    
    // Log error untuk monitoring
    if (process.env.NODE_ENV === 'development') {
        console.group('Error Details');
        console.log('Context:', context);
        console.log('Error:', error);
        console.log('Stack:', error.stack);
        console.groupEnd();
    }
    
    // Classification error types
    if (error.response) {
        // Server responded with error status
        return new AppError(
            error.response.data?.message || 'Server error occurred',
            `HTTP_${error.response.status}`,
            error.response.data
        );
    } else if (error.request) {
        // Request made but no response received
        return new AppError(
            'Tidak dapat terhubung ke server',
            'NETWORK_ERROR',
            { originalError: error.message }
        );
    } else {
        // Something else happened
        return new AppError(
            error.message || 'Terjadi kesalahan tidak terduga',
            'UNKNOWN_ERROR',
            { originalError: error }
        );
    }
};

export const withErrorHandling = (fn, context = '') => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            const appError = handleError(error, context);
            throw appError;
        }
    };
};

// Global error handler untuk React components
export const useErrorHandler = () => {
    const handleComponentError = (error, componentName = '') => {
        const appError = handleError(error, `Component: ${componentName}`);
        
        // Bisa ditambahkan logic untuk menampilkan toast/notification
        console.error('Component Error:', appError);
        
        return appError;
    };
    
    return { handleComponentError };
};