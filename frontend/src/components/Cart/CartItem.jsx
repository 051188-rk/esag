import React from 'react';
import { Link } from 'react-router-dom';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      onRemove(item._id);
    } else {
      onUpdateQuantity(item._id, newQuantity);
    }
  };

  const itemTotal = item.price_at_time * item.quantity;

  return (
    <div className="cart-item">
      <div className="item-image">
        <Link to={`/product/${item.product._id}`}>
          <img 
            src={item.product.image_url} 
            alt={item.product.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
            }}
          />
        </Link>
      </div>

      <div className="item-details">
        <Link to={`/product/${item.product._id}`} className="item-name">
          {item.product.name}
        </Link>
        
        <div className="item-meta">
          <span className="item-brand">{item.product.brand}</span>
          {item.selected_color && (
            <span className="item-variant">Color: {item.selected_color}</span>
          )}
          {item.selected_size && (
            <span className="item-variant">Size: {item.selected_size}</span>
          )}
        </div>

        <div className="item-price">
          <span className="unit-price">₹{item.price_at_time?.toLocaleString()} each</span>
          {item.product.price !== item.price_at_time && (
            <span className="price-change">
              Current: ₹{item.product.price?.toLocaleString()}
            </span>
          )}
        </div>

        <div className="item-stock-info">
          {item.product.stock_quantity <= 10 && item.product.stock_quantity > 0 && (
            <span className="low-stock">Only {item.product.stock_quantity} left!</span>
          )}
          {item.product.stock_quantity === 0 && (
            <span className="out-of-stock">Out of stock</span>
          )}
        </div>
      </div>

      <div className="item-controls">
        <div className="quantity-controls">
          <button 
            onClick={() => handleQuantityChange(item.quantity - 1)}
            className="quantity-btn"
            disabled={item.quantity <= 1}
          >
            -
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button 
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="quantity-btn"
            disabled={item.quantity >= item.product.stock_quantity}
          >
            +
          </button>
        </div>

        <div className="item-total">
          ₹{itemTotal?.toLocaleString()}
        </div>

        <button 
          onClick={() => onRemove(item._id)}
          className="remove-btn"
          title="Remove from cart"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CartItem;
