import React, { useState } from 'react';
import { toast } from 'react-toastify';

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
        
        // Simulate file processing
        setTimeout(() => {
            toast.success('File berhasil diimport!');
            setLoading(false);
            onSuccess();
        }, 2000);
    };

    const downloadTemplate = () => {
        // Create template data
        const templateData = [
            ['sku_code', 'name', 'category', 'animal_type', 'current_stock', 'min_stock_threshold', 'price_buy', 'price_sell'],
            ['DOG-DRY-001', 'Royal Canin Maxi Adult', 'dry_food', 'dog', '50', '10', '250000', '350000'],
            ['CAT-DRY-001', 'Whiskas Adult 1+', 'dry_food', 'cat', '40', '8', '75000', '95000']
        ];

        const csvContent = templateData.map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = 'template_import_produk.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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
                                                <td>dry_food, wet_food, snack, sand</td>
                                            </tr>
                                            <tr>
                                                <td>animal_type</td>
                                                <td>dog</td>
                                                <td>dog, cat, all</td>
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