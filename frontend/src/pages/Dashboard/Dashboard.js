import React, { useState, useEffect } from 'react';
import { productAPI, transactionAPI } from '../../utils/api';
import { formatRupiah, getStockStatus } from '../../utils/helpers';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import StockBadge from '../../components/Common/StockBadge';
import SalesChart from '../../components/Charts/SalesChart';
import { toast } from 'react-toastify';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockItems: 0,
        totalSales: 0,
        bestSellers: []
    });
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load data dengan error handling
            const [productsResponse, lowStockResponse, bestSellersResponse] = await Promise.all([
                productAPI.getAll().catch(error => {
                    console.error('Error loading products:', error);
                    return [];
                }),
                productAPI.getLowStock().catch(error => {
                    console.error('Error loading low stock:', error);
                    return [];
                }),
                transactionAPI.getBestSellers(5).catch(error => {
                    console.error('Error loading best sellers:', error);
                    return [];
                })
            ]);

            // Ensure we have arrays
            const products = Array.isArray(productsResponse) ? productsResponse : [];
            const lowStock = Array.isArray(lowStockResponse) ? lowStockResponse : [];
            const bestSellers = Array.isArray(bestSellersResponse) ? bestSellersResponse : [];

            // Calculate total sales safely
            const totalSales = bestSellers.reduce((sum, item) => {
                if (item && typeof item.total_sold === 'number' && typeof item.price_sell === 'number') {
                    return sum + (item.total_sold * item.price_sell);
                }
                return sum;
            }, 0);

            setStats({
                totalProducts: products.length,
                lowStockItems: lowStock.length,
                totalSales: totalSales,
                bestSellers: bestSellers
            });

            setLowStockProducts(lowStock);
        } catch (error) {
            console.error('Dashboard error:', error);
            toast.error('Gagal memuat data dashboard');
            
            // Set default values on error
            setStats({
                totalProducts: 0,
                lowStockItems: 0,
                totalSales: 0,
                bestSellers: []
            });
            setLowStockProducts([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Memuat dashboard..." />;
    }

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">📊 Dashboard</h1>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <button 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={loadDashboardData}
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card stat-card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Produk
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.totalProducts}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-calendar fa-2x text-gray-300">📦</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card stat-card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Stok Menipis
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.lowStockItems}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-comments fa-2x text-gray-300">⚠️</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card stat-card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Penjualan (30 hari)
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {formatRupiah(stats.totalSales)}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-dollar-sign fa-2x text-gray-300">💰</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card stat-card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Produk Terlaris
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                                        {stats.bestSellers.length}
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clipboard-list fa-2x text-gray-300">🏆</i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Low Stock Alert */}
                <div className="col-xl-6 col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-danger">
                                ⚠️ Produk Stok Menipis
                            </h6>
                        </div>
                        <div className="card-body">
                            {lowStockProducts.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <p>🎉 Semua stok dalam kondisi aman!</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover" width="100%">
                                        <thead>
                                            <tr>
                                                <th>Produk</th>
                                                <th>Stok</th>
                                                <th>Minimal</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lowStockProducts.map((product) => (
                                                <tr key={product.id}>
                                                    <td>
                                                        <strong>{product.name}</strong>
                                                        <br />
                                                        <small className="text-muted">
                                                            {product.sku_code}
                                                        </small>
                                                    </td>
                                                    <td>{product.current_stock}</td>
                                                    <td>{product.min_stock_threshold}</td>
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

                {/* Best Sellers */}
                <div className="col-xl-6 col-lg-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-success">
                                🏆 5 Produk Terlaris (30 Hari)
                            </h6>
                        </div>
                        <div className="card-body">
                            {stats.bestSellers.length === 0 ? (
                                <div className="text-center text-muted py-4">
                                    <p>Belum ada data penjualan</p>
                                </div>
                            ) : (
                                <div className="list-group">
                                    {stats.bestSellers.map((product, index) => (
                                        <div key={product.id || index} className="list-group-item">
                                            <div className="d-flex w-100 justify-content-between align-items-center">
                                                <div>
                                                    <span className="badge bg-primary me-2">
                                                        #{index + 1}
                                                    </span>
                                                    <strong>{product.name}</strong>
                                                    <br />
                                                    <small className="text-muted">
                                                        Terjual: {product.total_sold} pcs
                                                    </small>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold text-success">
                                                        {formatRupiah((product.total_sold || 0) * (product.price_sell || 0))}
                                                    </div>
                                                    <small className="text-muted">
                                                        {formatRupiah(product.price_sell || 0)}/pcs
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="row">
                <div className="col-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">
                                📈 Grafik Penjualan
                            </h6>
                        </div>
                        <div className="card-body">
                            <SalesChart />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;