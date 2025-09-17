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
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.set(key, filters[key]);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const { data, isLoading, error } = useQuery(
    ['products', filters],
    () => api.get('/products', { params: filters }).then(res => res.data),
    { 
      keepPreviousData: true,
      staleTime: 300000
    }
  );

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo(0, 0);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      category: '',
      subcategory: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error loading products</h2>
        <p>Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <h1>Products</h1>
          <div className="products-controls">
            <button 
              className="filter-toggle"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            <select 
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange({ sortBy, sortOrder });
              }}
              className="sort-select"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {filters.search && (
          <div className="search-results-info">
            <p>Search results for "<strong>{filters.search}</strong>"</p>
            {data && <span>({data.total} products found)</span>}
          </div>
        )}

        <div className="products-layout">
          <aside className={`filters-sidebar ${showFilters ? 'filters-open' : ''}`}>
            <Filters 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>

          <main className="products-main">
            {isLoading ? (
              <Loading size="large" />
            ) : (
              <>
                {data?.products?.length > 0 ? (
                  <>
                    <div className="products-grid">
                      {data.products.map(product => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>
                    
                    <Pagination
                      currentPage={data.currentPage}
                      totalPages={data.totalPages}
                      onPageChange={handlePageChange}
                      hasMore={data.hasMore}
                    />
                  </>
                ) : (
                  <div className="no-products">
                    <h2>No products found</h2>
                    <p>Try adjusting your filters or search terms.</p>
                    <button onClick={clearFilters}>Clear All Filters</button>
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
