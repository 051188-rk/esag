import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import Loading from '../components/Common/Loading';
import LottieAnimation from '../components/Common/LottieAnimation';
import OrderStatusTracker from '../components/Cart/OrderStatusTracker';
import './Orders.css';

const Orders = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const newOrderId = location.state?.newOrderId;

  const { data: orders, isLoading, error } = useQuery(
    'user-orders',
    () => api.get('/orders').then(res => res.data),
    { staleTime: 60000 }
  );

  const cancelMutation = useMutation(
    (orderId) => api.put(`/orders/${orderId}/cancel`),
    {
      onSuccess: () => {
        toast.success("Order cancelled successfully");
        queryClient.invalidateQueries('user-orders');
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to cancel order");
      }
    }
  );

  const handleCancelOrder = (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      cancelMutation.mutate(orderId);
    }
  };
  
  const getStatusColor = (status) => {
    const colors = {
      'placed': '#f59e0b', 'confirmed': '#3b82f6', 'shipped': '#8b5cf6',
      'out_for_delivery': '#10b981', 'delivered': '#059669', 'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (isLoading) return <Loading size="large" />;
  if (error) return <div>Error loading orders.</div>;

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
        </div>

        {newOrderId && (
          <div className="success-message">
            <h3>Order Placed Successfully!</h3>
            <p>You can track its progress below.</p>
          </div>
        )}

        {!orders || orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-animation">
              <LottieAnimation 
                src="https://lottie.host/bb9778c8-85ec-42e7-b223-0ab2047641c0/rT4DDNPHff.lottie"
                style={{ width: '300px', height: '300px' }}
              />
            </div>
            <h2>No orders yet</h2>
            <p>Your order history will appear here</p>
            <Link to="/products" className="start-shopping-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const isCancellable = ['placed', 'confirmed'].includes(order.order_status);
              return (
                <div key={order._id} className={`order-card ${newOrderId === order._id ? 'highlight' : ''}`}>
                  <div className="order-card-header">
                    <div>
                      <h3>Order #{order.order_id}</h3>
                      <p>Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(order.order_status) }}>
                      {order.order_status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="order-items">
                    {order.items.map(item => (
                      <div key={item._id} className="order-item">
                        <img src={item.image_url} alt={item.name} />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity} x ₹{item.price.toLocaleString()}</p>
                        </div>
                        <div className="item-total">₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                  
                  <OrderStatusTracker status={order.order_status} estimatedDeliveryDate={order.estimated_delivery_date} />

                  <div className="order-card-footer">
                    <span>Total: <strong>₹{order.total_amount.toLocaleString()}</strong></span>
                    <div className="order-actions">
                      <Link to={`/orders/${order._id}`} className="details-btn">View Details</Link>
                      {isCancellable && 
                        <button onClick={() => handleCancelOrder(order._id)} disabled={cancelMutation.isLoading} className="cancel-btn">
                          Cancel Order
                        </button>
                      }
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
