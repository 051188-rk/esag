import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Loading from '../Common/Loading';
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

      // Create the order first (payment status will be pending)
      const response = await api.post('/orders', orderData);
      const newOrder = response.data;
      
      if (paymentMethod === 'online') {
        // Redirect to dummy payment page
        navigate(`/payment/${newOrder._id}`, {
          state: { totalAmount: newOrder.total_amount }
        });
      } else {
        // For COD, order is placed directly
        toast.success('Order placed successfully!');
        await clearCart();
        navigate('/orders', { 
          state: { newOrderId: newOrder._id }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container empty-checkout">
          <h2>Your cart is empty</h2>
          <button onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>
        <div className="checkout-layout">
          <div className="checkout-main">
            {/* Shipping Address Section */}
            <div className="checkout-section">
              <h2>Shipping Address</h2>
              <form className="address-form">
                {/* Form groups */}
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" value={shippingAddress.name} onChange={handleAddressChange} required />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} required />
                </div>
                <div className="form-group">
                  <label>Street Address *</label>
                  <input type="text" name="street" value={shippingAddress.street} onChange={handleAddressChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required />
                  </div>
                   <div className="form-group">
                    <label>State *</label>
                    <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} required />
                  </div>
                </div>
                 <div className="form-row">
                   <div className="form-group">
                    <label>Pincode *</label>
                    <input type="text" name="pincode" value={shippingAddress.pincode} onChange={handleAddressChange} maxLength="6" required />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input type="text" name="country" value={shippingAddress.country} readOnly />
                  </div>
                </div>
              </form>
            </div>
            {/* Payment Method Section */}
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                  <div className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`} onClick={() => setPaymentMethod('online')}>
                      <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} readOnly/>
                      <div className="payment-info"><h4>Online Payment</h4><p>UPI, Credit/Debit Card, Net Banking</p></div>
                  </div>
                  <div className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`} onClick={() => setPaymentMethod('cod')}>
                      <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} readOnly/>
                      <div className="payment-info"><h4>Cash on Delivery</h4><p>Pay upon arrival</p></div>
                  </div>
              </div>
            </div>
          </div>
          {/* Order Summary Section */}
          <div className="checkout-aside">
            <div className="checkout-section order-summary">
              <h2>Order Summary</h2>
              <div className="order-items">
                {cart.items.map(item => (
                  <div key={item._id} className="order-item">
                    <img src={item.product.image_url} alt={item.product.name} />
                    <div className="item-details">
                      <h4>{item.product.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-total">₹{(item.price_at_time * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="order-totals">
                <div className="total-row"><span>Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="total-row"><span>Shipping:</span><span>{shippingFee === 0 ? <span className="free">FREE</span> : `₹${shippingFee}`}</span></div>
                {codFee > 0 && <div className="total-row"><span>COD Fee:</span><span>₹{codFee}</span></div>}
                <div className="total-row grand-total"><span>Total:</span><span>₹{total.toLocaleString()}</span></div>
              </div>
              <button onClick={handlePlaceOrder} disabled={isLoading} className="place-order-btn">
                {isLoading ? <Loading size="small" /> : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
