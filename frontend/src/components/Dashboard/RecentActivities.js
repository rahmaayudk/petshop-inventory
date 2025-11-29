import React from 'react';
import { formatDate } from '../../utils/helpers';

const RecentActivities = ({ activities }) => {
    const sampleActivities = [
        {
            id: 1,
            type: 'sale',
            product: 'Royal Canin Maxi Adult',
            quantity: 2,
            amount: 700000,
            timestamp: new Date().toISOString(),
            user: 'Admin'
        },
        {
            id: 2,
            type: 'restock',
            product: 'Whiskas Adult 1+',
            quantity: 50,
            amount: 3750000,
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
        },
        {
            id: 3,
            type: 'sale',
            product: 'Pedigree Wet Food',
            quantity: 5,
            amount: 125000,
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            user: 'Admin'
        }
    ];

    const displayedActivities = activities.length > 0 ? activities : sampleActivities;

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
                    📝 Aktivitas Terbaru
                </h6>
            </div>
            <div className="card-body p-0">
                <div className="list-group list-group-flush">
                    {displayedActivities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="list-group-item">
                            <div className="d-flex align-items-start">
                                <span className={`badge bg-${getActivityColor(activity.type)} me-3 mt-1`}>
                                    {getActivityIcon(activity.type)}
                                </span>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="mb-1">{activity.product}</h6>
                                        <small className="text-muted">
                                            {formatDate(activity.timestamp)}
                                        </small>
                                    </div>
                                    <p className="mb-1 small">
                                        {activity.type === 'sale' ? 'Terjual' : 'Restock'} {activity.quantity} pcs
                                    </p>
                                    <small className="text-muted">
                                        Oleh: {activity.user}
                                    </small>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RecentActivities;