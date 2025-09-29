import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import Loading from '../components/Common/Loading';
import RelatedProducts from '../components/Products/RelatedProducts'; // Keep this import
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

  // This hook fetches the main product
  const { data: productData, isLoading, isError, error } = useQuery(
    ['product', id],
    () => api.get(`/products/${id}`).then(res => res.data),
    { 
      staleTime: 300000,
      onError: (err) => {
        toast.error('Failed to load product details');
      }
    }
  );

  // Reset quantity and options when the product ID changes
  useEffect(() => {
    setQuantity(1);
    setSelectedColor('');
    setSelectedSize('');
    setActiveImage(0);
  }, [id]);


  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }

    try {
      await addToCart(product._id, quantity, selectedColor, selectedSize);
      toast.success('Product added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
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
  
  if (isError || !productData?.success) {
    return (
      <div className="error-container">
        <h2>Product not found</h2>
        <p>{error?.message || 'The product you\'re looking for doesn\'t exist.'}</p>
        <button onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  const product = productData.product;
  
  if (!product) {
    return (
      <div className="error-container">
        <h2>Product not found</h2>
        <button onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  const currentPrice = Number(product.price) || 0;
  const originalPrice = Number(product.original_price) || currentPrice;
  const discountPercentage = originalPrice > currentPrice ? 
    Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const stockQuantity = Number(product.stock_quantity) || 0;
  const rating = Number(product.rating) || 0;
  const reviewCount = Number(product.review_count) || 0;

  const images = [product.image_url, ...(product.additional_images || [])].filter(Boolean);

  return (
    <>
      <div className="product-detail">
        <div className="container">
          <div className="product-detail-layout">
            {/* Product Images */}
            <div className="product-images">
              <div className="main-image">
                <img 
                  src={images[activeImage] || 'https://via.placeholder.com/500x500?text=No+Image'} 
                  alt={product.name || 'Product'}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=No+Image'; }}
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
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
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
                  {'★'.repeat(Math.floor(rating))}
                  {'☆'.repeat(5 - Math.floor(rating))}
                </div>
                <span className="rating-text">
                  ({rating.toFixed(1)}) • {reviewCount} reviews
                </span>
              </div>

              <div className="product-pricing">
                <span className="current-price">₹{currentPrice.toLocaleString()}</span>
                {originalPrice > currentPrice && (
                  <span className="original-price">₹{originalPrice.toLocaleString()}</span>
                )}
                {discountPercentage > 0 && (
                  <span className="savings">
                    You save ₹{(originalPrice - currentPrice).toLocaleString()} ({discountPercentage}%)
                  </span>
                )}
              </div>

              <div className="product-description">
                <h3>Description</h3>
                <p>{product.description}</p>
              </div>

              {Array.isArray(product.color_options) && product.color_options.length > 0 && (
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

              {Array.isArray(product.size_options) && product.size_options.length > 0 && (
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

              <div className="quantity-selector">
                <h4>Quantity:</h4>
                <div className="quantity-controls">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(stockQuantity, q + 1))} disabled={quantity >= stockQuantity}>+</button>
                </div>
                <span className="stock-info">
                  {stockQuantity > 0 ? `${stockQuantity} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="product-actions">
                <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={stockQuantity === 0}>Add to Cart</button>
                <button className="buy-now-btn" onClick={handleBuyNow} disabled={stockQuantity === 0}>Buy Now</button>
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="product-specifications">
                  <h3>Specifications</h3>
                  <div className="specs-grid">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-label">{key}:</span>
                        <span className="spec-value">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* --- THIS IS THE FIX --- */}
      {/* We check if the product has loaded successfully (`product._id` exists) before rendering RelatedProducts */}
      {product?._id && <RelatedProducts productId={product._id} />}
    </>
  );
};

export default ProductDetail;