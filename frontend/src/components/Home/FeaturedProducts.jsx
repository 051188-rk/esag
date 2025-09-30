import React from 'react';
import { useQuery } from 'react-query';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../Products/ProductCard';
import Loading from '../Common/Loading';
import './FeaturedProducts.css';

// Simple inline ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in FeaturedProducts:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <p>Something went wrong with the featured products.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const FeaturedProducts = () => {
  const { data, isLoading, error } = useQuery(
    'featured-products',
    async () => {
      const response = await api.get('/products/featured');
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false
    }
  );

  // Safely extract products from the response
  const products = data?.products || [];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(4, products.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: Math.min(3, products.length) }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: Math.min(2, products.length) }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  if (isLoading) {
    return (
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">View All</Link>
          </div>
          <Loading size="large" />
        </div>
      </section>
    );
  }

  if (error) {
    console.error('Error fetching featured products:', error);
    return (
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
          </div>
          <div className="error-message">
            <p>Failed to load featured products. Please try again later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) {
    return (
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">View All Products</Link>
          </div>
          <div className="no-products">
            <p>No featured products available at the moment.</p>
            <Link to="/products" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section className="featured-products">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="view-all">View All</Link>
          </div>
          
          <div className="products-slider">
            <Slider {...sliderSettings}>
              {products.map((product) => (
                <div key={product._id || Math.random()} className="product-slide">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};

export default FeaturedProducts;