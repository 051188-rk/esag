import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../Common/Loading';
import './Categories.css';

const Categories = () => {
  const { data: response, isLoading, error } = useQuery(
    'categories',
    async () => {
      const { data } = await api.get('/products/categories');
      return data;
    },
    { 
      staleTime: 300000,
      onError: (error) => {
        console.error('Error fetching categories:', error);
      }
    }
  );

  // Extract categories from the response, defaulting to an empty array if not available
  const categories = response?.categories || [];

  const categoryIcons = {
    'Electronics': '📱',
    'Fashion': '👕',
    'Home & Garden': '🏠',
    'Sports': '⚽',
    'Books': '📚',
    'Beauty': '💄',
    'Automotive': '🚗',
    'Toys': '🧸',
    'Health': '💊',
    'Office': '💼',
    'Baby': '👶',
    'Pet': '🐕',
    'Jewelry': '💍'
  };

  const getRandomGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
    ];
    return gradients[index % gradients.length];
  };

  if (isLoading) {
    return (
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/categories" className="view-all">View All Categories</Link>
          </div>
          <Loading size="large" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
          </div>
          <div className="error-message">Failed to load categories. Please try again later.</div>
        </div>
      </section>
    );
  }

  // Use the safely checked array
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="categories-section">
      <div className="container">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of product categories</p>
        </div>
        
        <div className="categories-grid">
          {/* Now categories is guaranteed to be an array */}
          {categories.slice(0, 12).map((category, index) => (
            <Link 
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="category-card"
              style={{ background: getRandomGradient(index) }}
            >
              <div className="category-icon">
                {categoryIcons[category.name] || '📦'}
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                <span className="product-count">
                  {category.count} {category.count === 1 ? 'product' : 'products'}
                </span>
              </div>
              <div className="category-arrow">→</div>
            </Link>
          ))}
        </div>

        {categories.length > 12 && (
          <div className="view-all-categories">
            <Link to="/products" className="view-all-btn">
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;