import React, { useState, useEffect } from 'react';
import { productAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import { formatPriceForInput } from '../../utils/helpers';

const ProductForm = ({ product, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        sku_code: '',
        name: '',
        category: 'dry_food',
        animal_type: 'dog',
        current_stock: 0,
        min_stock_threshold: 10,
        price_buy: 0,
        price_sell: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                sku_code: product.sku_code,
                name: product.name,
                category: product.category,
                animal_type: product.animal_type,
                current_stock: product.current_stock,
                min_stock_threshold: product.min_stock_threshold,
                price_buy: product.price_buy,
                price_sell: product.price_sell
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('price') || name.includes('stock')) {
            // Untuk harga dan stok, selalu convert ke number
            const numericValue = value === '' ? 0 : parseInt(value, 10) || 0;
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            // Untuk text biasa
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validasi harga
        if (formData.price_buy <= 0 || formData.price_sell <= 0) {
            toast.error('Harga beli dan harga jual harus lebih dari 0');
            return;
        }
        
        if (formData.price_sell <= formData.price_buy) {
            toast.error('Harga jual harus lebih besar dari harga beli');
            return;
        }

        setLoading(true);

        try {
            const submitData = {
                ...formData,
                // Pastikan harga dalam format number
                price_buy: Number(formData.price_buy),
                price_sell: Number(formData.price_sell)
            };

            if (product) {
                await productAPI.update({ ...submitData, id: product.id });
                toast.success('Produk berhasil diupdate');
            } else {
                await productAPI.create(submitData);
                toast.success('Produk berhasil dibuat');
            }
            onSuccess();
        } catch (error) {
            toast.error(product ? 'Gagal mengupdate produk' : 'Gagal membuat produk');
            console.error('Product form error:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateSKU = () => {
        const categories = {
            dry_food: 'DRY',
            wet_food: 'WET',
            snack: 'SNACK',
            sand: 'SAND'
        };
        
        const animals = {
            dog: 'DOG',
            cat: 'CAT',
            all: 'ALL'
        };

        const categoryCode = categories[formData.category] || 'GEN';
        const animalCode = animals[formData.animal_type] || 'ALL';
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        const newSKU = `${animalCode}-${categoryCode}-${randomNum}`;
        setFormData(prev => ({ ...prev, sku_code: newSKU }));
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {product ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">SKU Code *</label>
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="sku_code"
                                                value={formData.sku_code}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                className="btn btn-outline-secondary"
                                                onClick={generateSKU}
                                                disabled={!!product}
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        <small className="form-text text-muted">
                                            Kode unik untuk produk
                                        </small>
                                    </div>
                                </div>
                                
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Nama Produk *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Kategori *</label>
                                        <select
                                            className="form-select"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="dry_food">Makanan Kering</option>
                                            <option value="wet_food">Makanan Basah</option>
                                            <option value="snack">Snack</option>
                                            <option value="sand">Pasir</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Jenis Hewan *</label>
                                        <select
                                            className="form-select"
                                            name="animal_type"
                                            value={formData.animal_type}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="dog">Anjing</option>
                                            <option value="cat">Kucing</option>
                                            <option value="all">Semua Hewan</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">Stok Saat Ini</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="current_stock"
                                            value={formData.current_stock}
                                            onChange={handleChange}
                                            min="0"
                                        />
                                    </div>
                                </div>
                                
                                <div className="col-md-4">
                                    <div className="mb-3">
                                        <label className="form-label">Batas Stok Minimal</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="min_stock_threshold"
                                            value={formData.min_stock_threshold}
                                            onChange={handleChange}
                                            min="1"
                                        />
                                        <small className="form-text text-muted">
                                            Akan muncul peringatan jika stok ≤ batas ini
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Harga Beli *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price_buy"
                                            value={formData.price_buy}
                                            onChange={handleChange}
                                            min="1"
                                            step="1"
                                            required
                                            placeholder="Contoh: 15000"
                                        />
                                        <small className="form-text text-muted">
                                            Harga beli dari supplier (tanpa titik/koma)
                                        </small>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="mb-3">
                                        <label className="form-label">Harga Jual *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="price_sell"
                                            value={formData.price_sell}
                                            onChange={handleChange}
                                            min="1"
                                            step="1"
                                            required
                                            placeholder="Contoh: 20000"
                                        />
                                        <small className="form-text text-muted">
                                            Harga jual ke customer (tanpa titik/koma)
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Harga */}
                            {(formData.price_buy > 0 || formData.price_sell > 0) && (
                                <div className="row">
                                    <div className="col-12">
                                        <div className="alert alert-info">
                                            <h6>Preview Harga:</h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <strong>Harga Beli:</strong> {formatPriceForInput(formData.price_buy)}
                                                </div>
                                                <div className="col-md-6">
                                                    <strong>Harga Jual:</strong> {formatPriceForInput(formData.price_sell)}
                                                </div>
                                            </div>
                                            {formData.price_buy > 0 && formData.price_sell > 0 && (
                                                <div className="mt-2">
                                                    <strong>Margin:</strong> {((formData.price_sell - formData.price_buy) / formData.price_buy * 100).toFixed(1)}%
                                                    ({formatPriceForInput(formData.price_sell - formData.price_buy)})
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={onClose}
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Menyimpan...
                                    </>
                                ) : (
                                    product ? 'Update Produk' : 'Simpan Produk'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;