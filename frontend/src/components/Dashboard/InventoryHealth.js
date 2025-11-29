import React from 'react';

const InventoryHealth = ({ healthData }) => {
    const { healthy = 0, lowStock = 0, outOfStock = 0, total = 0, healthPercentage = 100 } = healthData;

    const getHealthColor = (percentage) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'danger';
    };

    const getHealthIcon = (percentage) => {
        if (percentage >= 80) return '💚';
        if (percentage >= 60) return '💛';
        return '❤️';
    };

    const healthColor = getHealthColor(healthPercentage);
    const healthIcon = getHealthIcon(healthPercentage);

    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">
                    🏥 Health Check Inventory
                </h6>
            </div>
            <div className="card-body">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <div className="row text-center">
                            <div className="col-4">
                                <div className="border rounded p-3 bg-success bg-opacity-10">
                                    <div className="h3 text-success mb-1">{healthy}</div>
                                    <small className="text-success">Sehat</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="border rounded p-3 bg-warning bg-opacity-10">
                                    <div className="h3 text-warning mb-1">{lowStock}</div>
                                    <small className="text-warning">Menipis</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="border rounded p-3 bg-danger bg-opacity-10">
                                    <div className="h3 text-danger mb-1">{outOfStock}</div>
                                    <small className="text-danger">Habis</small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 text-center">
                        <div className="position-relative d-inline-block">
                            <div className={`h1 text-${healthColor} mb-2`}>
                                {healthIcon}
                            </div>
                            <div className={`h3 text-${healthColor}`}>
                                {healthPercentage}%
                            </div>
                            <small className="text-muted d-block">Kesehatan Inventory</small>
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="d-flex justify-content-between mb-1">
                        <small>Status Kesehatan</small>
                        <small>{healthPercentage}%</small>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                        <div 
                            className={`progress-bar bg-${healthColor}`}
                            style={{ width: `${healthPercentage}%` }}
                        ></div>
                    </div>
                    <div className="mt-2">
                        <small className="text-muted">
                            {total} total produk • {healthy} sehat • {lowStock} menipis • {outOfStock} habis
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryHealth;