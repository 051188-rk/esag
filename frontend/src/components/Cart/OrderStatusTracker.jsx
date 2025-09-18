import React from 'react';
import './OrderStatusTracker.css';

const OrderStatusTracker = ({ status, estimatedDeliveryDate }) => {
    const statuses = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentStatusIndex = statuses.indexOf(status);

    const getStatusLabel = (s) => {
        return s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    return (
        <div className="status-tracker-container">
            <div className="status-tracker">
                {statuses.map((s, index) => (
                    <div key={s} className={`status-node ${index <= currentStatusIndex ? 'completed' : ''}`}>
                        <div className="status-dot"></div>
                        <div className="status-label">{getStatusLabel(s)}</div>
                    </div>
                ))}
                <div className="status-progress-bar">
                    <div className="status-progress" style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}></div>
                </div>
            </div>
            {estimatedDeliveryDate && status !== 'delivered' && status !== 'cancelled' &&
                <div className="delivery-date">
                    Estimated Delivery: <strong>{new Date(estimatedDeliveryDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                </div>
            }
        </div>
    );
};

export default OrderStatusTracker;
