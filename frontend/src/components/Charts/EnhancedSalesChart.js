import React, { useState, useEffect } from 'react';
import { formatRupiah } from '../../utils/helpers';

const EnhancedSalesChart = ({ period = 'month' }) => {
    const [chartData, setChartData] = useState([]);
    const [chartType, setChartType] = useState('sales'); // 'sales' or 'profit'

    useEffect(() => {
        loadChartData();
    }, [period, chartType]);

    const loadChartData = () => {
        let data = [];
        
        switch (period) {
            case 'today':
                data = [
                    { time: '08:00', sales: 450000, profit: 120000 },
                    { time: '10:00', sales: 520000, profit: 150000 },
                    { time: '12:00', sales: 780000, profit: 230000 },
                    { time: '14:00', sales: 610000, profit: 180000 },
                    { time: '16:00', sales: 920000, profit: 280000 },
                    { time: '18:00', sales: 850000, profit: 250000 }
                ];
                break;
            case 'week':
                data = [
                    { day: 'Sen', sales: 450000, profit: 120000 },
                    { day: 'Sel', sales: 520000, profit: 150000 },
                    { day: 'Rab', sales: 480000, profit: 130000 },
                    { day: 'Kam', sales: 610000, profit: 180000 },
                    { day: 'Jum', sales: 720000, profit: 220000 },
                    { day: 'Sab', sales: 850000, profit: 280000 },
                    { day: 'Min', sales: 780000, profit: 250000 }
                ];
                break;
            case 'month':
            default:
                data = [
                    { week: 'Minggu 1', sales: 2800000, profit: 800000 },
                    { week: 'Minggu 2', sales: 3200000, profit: 950000 },
                    { week: 'Minggu 3', sales: 3500000, profit: 1100000 },
                    { week: 'Minggu 4', sales: 4100000, profit: 1300000 }
                ];
                break;
            case 'year':
                data = [
                    { month: 'Jan', sales: 12500000, profit: 3800000 },
                    { month: 'Feb', sales: 13200000, profit: 4200000 },
                    { month: 'Mar', sales: 12800000, profit: 4000000 },
                    { month: 'Apr', sales: 14500000, profit: 4800000 },
                    { month: 'Mei', sales: 15200000, profit: 5200000 },
                    { month: 'Jun', sales: 14800000, profit: 5000000 }
                ];
                break;
        }
        
        setChartData(data);
    };

    const maxValue = Math.max(...chartData.map(item => chartType === 'sales' ? item.sales : item.profit));

    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 font-weight-bold text-primary">
                    📈 Grafik {chartType === 'sales' ? 'Penjualan' : 'Profit'} - {period === 'today' ? 'Hari Ini' : 
                    period === 'week' ? 'Minggu Ini' : 
                    period === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                </h6>
                <div className="btn-group btn-group-sm">
                    <button
                        className={`btn ${chartType === 'sales' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setChartType('sales')}
                    >
                        Penjualan
                    </button>
                    <button
                        className={`btn ${chartType === 'profit' ? 'btn-success' : 'btn-outline-success'}`}
                        onClick={() => setChartType('profit')}
                    >
                        Profit
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className="chart-container">
                    {chartData.map((item, index) => {
                        const value = chartType === 'sales' ? item.sales : item.profit;
                        const percentage = (value / maxValue) * 80;
                        const barColor = chartType === 'sales' ? 'primary' : 'success';
                        
                        return (
                            <div key={index} className="mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <small className="fw-bold">
                                        {item.time || item.day || item.week || item.month}
                                    </small>
                                    <div>
                                        <small className={`text-${barColor} fw-bold`}>
                                            {formatRupiah(value)}
                                        </small>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center">
                                    <div 
                                        className={`bg-${barColor} rounded me-3`}
                                        style={{ 
                                            height: '20px', 
                                            width: `${percentage}%`,
                                            opacity: 0.8,
                                            transition: 'all 0.3s ease'
                                        }}
                                        title={`${chartType === 'sales' ? 'Sales' : 'Profit'}: ${formatRupiah(value)}`}
                                    ></div>
                                    <small className="text-muted" style={{minWidth: '80px'}}>
                                        {((value / (chartData.reduce((sum, i) => sum + (chartType === 'sales' ? i.sales : i.profit), 0))) * 100).toFixed(1)}%
                                    </small>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {/* Summary Statistics */}
                <div className="row mt-4 text-center">
                    <div className="col-md-3 mb-2">
                        <div className="card bg-light">
                            <div className="card-body py-2">
                                <small>Total {chartType === 'sales' ? 'Sales' : 'Profit'}</small>
                                <h6 className={`text-${chartType === 'sales' ? 'primary' : 'success'} mb-0`}>
                                    {formatRupiah(chartData.reduce((sum, item) => sum + (chartType === 'sales' ? item.sales : item.profit), 0))}
                                </h6>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-2">
                        <div className="card bg-light">
                            <div className="card-body py-2">
                                <small>Rata-rata</small>
                                <h6 className="text-info mb-0">
                                    {formatRupiah(chartData.reduce((sum, item) => sum + (chartType === 'sales' ? item.sales : item.profit), 0) / chartData.length || 0)}
                                </h6>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-2">
                        <div className="card bg-light">
                            <div className="card-body py-2">
                                <small>Tertinggi</small>
                                <h6 className="text-success mb-0">
                                    {formatRupiah(Math.max(...chartData.map(item => chartType === 'sales' ? item.sales : item.profit)))}
                                </h6>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-2">
                        <div className="card bg-light">
                            <div className="card-body py-2">
                                <small>Trend</small>
                                <h6 className="text-warning mb-0">
                                    {chartData.length > 1 ? '↗️ Naik' : '➡️ Stabil'}
                                </h6>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedSalesChart;