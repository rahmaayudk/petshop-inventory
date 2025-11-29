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
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export const getCategoryLabel = (category) => {
    const categories = {
        'dry_food': 'Makanan Kering',
        'wet_food': 'Makanan Basah',
        'snack': 'Snack',
        'sand': 'Pasir'
    };
    return categories[category] || category;
};

export const getAnimalTypeLabel = (animalType) => {
    const types = {
        'dog': 'Anjing',
        'cat': 'Kucing',
        'all': 'Semua Hewan'
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