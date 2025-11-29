import React from 'react';
import { getStockStatus } from '../../utils/helpers';

const StockBadge = ({ currentStock, minThreshold }) => {
    const status = getStockStatus(currentStock, minThreshold);
    
    return (
        <span className={`badge ${status.badgeClass} stock-badge`}>
            {status.text}
        </span>
    );
};

export default StockBadge;