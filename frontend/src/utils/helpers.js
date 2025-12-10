export const formatRupiah = (number) => {
    if (number === null || number === undefined) return 'Rp 0';
    
    // Convert to number jika string
    const num = typeof number === 'string' ? parseFloat(number) : number;
    
    if (isNaN(num)) return 'Rp 0';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(num);
};

// Helper untuk input harga - hapus semua karakter non-digit
export const formatPriceInput = (value) => {
    if (!value && value !== 0) return '';
    // Hapus semua karakter non-digit
    const numbers = value.toString().replace(/\D/g, '');
    return numbers ? parseInt(numbers) : '';
};

// Helper untuk display harga di input - sama dengan formatPriceInput
export const formatPriceForInput = (value) => {
    if (!value && value !== 0) return '';
    // Hapus semua karakter non-digit
    const numbers = value.toString().replace(/\D/g, '');
    return numbers ? numbers : '';
};

// Helper untuk parse harga dari input
export const parsePriceInput = (value) => {
    if (!value) return 0;
    const numbers = value.toString().replace(/\D/g, '');
    return numbers ? parseInt(numbers) : 0;
};

export const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ada tanggal';

    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Tidak ada tanggal';

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    // Example: "3 Desember 2025 18:30"
    return d.toLocaleString('id-ID', options).replace(',', '');
};

export const getCategoryLabel = (category) => {
    const categories = {
        'makanan_kering': 'Makanan Kering',
        'makanan_basah': 'Makanan Basah',
        'snack': 'Snack',
        'pasir': 'Pasir',
        'barang': 'Barang'
    };
    return categories[category] || category;
};

export const getAnimalTypeLabel = (animalType) => {
    const types = {
        'anjing': 'Anjing',
        'kucing': 'Kucing',
        'semua': 'Semua Hewan'
    };
    return types[animalType] || animalType;
};

export const getStockStatus = (currentStock, minThreshold) => {
    if (currentStock <= 0) {
        return {
            status: 'danger',
            text: 'HABIS',
            color: '#dc3545',
            badgeClass: 'bg-danger'
        };
    } else if (currentStock <= minThreshold) {
        return {
            status: 'warning',
            text: 'RESTOCK',
            color: '#ffc107',
            badgeClass: 'bg-warning'
        };
    } else {
        return {
            status: 'success',
            text: 'AMAN',
            color: '#28a745',
            badgeClass: 'bg-success'
        };
    }
};

export const exportToExcel = (data, filename) => {
    // Simple CSV export
    const headers = Object.keys(data[0] || {});
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Export a nicely formatted Excel template for Inventory import
export const exportInventoryTemplate = (filename = 'template_import_produk.xlsx') => {
    // lazy require to avoid bundling if not used
    // require is supported in CRA for dynamic import of xlsx
    const XLSX = require('xlsx');

    const headers = ['SKU', 'Nama Produk', 'Kategori', 'Hewan', 'Stok', 'Min Stok', 'Harga Beli', 'Harga Jual', 'Status'];

    const sampleRows = [
        ['PSR-EQQ-001', 'Pasir Kucing', 'sand', 'cat', 5, 5, 30000, 40000, 'RESTOCK'],
        ['DOG-DRY-001', 'Royal Canin Maxi Adult', 'dry_food', 'dog', 52, 10, 250000, 325000, 'AMAN']
    ];

    const aoa = [headers, ...sampleRows];

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Set column widths to make it look tidy
    ws['!cols'] = [
        { wch: 15 }, // SKU
        { wch: 30 }, // Name
        { wch: 15 }, // Category
        { wch: 10 }, // Animal
        { wch: 8 },  // Stock
        { wch: 10 }, // Min Stock
        { wch: 15 }, // Price Buy
        { wch: 15 }, // Price Sell
        { wch: 12 }  // Status
    ];

    // Apply number / currency formats to price columns and numeric columns
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        // Stok (col E -> index 4)
        const stokCell = ws[XLSX.utils.encode_cell({ r: R, c: 4 })];
        if (stokCell) stokCell.t = 'n';

        // Min stok (col F -> index 5)
        const minCell = ws[XLSX.utils.encode_cell({ r: R, c: 5 })];
        if (minCell) minCell.t = 'n';

        // Harga Beli (col G -> index 6)
        const buyCell = ws[XLSX.utils.encode_cell({ r: R, c: 6 })];
        if (buyCell) { buyCell.t = 'n'; buyCell.z = '#,##0'; }

        // Harga Jual (col H -> index 7)
        const sellCell = ws[XLSX.utils.encode_cell({ r: R, c: 7 })];
        if (sellCell) { sellCell.t = 'n'; sellCell.z = '#,##0'; }
    }

    // Add a small note row at top (optional)
    // Create workbook and download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Produk');

    // Write file
    XLSX.writeFile(wb, filename);
};

