import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import Loading from '../components/Common/Loading';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => api.get(`/products/${id}`).then(res => res.data),
    { staleTime: 300000 }
  );

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    try {
      await addToCart(product._id, quantity, selectedColor, selectedSize);
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.info('Please login to purchase');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    handleAddToCart().then(() => {
      navigate('/cart');
    });
  };

  if (isLoading) return <Loading size="large" />;
  
  if (error || !product) {
    return (
      <div className="error-container">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  const discountPercentage = Math.round(((product.original_price - product.price) / product.original_price) * 100);
  const images = [product.image_url, ...(product.additional_images || [])];

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-layout">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image">
              <img 
                src={images[activeImage]} 
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
                }}
              />
              {discountPercentage > 0 && (
                <span className="discount-badge">-{discountPercentage}%</span>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={activeImage === index ? 'active' : ''}
                    onClick={() => setActiveImage(index)}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1>{product.name}</h1>
              <p className="brand">Brand: {product.brand}</p>
              <div className="category-path">
                {product.category} › {product.subcategory}
              </div>
            </div>

            <div className="product-rating">
              <div className="stars">
                {'★'.repeat(Math.floor(product.rating || 0))}
                {'☆'.repeat(5 - Math.floor(product.rating || 0))}
              </div>
              <span className="rating-text">
                ({product.rating?.toFixed(1) || '0.0'}) • {product.review_count} reviews
              </span>
            </div>

            <div className="product-pricing">
              <span className="current-price">₹{product.price?.toLocaleString()}</span>
              {product.original_price > product.price && (
                <span className="original-price">₹{product.original_price?.toLocaleString()}</span>
              )}
              <span className="savings">
                You save ₹{(product.original_price - product.price)?.toLocaleString()} 
                ({discountPercentage}%)
              </span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {/* Product Options */}
            {product.color_options && product.color_options.length > 0 && (
              <div className="product-options">
                <h4>Color:</h4>
                <div className="color-options">
                  {product.color_options.map(color => (
                    <button
                      key={color}
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.size_options && product.size_options.length > 0 && (
              <div className="product-options">
                <h4>Size:</h4>
                <div className="size-options">
                  {product.size_options.map(size => (
                    <button
                      key={size}
                      className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <h4>Quantity:</h4>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  disabled={quantity >= product.stock_quantity}
                >
                  +
                </button>
              </div>
              <span className="stock-info">
                {product.stock_quantity > 0 ? (
                  `${product.stock_quantity} in stock`
                ) : (
                  'Out of stock'
                )}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                Add to Cart
              </button>
              <button 
                className="buy-now-btn"
                onClick={handleBuyNow}
                disabled={product.stock_quantity === 0}
              >
                Buy Now
              </button>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="product-specifications">
                <h3>Specifications</h3>
                <div className="specs-grid">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="spec-item">
                      <span className="spec-label">{key}:</span>
                      <span className="spec-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="additional-info">
              {product.weight && (
                <div className="info-item">
                  <strong>Weight:</strong> {product.weight} kg
                </div>
              )}
              {product.dimensions && (
                <div className="info-item">
                  <strong>Dimensions:</strong> {product.dimensions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
