import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../../utils/api';
import { formatRupiah } from '../../utils/helpers';

const SalesChart = () => {
    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        loadSalesData();
    }, []);

    const loadSalesData = async () => {
        try {
            // For demo purposes, we'll create sample data
            // In real implementation, you would fetch from API
            const sampleData = [
                { date: '2024-01', sales: 4500000 },
                { date: '2024-02', sales: 5200000 },
                { date: '2024-03', sales: 4800000 },
                { date: '2024-04', sales: 6100000 },
                { date: '2024-05', sales: 5900000 },
                { date: '2024-06', sales: 7200000 }
            ];
            setSalesData(sampleData);
        } catch (error) {
            console.error('Error loading sales data:', error);
        }
    };

    const maxSales = Math.max(...salesData.map(item => item.sales));
    const minSales = Math.min(...salesData.map(item => item.sales));

    return (
        <div className="sales-chart">
            {salesData.length === 0 ? (
                <div className="text-center text-muted py-4">
                    <p>Belum ada data penjualan</p>
                </div>
            ) : (
                <div className="chart-bars">
                    {salesData.map((item, index) => {
                        const percentage = ((item.sales - minSales) / (maxSales - minSales)) * 80 + 10;
                        return (
                            <div key={index} className="chart-bar-container mb-3">
                                <div className="d-flex justify-content-between mb-1">
                                    <small className="text-muted">{item.date}</small>
                                    <small className="fw-bold">{formatRupiah(item.sales)}</small>
                                </div>
                                <div className="chart-bar bg-primary rounded" 
                                     style={{ height: '20px', width: `${percentage}%` }}>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Simple statistics */}
            <div className="row mt-4 text-center">
                <div className="col-md-4">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h6>Rata-rata Bulanan</h6>
                            <h4 className="text-primary">
                                {formatRupiah(salesData.reduce((sum, item) => sum + item.sales, 0) / salesData.length || 0)}
                            </h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h6>Penjualan Tertinggi</h6>
                            <h4 className="text-success">{formatRupiah(maxSales)}</h4>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card bg-light">
                        <div className="card-body">
                            <h6>Penjualan Terendah</h6>
                            <h4 className="text-warning">{formatRupiah(minSales)}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesChart;