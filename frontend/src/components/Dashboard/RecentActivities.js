import React from 'react';
import { formatDate } from '../../utils/helpers';

const RecentActivities = ({ activities }) => {
    const displayedActivities = Array.isArray(activities) ? activities : [];

    const capitalize = (s) => {
        if (!s) return s;
        return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const getActivityIcon = (type) => {
        switch (type) {
            case 'sale': return '💰';
            case 'restock': return '📥';
            case 'return': return '↩️';
            default: return '📝';
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'sale': return 'success';
            case 'restock': return 'primary';
            case 'return': return 'warning';
            default: return 'secondary';
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3">
                <h6 className="m-0 font-weight-bold text-primary">
                    Aktivitas Terbaru
                </h6>
            </div>
            <div className="card-body p-0">
                <div className="list-group list-group-flush">
                    {displayedActivities.length === 0 ? (
                        <div className="list-group-item">
                            <div className="small text-muted">Belum ada aktivitas transaksi</div>
                        </div>
                    ) : (
                        displayedActivities.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="list-group-item">
                                <div className="d-flex align-items-start">
                                    <span className={`badge bg-${getActivityColor(activity.type)} me-3 mt-1`}>
                                        {getActivityIcon(activity.type)}
                                    </span>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start">
                                            <h6 className="mb-1">{activity.product || 'Aktivitas tidak lengkap'}</h6>
                                            <small className="text-muted">
                                                {formatDate(activity.timestamp)}
                                            </small>
                                        </div>
                                        <p className="mb-1 small">
                                            {activity.type === 'sale' ? 'Terjual' : 'Restock'} {activity.quantity || 0} pcs
                                        </p>
                                        <small className="text-muted">
                                            Oleh: {activity.user ? capitalize(activity.user) : 'Tidak diketahui'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecentActivities;