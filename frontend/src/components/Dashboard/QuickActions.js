import React from 'react';

const QuickActions = ({ onAction }) => {
    const actions = [
        {
            id: 'add_product',
            icon: '📦',
            title: 'Tambah Produk',
            description: 'Tambah produk baru ke inventory',
            color: 'primary',
            badge: 'New'
        },
        {
            id: 'quick_sale',
            icon: '💰',
            title: 'Quick Sale',
            description: 'Lakukan penjualan cepat',
            color: 'success',
            badge: 'Hot'
        },
        {
            id: 'view_reports',
            icon: '📊',
            title: 'Lihat Laporan',
            description: 'Analisis performa penjualan',
            color: 'info',
            badge: null
        },
        {
            id: 'check_stock',
            icon: '🔍',
            title: 'Cek Stok',
            description: 'Monitor level stok',
            color: 'warning',
            badge: 'Important'
        }
    ];

    return (
        <div className="row mb-4">
            <div className="col-12">
                <div className="card shadow">
                    <div className="card-header py-3 d-flex justify-content-between align-items-center">
                        <h6 className="m-0 font-weight-bold text-primary">
                            Quick Actions
                        </h6>
                        <small className="text-muted">Akses cepat ke fitur utama</small>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {actions.map((action) => (
                                <div key={action.id} className="col-xl-3 col-md-6 mb-3">
                                    <div 
                                        className={`card action-card border-${action.color} h-100 cursor-pointer`}
                                        onClick={() => onAction(action.id)}
                                        style={{ 
                                            cursor: 'pointer', 
                                            transition: 'all 0.3s ease',
                                            borderWidth: '2px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    >
                                        <div className="card-body text-center p-4">
                                            {action.badge && (
                                                <span className={`badge bg-${action.color} position-absolute top-0 start-50 translate-middle px-2`}>
                                                    {action.badge}
                                                </span>
                                            )}
                                            <div className={`h1 mb-3 text-${action.color}`}>
                                                {action.icon}
                                            </div>
                                            <h6 className="card-title mb-2">{action.title}</h6>
                                            <p className="card-text small text-muted mb-0">
                                                {action.description}
                                            </p>
                                        </div>
                                        <div className={`card-footer bg-${action.color} bg-opacity-10 text-center py-2`}>
                                            <small className={`text-${action.color} fw-bold`}>
                                                Klik untuk membuka →
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickActions;