import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import CartItem from '../components/Cart/CartItem';
import Loading from '../components/Common/Loading';
import './Cart.css';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      await updateCartItem(itemId, newQuantity);
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
        toast.success('Cart cleared');
      } catch (error) {
        toast.error('Failed to clear cart');
      }
    }
  };

  const proceedToCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (!cart) {
    return <Loading size="large" />;
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {cart.items.length > 0 && (
            <button onClick={handleClearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          )}
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart to get started!</p>
            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              <h2>Cart Items ({cart.total_items})</h2>
              {cart.items.map(item => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                
                <div className="summary-row">
                  <span>Items ({cart.total_items}):</span>
                  <span>₹{cart.total_amount?.toLocaleString()}</span>
                </div>
                
                <div className="summary-row">
                  <span>Delivery:</span>
                  <span>
                    {cart.total_amount >= 500 ? (
                      <span className="free-delivery">FREE</span>
                    ) : (
                      '₹50'
                    )}
                  </span>
                </div>

                {cart.total_amount < 500 && (
                  <div className="delivery-info">
                    <small>
                      Add ₹{(500 - cart.total_amount).toLocaleString()} more for free delivery
                    </small>
                  </div>
                )}
                
                <hr />
                
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{(cart.total_amount + (cart.total_amount >= 500 ? 0 : 50)).toLocaleString()}</span>
                </div>

                <button onClick={proceedToCheckout} className="checkout-btn">
                  Proceed to Checkout
                </button>

                <div className="payment-methods">
                  <small>We accept:</small>
                  <div className="payment-icons">
                    💳 🏦 💰
                  </div>
                </div>
              </div>

              <div className="security-info">
                <div className="security-item">
                  <span>🔒</span>
                  <div>
                    <strong>Secure Checkout</strong>
                    <p>Your data is protected</p>
                  </div>
                </div>
                <div className="security-item">
                  <span>📦</span>
                  <div>
                    <strong>Fast Delivery</strong>
                    <p>Quick and reliable shipping</p>
                  </div>
                </div>
                <div className="security-item">
                  <span>↩️</span>
                  <div>
                    <strong>Easy Returns</strong>
                    <p>30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