// Export report as a nicely formatted Excel (.xlsx)
export const exportReportExcel = (reportData, dateRange, totals, filename = null) => {
    const XLSX = require('xlsx');

    const title = 'Laporan Penjualan';
    const period = `Periode: ${new Date(dateRange.start_date).toLocaleDateString('id-ID')} - ${new Date(dateRange.end_date).toLocaleDateString('id-ID')}`;

    const summary = [
        ['Total Barang Masuk', totals.totalStockIn],
        ['Total Barang Keluar', totals.totalStockOut],
        ['Jumlah Produk', totals.totalProducts],
        ['Total Penjualan (Rp)', totals.totalSales]
    ];

    const headers = ['Nama Barang','Kode SKU','Stok Awal','Barang Masuk','Barang Keluar','Stok Akhir','Total Penjualan'];

    const rows = reportData.map(item => ([
        item.name,
        item.sku_code,
        Number(item.initial_stock) || 0,
        Number(item.stock_in) || 0,
        Number(item.stock_out) || 0,
        Number(item.final_stock) || 0,
        Number(item.total_sales) || 0
    ]));

    // Build an array-of-arrays for the sheet
    const aoa = [];
    aoa.push([title]);
    aoa.push([period]);
    aoa.push([]);
    // summary rows
    summary.forEach(s => aoa.push(s));
    aoa.push([]);
    // header - THIS IS AT INDEX 8 (0-based)
    aoa.push(headers);
    // data rows
    rows.forEach(r => aoa.push(r));
    aoa.push([]);
    aoa.push(['TOTAL:', '', '', totals.totalStockIn, totals.totalStockOut, '', totals.totalSales]);

    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // set column widths
    ws['!cols'] = [
        { wch: 30 }, // name
        { wch: 15 }, // sku
        { wch: 10 }, // stok awal
        { wch: 12 }, // masuk
        { wch: 12 }, // keluar
        { wch: 12 }, // akhir
        { wch: 18 }  // total
    ];

    // apply number formats for numeric columns and styling
    const range = XLSX.utils.decode_range(ws['!ref']);
    const headerRowIndex = 8; // header row is at row index 8 (0-based: title, period, empty, 4 summary, empty = 7 rows before header)
    
    for (let R = 0; R <= range.e.r; ++R) {
        for (let C = 0; C <= range.e.c; ++C) {
            const cell_address = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[cell_address];
            if (!cell) continue;
            
            // Style header row (bold, yellow background) - KEEP AS TEXT
            if (R === headerRowIndex) {
                cell.s = {
                    font: { bold: true, color: { rgb: 'FFFFFF' } },
                    fill: { fgColor: { rgb: 'FFFF00' } },
                    alignment: { horizontal: 'center', vertical: 'center' }
                };
                // Ensure header cells are TEXT, not numbers
                cell.t = 's';
            }
            
            // Format numeric columns (only data rows, NOT header)
            if (R > headerRowIndex && C >= 2 && C <= 6) {
                if (cell.v !== undefined && cell.v !== null) {
                    // Ensure it's a number type
                    cell.t = 'n';
                    if (C === 6) {
                        // Apply currency format for total sales column
                        cell.z = '#,##0';
                    } else {
                        // Apply number format for quantities
                        cell.z = '0';
                    }
                }
            }
        }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');

    const outName = filename || `laporan_penjualan_${dateRange.start_date}_${dateRange.end_date}.xlsx`;
    XLSX.writeFile(wb, outName);
};