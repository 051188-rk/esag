import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
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

  const [showFilters, setShowFilters] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== '') {
        params.set(key, filters[key]);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Fetch products with React Query
  const { 
    data, 
    isLoading, 
    error, 
    isError 
  } = useQuery(
    ['products', filters],
    async () => {
      console.log('Fetching products with filters:', filters);
      const response = await api.get('/products', { params: filters });
      console.log('Products API response:', response.data);
      return response.data;
    },
    { 
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      onError: (error) => {
        console.error('Products fetch error:', error);
        toast.error('Failed to load products: ' + (error.message || 'Unknown error'));
      }
    }
  );

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
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

  if (isError) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="error-container">
            <h2>Error loading products</h2>
            <p>{error.message || 'Please try again later.'}</p>
            <button onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract products and pagination from response
  const products = data?.products || [];
  const pagination = data?.pagination || {};

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
            {pagination.total !== undefined && (
              <span>({pagination.total} products found)</span>
            )}
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
                {products && products.length > 0 ? (
                  <>
                    <div className="products-info">
                      <p>
                        Showing {products.length} of {pagination.total || 0} products
                        {pagination.currentPage > 1 && ` (Page ${pagination.currentPage})`}
                      </p>
                    </div>
                    
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
