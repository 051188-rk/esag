import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Slider from 'react-slick'; // Retained for FeaturedProducts if you use it outside the snippet
import api from '../services/api';
import ProductCard from '../components/Products/ProductCard'; // Retained
import Loading from '../components/Common/Loading'; // Retained
import './Home.css';
import Hero from '../components/Home/Hero'; // Assuming you use the updated Hero component here
import Categories from '../components/Home/Categories'; // Assuming you use the updated Categories component here
import FeaturedProducts from '../components/Home/FeaturedProducts'; // Assuming you use this component

const Home = () => {
  // Using dummy data or existing hooks. Assuming the useQuery hooks are for other sections not shown here.
  // The logic for fetching featuredData and categoriesData is retained from your snippet:
  const { data: featuredData, isLoading: featuredLoading, error: featuredError } = useQuery(
    'featured-products',
    async () => {
      const response = await api.get('/products/featured');
      return response.data;
    },
    { 
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Featured products error:', error);
        toast.error('Failed to load featured products');
      }
    }
  );

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery(
    'categories',
    async () => {
      const response = await api.get('/products/categories');
      return response.data;
    },
    { 
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Categories error:', error);
        toast.error('Failed to load categories');
      }
    }
  );

  return (
    <div className="home-page">
      {/* 1. Hero Section - Updated to Horizontal Banners */}
      <Hero />
      
      {/* 2. Featured Products (Existing) */}
      <FeaturedProducts />

      {/* 3. Promotional Banners Section - Updated with Badges, PNG, and Hover Scale */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-grid">
            {/* LARGE PROMO CARD */}
            <div className="promo-card promo-large">
              <div className="promo-background" 
                   style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
                <div className="promo-badge">HOT DEAL! 50% OFF</div>

                <img 
                  src="/electronics.png" 
                  alt="Electronics Showcase" 
                  className="promo-png-overlay"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/sale.png"; }}
                />

                <div className="promo-content">
                  <h3>Electronics Mega Sale</h3>
                  <p>Up to 50% off on smartphones & laptops. Limited stock!</p>
                  <Link to="/products?category=Electronics" className="promo-link">Shop Electronics →</Link>
                </div>
              </div>
            </div>

            {/* SMALL PROMO CARD 1 */}
            <div className="promo-card">
              <div className="promo-background" 
                   style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' }}>
                <div className="promo-badge promo-badge-secondary">New Arrivals</div>
                <img 
                  src="/fashion.png" 
                  alt="Fashion Showcase" 
                  className="promo-png-overlay promo-png-small"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/sale.png"; }}
                />
                <div className="promo-content">
                  <h3>Winter Fashion Drop</h3>
                  <p>Discover the latest trends.</p>
                  <Link to="/products?category=Fashion" className="promo-link">Explore Fashion →</Link>
                </div>
              </div>
            </div>

            {/* SMALL PROMO CARD 2 */}
            <div className="promo-card">
              <div className="promo-background" 
                   style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
                <div className="promo-badge promo-badge-tertiary">Free Shipping</div>
                <img 
                  src="/furniture.webp" 
                  alt="Furniture Showcase" 
                  className="promo-png-overlay promo-png-small"
                  onError={(e) => { e.target.onerror = null; e.target.src = "/furniture.png"; }}
                />
                <div className="promo-content">
                  <h3>Furnitue & Appliances</h3>
                  <p>Exclusive deals and discounts on home decours.</p>
                  <Link to="/products?on_sale=true" className="promo-link">View Offers →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Categories Section - Updated to Image Backgrounds & SVGs */}
      <Categories />

    </div>
  );
};

export default Home;
