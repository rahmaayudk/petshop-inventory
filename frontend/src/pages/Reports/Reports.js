import React, { useState, useEffect } from 'react';
import { transactionAPI, productAPI } from '../../utils/api';
import { formatRupiah, exportToExcel } from '../../utils/helpers';
import { toast } from 'react-toastify';

const Reports = () => {
    const [dateRange, setDateRange] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reportGenerated, setReportGenerated] = useState(false);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productAPI.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const generateReport = async () => {
        if (!dateRange.start_date || !dateRange.end_date) {
            toast.error('Pilih rentang tanggal terlebih dahulu');
            return;
        }

        if (new Date(dateRange.start_date) > new Date(dateRange.end_date)) {
            toast.error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir');
            return;
        }

        setLoading(true);

        try {
            const data = await transactionAPI.getSalesReport(dateRange.start_date, dateRange.end_date);
            setReportData(data);
            setReportGenerated(true);
            toast.success('Laporan berhasil dihasilkan');
        } catch (error) {
            toast.error('Gagal menghasilkan laporan');
            console.error('Report error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (reportData.length === 0) {
            toast.error('Tidak ada data untuk diexport');
            return;
        }

        const exportData = reportData.map(item => ({
            'Nama Barang': item.name,
            'Kode SKU': item.sku_code,
            'Stok Awal': item.initial_stock,
            'Barang Masuk': item.stock_in,
            'Barang Keluar': item.stock_out,
            'Stok Akhir': item.final_stock,
            'Total Penjualan (Rp)': item.total_sales
        }));

        exportToExcel(exportData, `laporan_penjualan_${dateRange.start_date}_${dateRange.end_date}`);
        toast.success('Data berhasil diexport ke Excel');
    };

    const handlePrintPDF = () => {
        window.print();
    };

    const calculateTotals = () => {
        const totals = {
            totalStockIn: 0,
            totalStockOut: 0,
            totalSales: 0,
            totalProducts: reportData.length
        };

        reportData.forEach(item => {
            totals.totalStockIn += parseInt(item.stock_in) || 0;
            totals.totalStockOut += parseInt(item.stock_out) || 0;
            totals.totalSales += parseFloat(item.total_sales) || 0;
        });

        return totals;
    };

    const totals = calculateTotals();

    // Calculate summary statistics
    const getSummaryStats = () => {
        const bestSeller = reportData.reduce((best, current) => 
            (current.stock_out > best.stock_out) ? current : best, { stock_out: 0, name: '-' }
        );

        const highestSales = reportData.reduce((highest, current) => 
            (current.total_sales > highest.total_sales) ? current : highest, { total_sales: 0, name: '-' }
        );

        return {
            bestSeller,
            highestSales,
            averageSales: totals.totalSales / totals.totalProducts || 0
        };
    };

    const summaryStats = getSummaryStats();

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">📋 Laporan Penjualan</h1>
                <small className="text-muted">Analisis performa penjualan dan stok</small>
            </div>

            {/* Date Range Selection */}
            <div className="row mb-4">
                <div className="col-lg-8">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <h6 className="m-0 font-weight-bold">
                                📅 Pilih Periode Laporan
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row align-items-end">
                                <div className="col-md-5">
                                    <div className="mb-3">
                                        <label className="form-label">Tanggal Mulai</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateRange.start_date}
                                            onChange={(e) => setDateRange(prev => ({
                                                ...prev,
                                                start_date: e.target.value
                                            }))}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-5">
                                    <div className="mb-3">
                                        <label className="form-label">Tanggal Akhir</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={dateRange.end_date}
                                            onChange={(e) => setDateRange(prev => ({
                                                ...prev,
                                                end_date: e.target.value
                                            }))}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <button
                                        className="btn btn-success w-100"
                                        onClick={generateReport}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            '📊 Generate'
                                        )}
                                    </button>
                                </div>
                            </div>
                            {dateRange.start_date && dateRange.end_date && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        Periode: {new Date(dateRange.start_date).toLocaleDateString('id-ID')} - {new Date(dateRange.end_date).toLocaleDateString('id-ID')}
                                        {' '}({Math.ceil((new Date(dateRange.end_date) - new Date(dateRange.start_date)) / (1000 * 60 * 60 * 24))} hari)
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="col-lg-4">
                    <div className="card shadow">
                        <div className="card-header bg-success text-white">
                            <h6 className="m-0 font-weight-bold">
                                🚀 Ekspor Laporan
                            </h6>
                        </div>
                        <div className="card-body text-center">
                            <div className="btn-group-vertical w-100">
                                <button
                                    className="btn btn-outline-primary mb-2"
                                    onClick={handleExportExcel}
                                    disabled={!reportGenerated || reportData.length === 0}
                                >
                                    <i className="fas fa-file-excel me-2"></i>
                                    Export ke Excel
                                </button>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={handlePrintPDF}
                                    disabled={!reportGenerated || reportData.length === 0}
                                >
                                    <i className="fas fa-print me-2"></i>
                                    Print Laporan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Summary */}
            {reportGenerated && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card bg-light border-0">
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-md-3">
                                        <h4 className="text-primary">{totals.totalStockIn}</h4>
                                        <small className="text-muted">Total Barang Masuk</small>
                                    </div>
                                    <div className="col-md-3">
                                        <h4 className="text-success">{totals.totalStockOut}</h4>
                                        <small className="text-muted">Total Barang Keluar</small>
                                    </div>
                                    <div className="col-md-3">
                                        <h4 className="text-warning">{totals.totalProducts}</h4>
                                        <small className="text-muted">Jumlah Produk</small>
                                    </div>
                                    <div className="col-md-3">
                                        <h4 className="text-danger">{formatRupiah(totals.totalSales)}</h4>
                                        <small className="text-muted">Total Penjualan</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Statistics */}
            {reportGenerated && reportData.length > 0 && (
                <div className="row mb-4">
                    <div className="col-md-4">
                        <div className="card shadow">
                            <div className="card-body text-center">
                                <i className="fas fa-trophy fa-2x text-warning mb-2"></i>
                                <h6>Produk Terlaris</h6>
                                <h5 className="text-primary">{summaryStats.bestSeller.name}</h5>
                                <small className="text-muted">
                                    Terjual: {summaryStats.bestSeller.stock_out} pcs
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow">
                            <div className="card-body text-center">
                                <i className="fas fa-chart-line fa-2x text-success mb-2"></i>
                                <h6>Penjualan Tertinggi</h6>
                                <h5 className="text-success">{summaryStats.highestSales.name}</h5>
                                <small className="text-muted">
                                    {formatRupiah(summaryStats.highestSales.total_sales)}
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card shadow">
                            <div className="card-body text-center">
                                <i className="fas fa-calculator fa-2x text-info mb-2"></i>
                                <h6>Rata-rata Penjualan</h6>
                                <h5 className="text-info">{formatRupiah(summaryStats.averageSales)}</h5>
                                <small className="text-muted">
                                    Per produk
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Table */}
            {reportGenerated && (
                <div className="card shadow">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h6 className="m-0 font-weight-bold">
                            📋 Detail Laporan Penjualan
                        </h6>
                        <small>
                            Periode: {new Date(dateRange.start_date).toLocaleDateString('id-ID')} - {new Date(dateRange.end_date).toLocaleDateString('id-ID')}
                        </small>
                    </div>
                    <div className="card-body">
                        {reportData.length === 0 ? (
                            <div className="text-center text-muted py-5">
                                <i className="fas fa-inbox fa-3x mb-3"></i>
                                <h5>Tidak ada data transaksi</h5>
                                <p>Tidak ada data transaksi pada periode yang dipilih</p>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover table-striped">
                                        <thead className="table-primary">
                                            <tr>
                                                <th>Nama Barang</th>
                                                <th>Kode SKU</th>
                                                <th class="text-center">Stok Awal</th>
                                                <th class="text-center">Barang Masuk</th>
                                                <th class="text-center">Barang Keluar</th>
                                                <th class="text-center">Stok Akhir</th>
                                                <th class="text-end">Total Penjualan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <strong>{item.name}</strong>
                                                    </td>
                                                    <td>
                                                        <code>{item.sku_code}</code>
                                                    </td>
                                                    <td class="text-center">{item.initial_stock}</td>
                                                    <td class="text-center text-success fw-bold">
                                                        +{item.stock_in}
                                                    </td>
                                                    <td class="text-center text-danger fw-bold">
                                                        -{item.stock_out}
                                                    </td>
                                                    <td class="text-center fw-bold">
                                                        <span className={
                                                            item.final_stock <= 0 ? 'text-danger' :
                                                            item.final_stock <= 10 ? 'text-warning' : 'text-success'
                                                        }>
                                                            {item.final_stock}
                                                        </span>
                                                    </td>
                                                    <td class="text-end fw-bold text-primary">
                                                        {formatRupiah(item.total_sales)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-active">
                                            <tr>
                                                <td colSpan="3" className="text-end fw-bold">TOTAL:</td>
                                                <td className="text-center fw-bold">{totals.totalStockIn}</td>
                                                <td className="text-center fw-bold">{totals.totalStockOut}</td>
                                                <td></td>
                                                <td className="text-end fw-bold text-success">
                                                    {formatRupiah(totals.totalSales)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                
                                {/* Additional Summary */}
                                <div className="row mt-4">
                                    <div className="col-md-6">
                                        <div className="card bg-light">
                                            <div className="card-body">
                                                <h6>📈 Statistik Tambahan</h6>
                                                <div className="row text-center">
                                                    <div className="col-6">
                                                        <small>Produk dengan Stok Terbanyak</small>
                                                        <div className="fw-bold text-success">
                                                            {reportData.reduce((a, b) => a.final_stock > b.final_stock ? a : b).name}
                                                        </div>
                                                    </div>
                                                    <div className="col-6">
                                                        <small>Produk Paling Banyak Masuk</small>
                                                        <div className="fw-bold text-primary">
                                                            {reportData.reduce((a, b) => a.stock_in > b.stock_in ? a : b).name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card bg-light">
                                            <div className="card-body">
                                                <h6>💡 Analisis</h6>
                                                <small>
                                                    • {totals.totalStockOut} item terjual<br/>
                                                    • Rata-rata {formatRupiah(totals.totalSales / totals.totalStockOut || 0)} per item<br/>
                                                    • {reportData.filter(p => p.final_stock <= 0).length} produk habis
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Report Information */}
            {!reportGenerated && (
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card shadow">
                            <div className="card-header">
                                <h6 className="m-0 font-weight-bold text-primary">
                                    ℹ️ Informasi Laporan
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6>📊 Yang Termasuk dalam Laporan:</h6>
                                        <ul>
                                            <li>Stok awal periode</li>
                                            <li>Barang masuk (pembelian/retur)</li>
                                            <li>Barang keluar (penjualan)</li>
                                            <li>Stok akhir periode</li>
                                            <li>Total nilai penjualan</li>
                                            <li>Analisis produk terlaris</li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <h6>💡 Tips Analisis:</h6>
                                        <ul>
                                            <li>Identifikasi produk terlaris</li>
                                            <li>Monitor stok yang menipis</li>
                                            <li>Analisis trend penjualan</li>
                                            <li>Planning restock berdasarkan data</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;