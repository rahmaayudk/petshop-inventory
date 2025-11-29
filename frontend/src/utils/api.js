import axios from 'axios';
import { ensureArray, ensureObject } from './apiHelpers';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor dengan enhanced handling
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        
        // Handle different response formats
        const data = response.data;
        
        // Jika response adalah array, langsung return
        if (Array.isArray(data)) {
            return data;
        }
        
        // Jika response adalah object dengan property data
        if (data && typeof data === 'object') {
            // Handle success response format
            if (data.success !== undefined && data.data !== undefined) {
                return data.data;
            }
            // Handle message response format
            if (data.message !== undefined) {
                return data;
            }
            // Handle direct data
            return data;
        }
        
        // Fallback untuk response yang tidak terduga
        return data || null;
    },
    (error) => {
        console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error);
        
        if (error.response?.status === 401) {
            window.location.href = '/login';
            return Promise.reject(error);
        }
        
        const errorMessage = error.response?.data?.message 
            || error.message 
            || 'Terjadi kesalahan pada server';
            
        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data
        });
    }
);

// API endpoints dengan error handling yang konsisten
export const authAPI = {
    login: (username, password) => 
        api.post('/auth', { action: 'login', username, password }),
    
    logout: () => 
        api.post('/auth', { action: 'logout' }),
    
    checkAuth: () => 
        api.post('/auth', { action: 'check' })
};

export const productAPI = {
    getAll: () => api.get('/products')
        .then(response => {
            const data = ensureArray(response);
            console.log(`📦 Loaded ${data.length} products`);
            return data;
        })
        .catch(error => {
            console.error('Error loading products:', error);
            return [];
        }),
        
    getLowStock: () => api.get('/products?action=low_stock')
        .then(response => {
            const data = ensureArray(response);
            console.log(`⚠️ Found ${data.length} low stock products`);
            return data;
        })
        .catch(error => {
            console.error('Error loading low stock:', error);
            return [];
        }),
        
    create: (productData) => api.post('/products', productData),
    update: (productData) => api.put('/products', productData),
    delete: (id) => api.delete('/products', { data: { id } })
};

export const transactionAPI = {
    create: (transactionData) => api.post('/transactions', transactionData),
    
    getBestSellers: (limit = 5) => 
        api.get(`/transactions?action=best_sellers&limit=${limit}`)
        .then(response => {
            const data = ensureArray(response);
            console.log(`🏆 Loaded ${data.length} best sellers`);
            return data;
        })
        .catch(error => {
            console.error('Error loading best sellers:', error);
            return [];
        }),
        
    getSalesReport: (startDate, endDate) =>
        api.get(`/transactions?action=sales_report&start_date=${startDate}&end_date=${endDate}`)
        .then(ensureArray)
        .catch(error => {
            console.error('Error loading sales report:', error);
            return [];
        }),
        
    getRecentTransactions: (limit = 10) =>
        api.get(`/transactions?action=recent&limit=${limit}`)
        .then(ensureArray)
        .catch(error => {
            console.error('Error loading recent transactions:', error);
            return [];
        }),
        
    getMonthlyGrowth: () =>
        api.get('/transactions?action=growth')
        .then(ensureObject)
        .catch(error => {
            console.error('Error loading growth data:', error);
            return { growth: 0, current_sales: 0, previous_sales: 0 };
        }),
        
    getProfitAnalysis: (startDate, endDate) =>
        api.get(`/transactions?action=profit_analysis&start_date=${startDate}&end_date=${endDate}`)
        .then(ensureArray)
        .catch(error => {
            console.error('Error loading profit analysis:', error);
            return [];
        })
};

export const analyticsAPI = {
    getCustomerInsights: () =>
        api.get('/analytics/customer-insights')
        .then(ensureObject)
        .catch(error => {
            console.error('Error loading customer insights:', error);
            return {
                total_customers: 0,
                new_customers_this_month: 0,
                repeat_customers: 0,
                average_order_value: 0
            };
        }),
        
    getInventoryTurnover: () =>
        api.get('/analytics/inventory-turnover')
        .then(ensureArray)
        .catch(error => {
            console.error('Error loading inventory turnover:', error);
            return [];
        }),
        
    getSalesTrends: (period = 'monthly') =>
        api.get(`/analytics/sales-trends?period=${period}`)
        .then(ensureArray)
        .catch(error => {
            console.error('Error loading sales trends:', error);
            return [];
        })
};

// Enhanced error handler
export const handleApiError = (error, customMessage = null) => {
    console.error('API Error Details:', error);
    
    const message = customMessage 
        || error.message 
        || 'Terjadi kesalahan pada server';
        
    return {
        success: false,
        message: message,
        data: null,
        status: error.status,
        originalError: error
    };
};

// Utility untuk check API health
export const checkApiHealth = async () => {
    try {
        const response = await api.get('/auth', { 
            params: { action: 'check' },
            timeout: 5000 
        });
        return { healthy: true, data: response };
    } catch (error) {
        return { healthy: false, error: error.message };
    }
};

export default api;