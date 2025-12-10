import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { exportInventoryTemplate } from '../../utils/helpers';
import * as XLSX from 'xlsx';
import api from '../../utils/api';

const ImportExcel = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const validTypes = ['.xlsx', '.xls', '.csv'];
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            
            if (!validTypes.includes(`.${fileExtension}`)) {
                toast.error('Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv');
                return;
            }
            
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file) {
            toast.error('Pilih file terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const json = XLSX.utils.sheet_to_json(ws, { defval: '' });

                // Map/normalize rows to product fields with tolerant header matching
                const normalizeKey = (k) => {
                    if (!k) return '';
                    return k.toString().trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                };

                const aliasMap = {
                    sku: 'sku_code', sku_code: 'sku_code', kode_sku: 'sku_code', kodeproduk: 'sku_code', kode_produk: 'sku_code',
                    name: 'name', nama: 'name', product_name: 'name', productname: 'name',
                    category: 'category', kategori: 'category', kategori_produk: 'category',
                    animal_type: 'animal_type', animaltype: 'animal_type', 'animal_type': 'animal_type', jenis_hewan: 'animal_type', 'animal type': 'animal_type',
                    current_stock: 'current_stock', stock: 'current_stock', jumlah: 'current_stock', jumlah_stok: 'current_stock',
                    min_stock_threshold: 'min_stock_threshold', min_stock: 'min_stock_threshold', minstok: 'min_stock_threshold',
                    price_buy: 'price_buy', harga_beli: 'price_buy', beli: 'price_buy',
                    price_sell: 'price_sell', harga_jual: 'price_sell', jual: 'price_sell'
                };

                const mapRow = (row) => {
                    const mapped = {
                        sku_code: '', name: '', category: '', animal_type: '', current_stock: 0, min_stock_threshold: 0, price_buy: 0, price_sell: 0
                    };

                    Object.keys(row).forEach((rawKey) => {
                        const key = normalizeKey(rawKey);
                        let target = aliasMap[key] || null;
                        // fallback: substring matching for common words
                        if (!target) {
                            if (key.includes('sku')) target = 'sku_code';
                            else if (key.includes('nama') || key.includes('name') || key.includes('product')) target = 'name';
                            else if (key.includes('kategori') || key.includes('category')) target = 'category';
                            else if (key.includes('hewan') || key.includes('animal') || key.includes('jenis')) target = 'animal_type';
                            else if (key === 'stok' || key.includes('stock') || key.includes('jumlah')) target = 'current_stock';
                            else if (key.includes('min') && key.includes('stok')) target = 'min_stock_threshold';
                            else if (key.includes('min_stock') || key.includes('minstok') || key.includes('min_stock_threshold')) target = 'min_stock_threshold';
                            else if (key.includes('harga') && key.includes('beli')) target = 'price_buy';
                            else if (key.includes('harga') && key.includes('jual')) target = 'price_sell';
                            else if (key.includes('beli')) target = 'price_buy';
                            else if (key.includes('jual')) target = 'price_sell';
                        }

                        if (!target) return;
                        let val = row[rawKey];
                        if (typeof val === 'string') val = val.trim();
                        mapped[target] = val;
                    });

                    // coerce numeric fields
                    const parseNumber = (v) => {
                        if (v === null || v === undefined || v === '') return 0;
                        // convert numbers with thousand separators like '30.000' or '30,000' to numeric
                        let s = String(v).toString().trim();
                        // remove non-digit except dot and comma and minus
                        // handle cases where dot is thousand separator: remove dots, replace comma with dot
                        s = s.replace(/\./g, '');
                        s = s.replace(/,/g, '.');
                        const n = parseFloat(s);
                        return Number.isFinite(n) ? n : 0;
                    };

                    mapped.current_stock = parseNumber(mapped.current_stock);
                    mapped.min_stock_threshold = parseNumber(mapped.min_stock_threshold);
                    mapped.price_buy = parseNumber(mapped.price_buy);
                    mapped.price_sell = parseNumber(mapped.price_sell);

                    // Normalize category and animal_type values to expected internal codes
                    const normalizeCategory = (v) => {
                        if (!v && v !== 0) return '';
                        const s = String(v).toLowerCase().trim();
                        if (!s) return '';
                        // common mappings (indonesia + english)
                        if (['dry_food','dry food','makanan_kering','makanan kering','dry'].includes(s)) return 'makanan_kering';
                        if (['wet_food','wet food','makanan_basah','makanan basah','wet'].includes(s)) return 'makanan_basah';
                        if (['snack','snacks','cemilan'].includes(s)) return 'snack';
                        if (['sand','pasir','pasir_kucing','pasir kucing'].includes(s)) return 'pasir';
                        if (['barang','barang umum','barang-umum','general','item','barang lainnya'].includes(s)) return 'barang';
                        // user supplied "all" variants
                        if (s.includes('semua') || s === 'all' || s === 'semua_kategori' || s === 'semua-kategori') return 'makanan_kering';
                        // fallback: return original trimmed value
                        return s;
                    };

                    const normalizeAnimal = (v) => {
                        if (!v && v !== 0) return 'semua';
                        const s = String(v).toLowerCase().trim();
                        if (!s) return 'semua';
                        if (['dog','anjing'].includes(s)) return 'anjing';
                        if (['cat','kucing'].includes(s)) return 'kucing';
                        if (s === 'all' || s.includes('semua') || s === 'semua_hewan' || s === 'semua-hewan') return 'semua';
                        return s;
                    };

                    mapped.category = normalizeCategory(mapped.category);
                    mapped.animal_type = normalizeAnimal(mapped.animal_type);

                    return mapped;
                };

                const products = json.map(mapRow);

                // filter out empty rows
                const filtered = products.filter(p => p.sku_code && p.name);
                console.log('Parsed rows:', json.length, 'Mapped valid rows:', filtered.length, { products, filtered });
                if (filtered.length === 0) {
                    toast.error('Tidak ada data produk valid di file');
                    setLoading(false);
                    return;
                }

                try {
                    const res = await api.post('/products', filtered);
                    console.log('Import response', res);
                    // res expected to be { created, failed, errors }
                    if (res && typeof res.created !== 'undefined') {
                        if (res.created > 0) {
                            toast.success(`Import selesai: ${res.created} dibuat, ${res.failed} gagal`);
                        } else {
                            toast.error(`Tidak ada baris berhasil diimport. ${res.failed} gagal`);
                        }
                        if (res.errors && res.errors.length > 0) console.warn('Import errors', res.errors);
                    } else {
                        toast.success('File berhasil diimport!');
                    }
                    onSuccess();
                } catch (err) {
                    console.error('Import failed', err);
                    toast.error('Gagal mengimpor data. Periksa file dan coba lagi.');
                } finally {
                    setLoading(false);
                }
            };
            reader.readAsBinaryString(file);
        } catch (err) {
            console.error(err);
            toast.error('Terjadi kesalahan saat membaca file');
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        try {
            exportInventoryTemplate('template_import_produk.xlsx');
        } catch (err) {
            console.error('Error generating template:', err);
            toast.error('Gagal membuat template. Pastikan package "xlsx" sudah terinstall.');
        }
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">📤 Import Data dari Excel</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="alert alert-info">
                                <h6>📋 Format File yang Didukung:</h6>
                                <ul className="mb-0">
                                    <li>Excel (.xlsx, .xls)</li>
                                    <li>CSV (.csv)</li>
                                </ul>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Pilih File</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={handleFileChange}
                                    disabled={loading}
                                />
                                <small className="form-text text-muted">
                                    Maksimal ukuran file: 5MB
                                </small>
                            </div>

                            {file && (
                                <div className="alert alert-success">
                                    <strong>File terpilih:</strong> {file.name}
                                    <br />
                                    <small>Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB</small>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={downloadTemplate}
                                >
                                    📥 Download Template
                                </button>
                            </div>

                            <div className="mt-3">
                                <h6>📝 Struktur Kolom:</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Kolom</th>
                                                <th>Contoh</th>
                                                <th>Keterangan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>sku_code</td>
                                                <td>DOG-DRY-001</td>
                                                <td>Kode unik produk</td>
                                            </tr>
                                            <tr>
                                                <td>name</td>
                                                <td>Royal Canin Maxi Adult</td>
                                                <td>Nama produk</td>
                                            </tr>
                                            <tr>
                                                <td>category</td>
                                                <td>dry_food</td>
                                                <td>dry_food, wet_food, snack, sand, barang, all</td>
                                            </tr>
                                            <tr>
                                                <td>animal_type</td>
                                                <td>dog</td>
                                                <td>dog, cat, all (atau "semua hewan")</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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
                                className="btn btn-petshop"
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Mengimport...
                                    </>
                                ) : (
                                    'Import Data'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ImportExcel;