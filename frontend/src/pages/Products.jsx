import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/Products/ProductCard';
import Filters from '../components/Products/Filters';
import Loading from '../components/Common/Loading';
import Pagination from '../components/Common/Pagination';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  useEffect(() => {
    const newFilters = {};
    for (const [key, value] of searchParams.entries()) {
      newFilters[key] = value;
    }
    setFilters(prev => ({ ...prev, ...newFilters, page: parseInt(newFilters.page) || 1 }));
  }, [searchParams]);

  const { data, isLoading, isError, error } = useQuery(
    ['products', filters],
    () => api.get('/products', { params: filters }).then(res => res.data),
    { keepPreviousData: true }
  );

  const handleFilterChange = (newFilters) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    const updatedParams = { ...currentParams, ...newFilters, page: 1 };
    setSearchParams(updatedParams);
  };

  const handlePageChange = (page) => {
    const currentParams = Object.fromEntries(searchParams.entries());
    setSearchParams({ ...currentParams, page });
  };

  const clearFilters = () => {
    setSearchParams({ page: '1', limit: '12', sortBy: 'createdAt', sortOrder: 'desc' });
  };

  if (isError) return <div>Error loading products: {error.message}</div>;

  const products = data?.products || [];
  const pagination = data?.pagination || {};

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Products</h1>
          
          {/* --- SORTING DROPDOWN ADDED HERE --- */}
          <div className="products-controls">
            <label htmlFor="sort-select">Sort by:</label>
            <select
              id="sort-select"
              className="sort-select"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange({ sortBy, sortOrder });
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          <aside className="filters-sidebar">
            <Filters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>
          <main className="products-main">
            {isLoading ? <Loading size="large" /> : (
              <>
                {products.length > 0 ? (
                  <>
                    <div className="products-grid">
                      {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                    {pagination.totalPages > 1 && (
                      <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                        hasMore={pagination.hasMore}
                      />
                    )}
                  </>
                ) : (
                  <div className="no-products">
                    <h2>No products found</h2>
                    <p>Try adjusting your filters.</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Products;