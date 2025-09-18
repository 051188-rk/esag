import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import './Filters.css';

const Filters = ({ filters, onFilterChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/products/categories');
      return response.data;
    },
    { 
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Categories fetch error:', error);
      }
    }
  );

  const { data: brandsData, isLoading: brandsLoading } = useQuery(
    'brands',
    async () => {
      const response = await api.get('/products/brands');
      return response.data;
    },
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: subcategoriesData } = useQuery(
    ['subcategories', localFilters.category],
    async () => {
      const response = await api.get('/products/subcategories', { 
        params: { category: localFilters.category }
      });
      return response.data;
    },
    { 
      enabled: !!localFilters.category,
      staleTime: 5 * 60 * 1000
    }
  );

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      subcategory: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: ''
    };
    setLocalFilters(prev => ({ ...prev, ...clearedFilters }));
    onClearFilters();
  };

  // Extract arrays from API responses safely
  const categories = categoriesData?.categories || [];
  const brands = brandsData?.brands || [];
  const subcategories = subcategoriesData?.subcategories || [];

  console.log('Categories data:', categoriesData);
  console.log('Categories array:', categories);

  const priceRanges = [
    { label: 'Under ₹500', min: '', max: 500 },
    { label: '₹500 - ₹1,000', min: 500, max: 1000 },
    { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
    { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
    { label: 'Above ₹10,000', min: 10000, max: '' }
  ];

  return (
    <div className="filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <button onClick={clearAllFilters} className="clear-filters">
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="filter-group">
        <label>Search Products</label>
        <input
          type="text"
          placeholder="Search..."
          value={localFilters.search}
          onChange={(e) => handleInputChange('search', e.target.value)}
          className="filter-input"
        />
      </div>

      {/* Categories */}
      <div className="filter-group">
        <label>Category</label>
        {categoriesLoading ? (
          <div>Loading categories...</div>
        ) : categoriesError ? (
          <div>Error loading categories</div>
        ) : (
          <select
            value={localFilters.category}
            onChange={(e) => {
              handleInputChange('category', e.target.value);
              handleInputChange('subcategory', ''); // Reset subcategory
            }}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {Array.isArray(categories) && categories.map(category => (
              <option key={category.name} value={category.name}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Subcategories */}
      {localFilters.category && Array.isArray(subcategories) && subcategories.length > 0 && (
        <div className="filter-group">
          <label>Subcategory</label>
          <select
            value={localFilters.subcategory}
            onChange={(e) => handleInputChange('subcategory', e.target.value)}
            className="filter-select"
          >
            <option value="">All Subcategories</option>
            {subcategories.map(subcategory => (
              <option key={subcategory} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Brands */}
      <div className="filter-group">
        <label>Brand</label>
        {brandsLoading ? (
          <div>Loading brands...</div>
        ) : (
          <select
            value={localFilters.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            className="filter-select"
          >
            <option value="">All Brands</option>
            {Array.isArray(brands) && brands.slice(0, 20).map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Price Range - Quick Select */}
      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-ranges">
          {priceRanges.map((range, index) => (
            <button
              key={index}
              className={`price-range-btn ${
                localFilters.minPrice == range.min && localFilters.maxPrice == range.max
                  ? 'active' : ''
              }`}
              onClick={() => {
                handleInputChange('minPrice', range.min);
                handleInputChange('maxPrice', range.max);
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Price Range */}
      <div className="filter-group">
        <label>Custom Price Range</label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice}
            onChange={(e) => handleInputChange('minPrice', e.target.value)}
            className="price-input"
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice}
            onChange={(e) => handleInputChange('maxPrice', e.target.value)}
            className="price-input"
          />
        </div>
      </div>

      <button onClick={applyFilters} className="apply-filters">
        Apply Filters
      </button>
    </div>
  );
};

export default Filters;
