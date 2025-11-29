import React, { useState, useEffect } from 'react';
import { productAPI } from '../../utils/api';
import { 
    formatRupiah, 
    getCategoryLabel, 
    getAnimalTypeLabel,
    getStockStatus 
} from '../../utils/helpers';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import StockBadge from '../../components/Common/StockBadge';
import ProductForm from './ProductForm';
import ImportExcel from './ImportExcel';
import ConfirmModal from '../../components/Common/ConfirmModal';
import { toast } from 'react-toastify';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filter, setFilter] = useState({
        category: '',
        animal_type: '',
        search: ''
    });

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productAPI.getAll();
            setProducts(data);
        } catch (error) {
            toast.error('Gagal memuat data produk');
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedProduct(null);
        setShowForm(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowForm(true);
    };

    const handleDelete = (product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await productAPI.delete(selectedProduct.id);
            toast.success('Produk berhasil dihapus');
            loadProducts();
            setShowDeleteModal(false);
            setSelectedProduct(null);
        } catch (error) {
            toast.error('Gagal menghapus produk');
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setSelectedProduct(null);
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedProduct(null);
        loadProducts();
    };

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesCategory = !filter.category || product.category === filter.category;
        const matchesAnimalType = !filter.animal_type || product.animal_type === filter.animal_type;
        const matchesSearch = !filter.search || 
            product.name.toLowerCase().includes(filter.search.toLowerCase()) ||
            product.sku_code.toLowerCase().includes(filter.search.toLowerCase());
        
        return matchesCategory && matchesAnimalType && matchesSearch;
    });

    if (loading) {
        return <LoadingSpinner text="Memuat data produk..." />;
    }

    return (
        <div className="fade-in">
            <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 className="h2">📦 Manajemen Inventory</h1>
                <div className="btn-toolbar mb-2 mb-md-0">
                    <button 
                        className="btn btn-sm btn-outline-success me-2"
                        onClick={() => setShowImport(true)}
                    >
                        📤 Import Excel
                    </button>
                    <button 
                        className="btn btn-sm btn-petshop"
                        onClick={handleCreate}
                    >
                        ➕ Tambah Produk
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Cari produk..."
                        value={filter.search}
                        onChange={(e) => setFilter({...filter, search: e.target.value})}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={filter.category}
                        onChange={(e) => setFilter({...filter, category: e.target.value})}
                    >
                        <option value="">Semua Kategori</option>
                        <option value="dry_food">Makanan Kering</option>
                        <option value="wet_food">Makanan Basah</option>
                        <option value="snack">Snack</option>
                        <option value="sand">Pasir</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={filter.animal_type}
                        onChange={(e) => setFilter({...filter, animal_type: e.target.value})}
                    >
                        <option value="">Semua Hewan</option>
                        <option value="dog">Anjing</option>
                        <option value="cat">Kucing</option>
                        <option value="all">Semua</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <button 
                        className="btn btn-outline-secondary w-100"
                        onClick={() => setFilter({ category: '', animal_type: '', search: '' })}
                    >
                        🔄 Reset Filter
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="card shadow">
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>SKU</th>
                                    <th>Nama Produk</th>
                                    <th>Kategori</th>
                                    <th>Hewan</th>
                                    <th>Stok</th>
                                    <th>Harga Beli</th>
                                    <th>Harga Jual</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-4">
                                            <div className="text-muted">
                                                {products.length === 0 
                                                    ? "Belum ada produk. Tambah produk pertama Anda!" 
                                                    : "Tidak ada produk yang sesuai dengan filter."
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <code>{product.sku_code}</code>
                                            </td>
                                            <td>
                                                <strong>{product.name}</strong>
                                            </td>
                                            <td>{getCategoryLabel(product.category)}</td>
                                            <td>{getAnimalTypeLabel(product.animal_type)}</td>
                                            <td>
                                                <span className={getStockStatus(product.current_stock, product.min_stock_threshold).status}>
                                                    {product.current_stock}
                                                </span>
                                            </td>
                                            <td>{formatRupiah(product.price_buy)}</td>
                                            <td>
                                                <strong>{formatRupiah(product.price_sell)}</strong>
                                            </td>
                                            <td>
                                                <StockBadge 
                                                    currentStock={product.current_stock}
                                                    minThreshold={product.min_stock_threshold}
                                                />
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => handleEdit(product)}
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(product)}
                                                        title="Hapus"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Summary */}
                    <div className="row mt-3">
                        <div className="col-md-6">
                            <small className="text-muted">
                                Menampilkan {filteredProducts.length} dari {products.length} produk
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showForm && (
                <ProductForm
                    product={selectedProduct}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}

            {showImport && (
                <ImportExcel
                    onClose={() => setShowImport(false)}
                    onSuccess={loadProducts}
                />
            )}

            <ConfirmModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Produk"
                message={`Apakah Anda yakin ingin menghapus produk "${selectedProduct?.name}"?`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="danger"
            />
        </div>
    );
};

export default ProductList;