import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const discountPercentage = Math.round(((product.original_price - product.price) / product.original_price) * 100);

  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product-link">
        <div className="product-image">
          <img 
            src={product.image_url} 
            alt={product.name}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
          {discountPercentage > 0 && (
            <span className="discount-badge">-{discountPercentage}%</span>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          <p className="product-brand">{product.brand}</p>
          
          <div className="product-rating">
            <span className="stars">★★★★★</span>
            <span className="rating-value">({product.rating?.toFixed(1) || '0.0'})</span>
            <span className="review-count">{product.review_count} reviews</span>
          </div>
          
          <div className="product-price">
            <span className="current-price">₹{product.price?.toLocaleString()}</span>
            {product.original_price > product.price && (
              <span className="original-price">₹{product.original_price?.toLocaleString()}</span>
            )}
          </div>
          
          <div className="product-category">
            <span>{product.category} • {product.subcategory}</span>
          </div>
          
          {product.stock_quantity <= 10 && product.stock_quantity > 0 && (
            <p className="low-stock">Only {product.stock_quantity} left!</p>
          )}
          
          {product.stock_quantity === 0 && (
            <p className="out-of-stock">Out of Stock</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
