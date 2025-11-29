import React, { useState, useEffect } from 'react';
import { productAPI, transactionAPI } from '../../utils/api';
import { formatRupiah, getCategoryLabel, getAnimalTypeLabel } from '../../utils/helpers';
import { toast } from 'react-toastify';

const TransactionForm = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        type: 'out',
        qty: 1,
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });
    const [filters, setFilters] = useState({
        category: '',
        animal_type: '',
        search: ''
    });
    const [transactionHistory, setTransactionHistory] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        loadProducts();
        loadRecentTransactions();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, filters]);

    useEffect(() => {
        // Update selected product when formData.product_id changes
        if (formData.product_id) {
            const product = products.find(p => p.id == formData.product_id);
            setSelectedProduct(product);
        } else {
            setSelectedProduct(null);
        }
    }, [formData.product_id, products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getAll();
            setProducts(data);
        } catch (error) {
            toast.error('Gagal memuat data produk');
        } finally {
            setLoading(false);
        }
    };

    const loadRecentTransactions = async () => {
        try {
            const data = await transactionAPI.getRecentTransactions(10);
            setTransactionHistory(data);
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (filters.category) {
            filtered = filtered.filter(product => product.category === filters.category);
        }

        if (filters.animal_type) {
            filtered = filtered.filter(product => product.animal_type === filters.animal_type);
        }

        if (filters.search) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                product.sku_code.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        setFilteredProducts(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.product_id) {
            toast.error('Pilih produk terlebih dahulu');
            return;
        }

        if (formData.qty <= 0) {
            toast.error('Jumlah harus lebih dari 0');
            return;
        }

        // Validasi stok untuk transaksi keluar
        if (formData.type === 'out' && selectedProduct) {
            if (selectedProduct.current_stock < formData.qty) {
                toast.error(`Stok tidak mencukupi. Stok tersedia: ${selectedProduct.current_stock}`);
                return;
            }
        }

        setSubmitting(true);

        try {
            const response = await transactionAPI.create(formData);
            
            if (response.success) {
                toast.success(`Transaksi ${formData.type === 'in' ? 'masuk' : 'keluar'} berhasil dicatat`);
                
                // Reset form
                setFormData({
                    product_id: '',
                    type: 'out',
                    qty: 1,
                    date: new Date().toISOString().split('T')[0],
                    notes: ''
                });
                setSelectedProduct(null);
                
                // Reload data untuk sync
                await Promise.all([
                    loadProducts(),
                    loadRecentTransactions()
                ]);
                
            } else {
                toast.error(response.message || 'Gagal mencatat transaksi');
            }
            
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error(error.message || 'Gagal mencatat transaksi');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'qty' ? Number(value) : value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProductSelect = (productId) => {
        setFormData(prev => ({
            ...prev,
            product_id: productId
        }));
    };

    // Calculate new stock after transaction
    const getNewStock = () => {
        if (!selectedProduct) return 0;
        return formData.type === 'in' 
            ? selectedProduct.current_stock + formData.qty
            : selectedProduct.current_stock - formData.qty;
    };

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">🔄 Transaksi Stok</h1>
                <small className="text-muted">Kelola stok masuk dan keluar</small>
            </div>

            <div className="row">
                {/* Transaction Form */}
                <div className="col-lg-5">
                    <div className="card shadow mb-4">
                        <div className="card-header bg-primary text-white">
                            <h6 className="m-0 font-weight-bold">
                                📝 Form Transaksi Stok
                            </h6>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Jenis Transaksi *</label>
                                            <select
                                                className="form-select"
                                                name="type"
                                                value={formData.type}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="in">📥 Stok Masuk (Pembelian)</option>
                                                <option value="out">📤 Stok Keluar (Penjualan)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Tanggal *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Jumlah *</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="qty"
                                        value={formData.qty}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Catatan (Opsional)</label>
                                    <textarea
                                        className="form-control"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Contoh: Pembelian dari supplier, penjualan ke customer, dll."
                                    />
                                </div>

                                {selectedProduct && (
                                    <div className="alert alert-info">
                                        <h6>Informasi Stok:</h6>
                                        <div className="row small">
                                            <div className="col-6">
                                                <strong>Produk:</strong><br/>
                                                {selectedProduct.name}
                                            </div>
                                            <div className="col-6">
                                                <strong>SKU:</strong><br/>
                                                {selectedProduct.sku_code}
                                            </div>
                                        </div>
                                        <hr/>
                                        <div className="row small">
                                            <div className="col-4">
                                                <strong>Stok Saat Ini:</strong><br/>
                                                {selectedProduct.current_stock}
                                            </div>
                                            <div className="col-4">
                                                <strong>Transaksi:</strong><br/>
                                                {formData.type === 'in' ? '+' : '-'}{formData.qty}
                                            </div>
                                            <div className="col-4">
                                                <strong>Stok Akhir:</strong><br/>
                                                <span className="fw-bold text-primary">
                                                    {getNewStock()}
                                                </span>
                                            </div>
                                        </div>
                                        {formData.type === 'out' && selectedProduct.current_stock < formData.qty && (
                                            <div className="mt-2 alert alert-warning p-2">
                                                <small>
                                                    ⚠️ Stok tidak mencukupi! Stok tersedia: {selectedProduct.current_stock}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn-success w-100 py-2"
                                    disabled={submitting || !formData.product_id}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        `💾 Simpan Transaksi ${formData.type === 'in' ? 'Masuk' : 'Keluar'}`
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Transaction Information */}
                    <div className="card shadow">
                        <div className="card-header bg-info text-white">
                            <h6 className="m-0 font-weight-bold">
                                ℹ️ Informasi Transaksi
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row text-center">
                                <div className="col-6 mb-3">
                                    <div className="border rounded p-3 bg-light">
                                        <div className="h4 text-success">📥</div>
                                        <h6>Stok Masuk</h6>
                                        <p className="mb-0 small">Penambahan stok dari pembelian atau retur</p>
                                    </div>
                                </div>
                                <div className="col-6 mb-3">
                                    <div className="border rounded p-3 bg-light">
                                        <div className="h4 text-primary">📤</div>
                                        <h6>Stok Keluar</h6>
                                        <p className="mb-0 small">Pengurangan stok dari penjualan</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Selection & History */}
                <div className="col-lg-7">
                    <div className="card shadow mb-4">
                        <div className="card-header bg-secondary text-white">
                            <h6 className="m-0 font-weight-bold">
                                📦 Pilih Produk
                            </h6>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Cari produk..."
                                        name="search"
                                        value={filters.search}
                                        onChange={handleFilterChange}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select form-select-sm"
                                        name="category"
                                        value={filters.category}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Semua Kategori</option>
                                        <option value="dry_food">Makanan Kering</option>
                                        <option value="wet_food">Makanan Basah</option>
                                        <option value="snack">Snack</option>
                                        <option value="sand">Pasir</option>
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select form-select-sm"
                                        name="animal_type"
                                        value={filters.animal_type}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">Semua Hewan</option>
                                        <option value="dog">Anjing</option>
                                        <option value="cat">Kucing</option>
                                        <option value="all">Semua</option>
                                    </select>
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="products-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {loading ? (
                                    <div className="text-center py-4">
                                        <div className="spinner-border text-primary"></div>
                                        <p className="mt-2">Memuat produk...</p>
                                    </div>
                                ) : filteredProducts.length === 0 ? (
                                    <div className="text-center text-muted py-4">
                                        <i className="fas fa-search fa-2x mb-3"></i>
                                        <p>Tidak ada produk yang sesuai dengan filter</p>
                                    </div>
                                ) : (
                                    <div className="row">
                                        {filteredProducts.map((product) => (
                                            <div key={product.id} className="col-md-6 mb-3">
                                                <div 
                                                    className={`card product-card h-100 ${
                                                        formData.product_id == product.id ? 'border-success border-2' : 'border-light'
                                                    }`}
                                                    onClick={() => handleProductSelect(product.id)}
                                                    style={{ 
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <div className="card-body">
                                                        <h6 className="card-title d-flex justify-content-between">
                                                            {product.name}
                                                            {formData.product_id == product.id && (
                                                                <span className="badge bg-success">✓ Terpilih</span>
                                                            )}
                                                        </h6>
                                                        <small className="text-muted d-block mb-2">
                                                            SKU: {product.sku_code}
                                                        </small>
                                                        <small className="d-block mb-2">
                                                            {getCategoryLabel(product.category)} • {getAnimalTypeLabel(product.animal_type)}
                                                        </small>
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className={`badge ${
                                                                product.current_stock === 0 ? 'bg-danger' :
                                                                product.current_stock <= product.min_stock_threshold ? 'bg-warning' : 'bg-success'
                                                            }`}>
                                                                Stok: {product.current_stock}
                                                            </span>
                                                            <span className="badge bg-primary">
                                                                {formatRupiah(product.price_sell)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions History */}
                    <div className="card shadow">
                        <div className="card-header bg-warning text-dark">
                            <h6 className="m-0 font-weight-bold">
                                📋 Riwayat Transaksi Terbaru
                            </h6>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Produk</th>
                                            <th>Jenis</th>
                                            <th>Qty</th>
                                            <th>Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactionHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center py-3 text-muted">
                                                    Belum ada transaksi
                                                </td>
                                            </tr>
                                        ) : (
                                            transactionHistory.map((transaction) => (
                                                <tr key={transaction.id}>
                                                    <td>
                                                        <small>{new Date(transaction.date).toLocaleDateString('id-ID')}</small>
                                                    </td>
                                                    <td>
                                                        <small>{transaction.product_name}</small>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${
                                                            transaction.type === 'in' ? 'bg-success' : 'bg-primary'
                                                        }`}>
                                                            {transaction.type === 'in' ? 'MASUK' : 'KELUAR'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="fw-bold">
                                                            {transaction.type === 'in' ? '+' : '-'}{transaction.qty}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {transaction.notes || '-'}
                                                        </small>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionForm;