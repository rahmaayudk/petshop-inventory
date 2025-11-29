import React, { useState, useEffect } from 'react';
import { productAPI, transactionAPI, analyticsAPI } from '../../utils/api';
import { formatRupiah, getStockStatus, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import StockBadge from '../../components/Common/StockBadge';
import EnhancedSalesChart from '../../components/Charts/EnhancedSalesChart';
import QuickActions from '../../components/Dashboard/QuickActions';
import RecentActivities from '../../components/Dashboard/RecentActivities';
import InventoryHealth from '../../components/Dashboard/InventoryHealth';
import { toast } from 'react-toastify';

const EnhancedDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalProducts: 0,
            lowStockItems: 0,
            totalSales: 0,
            monthlyGrowth: 0,
            totalProfit: 0,
            totalCustomers: 0,
            inventoryValue: 0
        },
        lowStockProducts: [],
        bestSellers: [],
        recentTransactions: [],
        inventoryHealth: {}
    });
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadDashboardData();
        
        if (autoRefresh) {
            const interval = setInterval(loadDashboardData, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, selectedPeriod]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            console.log('🔄 Loading dashboard data...');
            
            const [
                products,
                lowStock,
                bestSellers,
                recentTransactions,
                growthData,
                customerInsights
            ] = await Promise.all([
                productAPI.getAll(),
                productAPI.getLowStock(),
                transactionAPI.getBestSellers(5),
                transactionAPI.getRecentTransactions(6),
                transactionAPI.getMonthlyGrowth(),
                analyticsAPI.getCustomerInsights()
            ]);

            // Calculate real statistics from actual data
            const totalSales = bestSellers.reduce((sum, item) => 
                sum + ((item.total_sold || 0) * (item.price_sell || 0)), 0);

            const totalCost = bestSellers.reduce((sum, item) => 
                sum + ((item.total_sold || 0) * (item.price_buy || 0)), 0);

            const totalProfit = totalSales - totalCost;
            
            // Calculate real inventory value from products
            const inventoryValue = products.reduce((sum, product) => 
                sum + ((product.current_stock || 0) * (product.price_buy || 0)), 0);

            // Use real growth data from API
            const monthlyGrowth = growthData.growth || 0;

            setDashboardData({
                stats: {
                    totalProducts: products.length,
                    lowStockItems: lowStock.length,
                    totalSales: totalSales,
                    monthlyGrowth: monthlyGrowth,
                    totalProfit: totalProfit,
                    totalCustomers: customerInsights.total_customers || 0,
                    inventoryValue: inventoryValue
                },
                lowStockProducts: lowStock,
                bestSellers: bestSellers,
                recentTransactions: recentTransactions,
                inventoryHealth: calculateInventoryHealth(products)
            });

            setLastUpdated(new Date());
            console.log('✅ Dashboard data loaded successfully');

        } catch (error) {
            console.error('❌ Dashboard error:', error);
            toast.error('Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    };

    const calculateInventoryHealth = (products = []) => {
        const totalProducts = products.length;
        const lowStockCount = products.filter(p => 
            p.current_stock > 0 && p.current_stock <= p.min_stock_threshold
        ).length;
        const outOfStockCount = products.filter(p => p.current_stock === 0).length;
        const healthyCount = totalProducts - lowStockCount - outOfStockCount;

        return {
            healthy: healthyCount,
            lowStock: lowStockCount,
            outOfStock: outOfStockCount,
            total: totalProducts,
            healthPercentage: totalProducts > 0 ? Math.round((healthyCount / totalProducts) * 100) : 100
        };
    };

    const handleQuickAction = (action) => {
        switch (action) {
            case 'add_product':
                window.location.href = '/inventory';
                break;
            case 'quick_sale':
                window.location.href = '/transactions';
                break;
            case 'view_reports':
                window.location.href = '/reports';
                break;
            case 'check_stock':
                window.location.href = '/inventory';
                break;
            default:
                break;
        }
    };

    const getPeriodLabel = () => {
        const periods = {
            'today': 'Hari Ini',
            'week': 'Minggu Ini', 
            'month': 'Bulan Ini',
            'year': 'Tahun Ini'
        };
        return periods[selectedPeriod] || 'Bulan Ini';
    };

    if (loading) {
        return <LoadingSpinner text="Memuat dashboard..." />;
    }

    return (
        <div className="fade-in">
            {/* Header dengan Controls */}
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <div>
                    <h1 className="h2">📊 Dashboard Overview</h1>
                    <p className="text-muted mb-0">
                        Ringkasan performa toko • {getPeriodLabel()} 
                        {lastUpdated && (
                            <span className="ms-2 text-info">
                                (Update: {lastUpdated.toLocaleTimeString()})
                            </span>
                        )}
                    </p>
                </div>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <div className="btn-group me-2">
                        <select 
                            className="form-select form-select-sm"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="today">Hari Ini</option>
                            <option value="week">Minggu Ini</option>
                            <option value="month">Bulan Ini</option>
                            <option value="year">Tahun Ini</option>
                        </select>
                        <button 
                            className="btn btn-sm btn-outline-secondary"
                            onClick={loadDashboardData}
                            disabled={loading}
                        >
                            {loading ? '🔄...' : '🔁 Refresh'}
                        </button>
                        <button 
                            className={`btn btn-sm ${autoRefresh ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() => setAutoRefresh(!autoRefresh)}
                            title="Auto refresh setiap 30 detik"
                        >
                            {autoRefresh ? '⏰ ON' : '⏰ OFF'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <QuickActions onAction={handleQuickAction} />

            {/* Enhanced Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-2 col-md-4 col-6 mb-3">
                    <div className="card stat-card border-left-primary shadow h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Produk
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {dashboardData.stats.totalProducts}
                                    </div>
                                    <div className="mt-1">
                                        <small className="text-success">
                                            <i className="fas fa-arrow-up"></i> 
                                            {Math.floor(dashboardData.stats.totalProducts * 0.1)} bulan ini
                                        </small>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-boxes fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-md-4 col-6 mb-3">
                    <div className="card stat-card border-left-warning shadow h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Stok Menipis
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {dashboardData.stats.lowStockItems}
                                    </div>
                                    <div className="mt-1">
                                        <small className={dashboardData.stats.lowStockItems > 0 ? 'text-danger' : 'text-success'}>
                                            {dashboardData.stats.lowStockItems > 0 ? 'Perlu Restock' : 'Aman'}
                                        </small>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-exclamation-triangle fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-md-4 col-6 mb-3">
                    <div className="card stat-card border-left-success shadow h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Total Penjualan
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatRupiah(dashboardData.stats.totalSales)}
                                    </div>
                                    <div className="mt-1">
                                        <small className="text-success">
                                            <i className="fas fa-arrow-up"></i> 
                                            {dashboardData.stats.monthlyGrowth}%
                                        </small>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-md-4 col-6 mb-3">
                    <div className="card stat-card border-left-info shadow h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Total Profit
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatRupiah(dashboardData.stats.totalProfit)}
                                    </div>
                                    <div className="mt-1">
                                        <small className="text-success">
                                            Margin: {dashboardData.stats.totalSales > 0 ? 
                                                `${((dashboardData.stats.totalProfit / dashboardData.stats.totalSales) * 100).toFixed(1)}%` 
                                                : '0%'
                                            }
                                        </small>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-chart-line fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-md-4 col-6 mb-3">
                    <div className="card stat-card border-left-danger shadow h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-danger text-uppercase mb-1">
                                        Total Pelanggan
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {dashboardData.stats.totalCustomers}
                                    </div>
                                    <div className="mt-1">
                                        <small className="text-success">
                                            +15 bulan ini
                                        </small>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-2 col-md-4 col-6 mb-3">
                    <div className="card stat-card border-left-secondary shadow h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-secondary text-uppercase mb-1">
                                        Nilai Inventory
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatRupiah(dashboardData.stats.inventoryValue)}
                                    </div>
                                    <div className="mt-1">
                                        <small className="text-info">
                                            {dashboardData.inventoryHealth.healthPercentage}% sehat
                                        </small>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-warehouse fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Main Content - Left Side */}
                <div className="col-xl-8">
                    {/* Sales Chart */}
                    <EnhancedSalesChart period={selectedPeriod} />
                    
                    {/* Inventory Health */}
                    <InventoryHealth healthData={dashboardData.inventoryHealth} />
                    
                    {/* Low Stock Alert */}
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-danger">
                                <i className="fas fa-exclamation-triangle me-2"></i>
                                Produk Stok Menipis - Prioritas Restock
                            </h6>
                            <span className="badge bg-danger">{dashboardData.lowStockProducts.length}</span>
                        </div>
                        <div className="card-body">
                            {dashboardData.lowStockProducts.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                                    <p className="mb-1">Semua stok dalam kondisi aman!</p>
                                    <small className="text-muted">Tidak ada produk yang perlu restock saat ini</small>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover table-sm">
                                        <thead>
                                            <tr>
                                                <th>Produk</th>
                                                <th>SKU</th>
                                                <th>Stok Saat Ini</th>
                                                <th>Minimal</th>
                                                <th>Kekurangan</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dashboardData.lowStockProducts.map((product) => (
                                                <tr key={product.id} className="align-middle">
                                                    <td>
                                                        <div className="fw-bold">{product.name}</div>
                                                        <small className="text-muted">{product.category}</small>
                                                    </td>
                                                    <td>
                                                        <code>{product.sku_code}</code>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold">{product.current_stock}</span>
                                                    </td>
                                                    <td>{product.min_stock_threshold}</td>
                                                    <td>
                                                        <span className="badge bg-danger">
                                                            {Math.max(0, product.min_stock_threshold - product.current_stock)} pcs
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <StockBadge 
                                                            currentStock={product.current_stock}
                                                            minThreshold={product.min_stock_threshold}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Right Side */}
                <div className="col-xl-4">
                    {/* Best Sellers */}
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex justify-content-between align-items-center">
                            <h6 className="m-0 font-weight-bold text-success">
                                <i className="fas fa-trophy me-2"></i>
                                Top 5 Produk Terlaris
                            </h6>
                            <span className="badge bg-success">{dashboardData.bestSellers.length}</span>
                        </div>
                        <div className="card-body p-0">
                            {dashboardData.bestSellers.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <i className="fas fa-chart-bar fa-2x text-muted mb-2"></i>
                                    <p>Belum ada data penjualan</p>
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {dashboardData.bestSellers.map((product, index) => (
                                        <div key={product.id} className="list-group-item px-3 py-2">
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-primary me-3" style={{fontSize: '0.8rem'}}>
                                                    #{index + 1}
                                                </span>
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1" style={{fontSize: '0.9rem'}}>
                                                        {product.name}
                                                    </h6>
                                                    <small className="text-muted d-block">
                                                        Terjual: {product.total_sold} pcs
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-success" style={{fontSize: '0.9rem'}}>
                                                        {formatRupiah(product.total_sold * product.price_sell)}
                                                    </div>
                                                    <small className="text-muted" style={{fontSize: '0.7rem'}}>
                                                        {formatRupiah(product.price_sell)}/pcs
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <RecentActivities activities={dashboardData.recentTransactions} />

                    {/* Quick Stats Widget */}
                    <div className="card shadow">
                        <div className="card-header">
                            <h6 className="m-0 font-weight-bold text-primary">
                                <i className="fas fa-info-circle me-2"></i>
                                Quick Stats {getPeriodLabel()}
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-6 mb-3">
                                    <div className="border rounded p-2 bg-light">
                                        <i className="fas fa-shopping-cart text-primary mb-1"></i>
                                        <small className="d-block">Transaksi</small>
                                        <div className="fw-bold">{dashboardData.recentTransactions.length}</div>
                                    </div>
                                </div>
                                <div className="col-6 mb-3">
                                    <div className="border rounded p-2 bg-light">
                                        <i className="fas fa-chart-line text-success mb-1"></i>
                                        <small className="d-block">Growth</small>
                                        <div className="fw-bold">+{dashboardData.stats.monthlyGrowth}%</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="border rounded p-2 bg-light">
                                        <i className="fas fa-star text-warning mb-1"></i>
                                        <small className="d-block">Rating</small>
                                        <div className="fw-bold">4.8/5</div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="border rounded p-2 bg-light">
                                        <i className="fas fa-bullseye text-info mb-1"></i>
                                        <small className="d-block">Target</small>
                                        <div className="fw-bold">85%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedDashboard;