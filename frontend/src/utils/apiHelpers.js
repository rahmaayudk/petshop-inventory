export const ensureArray = (data) => {
    if (Array.isArray(data)) {
        return data;
    }
    
    if (data && typeof data === 'object') {
        // Handle berbagai format response
        if (data.data && Array.isArray(data.data)) {
            return data.data;
        }
        if (data.products && Array.isArray(data.products)) {
            return data.products;
        }
        if (data.items && Array.isArray(data.items)) {
            return data.items;
        }
        if (data.transactions && Array.isArray(data.transactions)) {
            return data.transactions;
        }
        // Jika object memiliki properties yang mirip array
        const values = Object.values(data);
        if (values.length > 0 && Array.isArray(values[0])) {
            return values[0];
        }
    }
    
    // Return empty array sebagai fallback
    console.warn('Data is not an array, returning empty array:', data);
    return [];
};

export const ensureObject = (data) => {
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data;
    }
    
    // Return empty object sebagai fallback
    console.warn('Data is not an object, returning empty object:', data);
    return {};
};

export const safeReduce = (array, reducer, initialValue = 0) => {
    if (!Array.isArray(array)) {
        console.warn('safeReduce: Input is not an array');
        return initialValue;
    }
    
    try {
        return array.reduce(reducer, initialValue);
    } catch (error) {
        console.error('Reduce error:', error);
        return initialValue;
    }
};

// Helper untuk extract data dari response yang complex
export const extractData = (response, key = null) => {
    if (!response) return key ? null : [];
    
    if (key && response[key] !== undefined) {
        return response[key];
    }
    
    return response;
};

// Helper untuk handle API errors dengan retry logic
export const withRetry = async (apiCall, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
};