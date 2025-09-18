import React from 'react';
import { useQuery } from 'react-query';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Loading from '../components/Common/Loading';
import './Orders.css';

const Orders = () => {
  const location = useLocation();
  const newOrderId = location.state?.newOrderId;

  const { data: orders, isLoading, error } = useQuery(
    'user-orders',
    () => api.get('/orders').then(res => res.data),
    { staleTime: 300000 }
  );

  const getStatusColor = (status) => {
    const colors = {
      'placed': '#f59e0b',
      'confirmed': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'pending': '#f59e0b',
      'paid': '#059669',
      'failed': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  if (isLoading) return <Loading size="large" />;

  if (error) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="error-container">
            <h2>Error loading orders</h2>
            <p>Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <Link to="/products" className="continue-shopping-btn">
            Continue Shopping
          </Link>
        </div>

        {newOrderId && (
          <div className="success-message">
            <div className="success-icon">✅</div>
            <div>
              <h3>Order Placed Successfully!</h3>
              <p>Your order has been placed and is being processed.</p>
            </div>
          </div>
        )}

        {!orders || orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h2>No orders yet</h2>
            <p>When you place your first order, it will appear here.</p>
            <Link to="/products" className="start-shopping-btn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div
                key={order._id}
                className={`order-card ${newOrderId === order._id ? 'highlight' : ''}`}
              >
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.order_id}</h3>
                    <p className="order-date">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.order_status) }}
                    >
                      {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                    </span>
                    <span
                      className="payment-status"
                      style={{ color: getPaymentStatusColor(order.payment_status) }}
                    >
                      Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  {order.items.map(item => (
                    <div key={item._id} className="order-item">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        {item.selected_color && (
                          <span className="item-variant">Color: {item.selected_color}</span>
                        )}
                        {item.selected_size && (
                          <span className="item-variant">Size: {item.selected_size}</span>
                        )}
                        <div className="item-price">
                          Qty: {item.quantity} × ₹{item.price?.toLocaleString()}
                        </div>
                      </div>
                      <div className="item-total">
                        ₹{(item.price * item.quantity)?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-summary">
                  <div className="summary-details">
                    <div className="payment-method">
                      <strong>Payment:</strong> {
                        order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'
                      }
                    </div>
                    <div className="delivery-address">
                      <strong>Delivery to:</strong> {order.shipping_address.name}, {order.shipping_address.city}
                    </div>
                  </div>
                  <div className="order-total">
                    <div className="total-breakdown">
                      <div>Subtotal: ₹{order.subtotal?.toLocaleString()}</div>
                      {order.shipping_fee > 0 && (
                        <div>Shipping: ₹{order.shipping_fee}</div>
                      )}
                      {order.cod_fee > 0 && (
                        <div>COD Fee: ₹{order.cod_fee}</div>
                      )}
                    </div>
                    <div className="total-amount">
                      Total: ₹{order.total_amount?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="order-actions">
                  <Link to={`/orders/${order._id}`} className="view-details-btn">
                    View Details
                  </Link>
                  {order.order_status === 'delivered' && (
                    <button className="reorder-btn">
                      Reorder Items
                    </button>
                  )}
                  {order.order_status === 'placed' && (
                    <button className="cancel-order-btn">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;