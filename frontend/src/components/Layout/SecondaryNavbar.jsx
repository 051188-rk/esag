import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';
import './SecondaryNavbar.css';

// Default categories in case API fails
const defaultCategories = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Beauty',
  'Automotive',
  'Toys',
  'Health',
  'Office'
];

// Map category names to their corresponding SVG icons
const categoryIcons = {
  'Electronics': '/electronics.svg',
  'Fashion': '/fashion.svg',
  'Home & Garden': '/home&garden.svg',
  'Sports': '/sports.svg',
  'Books': '/books.svg',
  'Beauty': '/beauty.svg',
  'Automotive': '/automative.svg',
  'Toys': '/toys.svg',
  'Health': '/health.svg',
  'Office': '/office.svg',
  'default': '/products.svg'  // Fallback icon
};

// SVG Icons for categories
const CategoryIcons = {
  'Electronics': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a1 1 0 100-2 1 1 0 000 2z" />
      <path fillRule="evenodd" d="M9 3.75A6.75 6.75 0 0115.75 9v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 002.25 9.75V9a6.75 6.75 0 016.75-6.75zM15.75 9a4.5 4.5 0 00-9 0v.75c0 .983.22 1.917.617 2.75h7.766a5.25 5.25 0 00.617-2.75V9z" clipRule="evenodd" />
    </svg>
  ),
  'Fashion': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
    </svg>
  ),
  'Home & Garden': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.69z" />
      <path d="M12 5.432l8.159 8.159c.03.03.058.06.086.091l3.163 3.162a.75.75 0 01-1.06 1.06l-3.162-3.162a2.25 2.25 0 01-.091-.086L12 7.04 3.841 15.2a2.25 2.25 0 01-.091.086L.588 18.45a.75.75 0 01-1.06-1.06l3.163-3.162a1.5 1.5 0 00.086-.091L12 5.43z" />
    </svg>
  ),
  'Sports': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.28 3.22a.75.75 0 00-1.06 1.06l3 3a.75.75 0 101.06-1.06l-3-3zm9.06 0l-3 3a.75.75 0 101.06 1.06l3-3a.75.75 0 10-1.06-1.06zM12 18a.75.75 0 01-.75-.75v-3a.75.75 0 011.5 0v3A.75.75 0 0112 18z" clipRule="evenodd" />
    </svg>
  ),
  'Books': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
    </svg>
  ),
  'Beauty': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  'Automotive': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h9V6.375c0-1.036-.84-1.875-1.875-1.875h-5.25zM13.5 15.375c0 1.035.84 1.875 1.875 1.875h5.25c1.035 0 1.875-.84 1.875-1.875V13.5h-9v1.875z" />
      <path fillRule="evenodd" d="M8.25 19.5a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75v-6a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v6zm7.5 0a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75v-6a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75v6z" clipRule="evenodd" />
    </svg>
  ),
  'Toys': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
    </svg>
  ),
  'Health': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  ),
  'Office': (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 00-.75-.75h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
    </svg>
  )
};

// Default icon for categories without a specific icon
const DefaultIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" clipRule="evenodd" />
    <path fillRule="evenodd" d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" clipRule="evenodd" />
  </svg>
);

const SecondaryNavbar = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('');
  const [categories, setCategories] = useState(defaultCategories);

  // Update active category based on URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    setActiveCategory(categoryParam || '');
  }, [location]);

  // Try to fetch categories from API
  const { isLoading } = useQuery(
    'categories',
    () => api.get('/products/categories').then(res => res.data),
    {
      staleTime: 300000,
      onSuccess: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map(cat => (typeof cat === 'object' ? cat.name : cat)));
        }
      },
      onError: (error) => {
        console.error('Error fetching categories, using defaults:', error);
      }
    }
  );

  // Get icon for category, fallback to default if not found
  const getCategoryIcon = (categoryName) => {
    return categoryIcons[categoryName] || categoryIcons['default'];
  };

  if (isLoading) {
    return (
      <nav className="secondary-navbar">
        <div className="container">
          <div className="secondary-navbar-content">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="secondary-nav-link loading">
                <div className="category-icon loading-shimmer" />
                <span className="category-name loading-shimmer">Loading...</span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="secondary-navbar">
      <div className="container">
        <div className="secondary-navbar-content">
          {categories.map((category, index) => {
            const categoryName = typeof category === 'string' ? category : 
                              (category.name || category.title || `Category ${index}`);
            const isActive = activeCategory === categoryName;
            
            return (
              <Link
                key={index}
                to={`/products?category=${encodeURIComponent(categoryName)}`}
                className={`secondary-nav-link ${isActive ? 'active' : ''}`}
              >
                <img 
                  src={getCategoryIcon(categoryName)} 
                  alt={categoryName} 
                  className="category-icon"
                  onError={(e) => {
                    e.target.src = categoryIcons['default'];
                  }}
                />
                <span className="category-name">{categoryName}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default SecondaryNavbar;
