import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loading from '../Common/Loading'; // Corrected import path
import './Checkout.css';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    pincode: user?.address?.pincode || '',
    country: user?.address?.country || 'India'
  });

  const subtotal = cart?.total_amount || 0;
  const shippingFee = subtotal >= 500 ? 0 : 50;
  const codFee = paymentMethod === 'cod' ? 25 : 0;
  const total = subtotal + shippingFee + codFee;

  const handleAddressChange = (e) => {
    setShippingAddress(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateAddress = () => {
    const required = ['name', 'phone', 'street', 'city', 'state', 'pincode'];
    for (let field of required) {
      if (!shippingAddress[field]?.trim()) {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    if (shippingAddress.pincode.length !== 6 || !/^\d{6}$/.test(shippingAddress.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    
    if (!/^\d{10}$/.test(shippingAddress.phone.replace(/[^\d]/g, ''))) {
      toast.error('Please enter a valid 10-digit phone number');
      return false;
    }
    
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!validateAddress()) {
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      };

      const response = await api.post('/orders', orderData);
      
      toast.success('Order placed successfully!');
      await clearCart();
      navigate('/orders', { 
        state: { newOrderId: response.data._id }
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <h2>Your cart is empty</h2>
            <p>Add some products to proceed with checkout.</p>
            <button onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-layout">
          {/* Shipping Address */}
          <div className="checkout-section">
            <h2>Shipping Address</h2>
            <div className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleAddressChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleAddressChange}
                  placeholder="House/Flat no, Building, Street"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleAddressChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleAddressChange}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h2>Payment Method</h2>
            <div className="payment-methods">
              <div 
                className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('online')}
              >
                <div className="payment-radio">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                </div>
                <div className="payment-info">
                  <h4>Online Payment</h4>
                  <p>Pay securely using UPI, Credit/Debit Card, Net Banking</p>
                  <div className="payment-icons">💳 🏦 📱</div>
                </div>
              </div>

              <div 
                className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="payment-radio">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                </div>
                <div className="payment-info">
                  <h4>Cash on Delivery</h4>
                  <p>Pay when your order arrives (Additional ₹25 fee)</p>
                  <div className="cod-fee">Extra fee: ₹25</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-section order-summary">
            <h2>Order Summary</h2>
            
            <div className="order-items">
              {cart.items.map(item => (
                <div key={item._id} className="order-item">
                  <img 
                    src={item.product.image_url} 
                    alt={item.product.name}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/60x60?text=No+Image';
                    }}
                  />
                  <div className="item-details">
                    <h4>{item.product.name}</h4>
                    <p>Qty: {item.quantity} × ₹{item.price_at_time?.toLocaleString()}</p>
                    {item.selected_color && <span>Color: {item.selected_color}</span>}
                    {item.selected_size && <span>Size: {item.selected_size}</span>}
                  </div>
                  <div className="item-total">
                    ₹{(item.price_at_time * item.quantity)?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal ({cart.total_items} items):</span>
                <span>₹{subtotal?.toLocaleString()}</span>
              </div>
              
              <div className="total-row">
                <span>Shipping:</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="free">FREE</span>
                  ) : (
                    `₹${shippingFee}`
                  )}
                </span>
              </div>

              {codFee > 0 && (
                <div className="total-row">
                  <span>COD Fee:</span>
                  <span>₹{codFee}</span>
                </div>
              )}

              <div className="total-row grand-total">
                <span>Total:</span>
                <span>₹{total?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="place-order-btn"
            >
              {isLoading ? (
                <>
                  <Loading size="small" />
                  Processing...
                </>
              ) : (
                `Place Order - ₹${total?.toLocaleString()}`
              )}
            </button>

            <div className="checkout-security">
              <div className="security-badges">
                <span>🔒 Secure Checkout</span>
                <span>📞 24/7 Support</span>
                <span>↩️ Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;