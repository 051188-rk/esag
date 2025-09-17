import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import api from '../services/api';
import ProductCard from '../components/Products/ProductCard';
import Loading from '../components/Common/Loading';
import './Home.css';

const Home = () => {
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery(
    'featured-products',
    () => api.get('/products/featured').then(res => res.data),
    { staleTime: 300000 }
  );

  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => api.get('/products/categories').then(res => res.data),
    { staleTime: 300000 }
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000
  };

  const productSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1 }
      }
    ]
  };

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop',
      title: 'Summer Sale',
      subtitle: 'Up to 50% off on all categories',
      buttonText: 'Shop Now',
      link: '/products'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
      title: 'New Electronics',
      subtitle: 'Latest gadgets and tech accessories',
      buttonText: 'Explore',
      link: '/products?category=Electronics'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=400&fit=crop',
      title: 'Fashion Collection',
      subtitle: 'Trendy clothing for every occasion',
      buttonText: 'Discover',
      link: '/products?category=Fashion'
    }
  ];

  if (featuredLoading || categoriesLoading) {
    return <Loading />;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <Slider {...sliderSettings}>
          {heroSlides.map(slide => (
            <div key={slide.id} className="hero-slide">
              <div 
                className="hero-image"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="hero-overlay">
                  <div className="hero-content">
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <Link to={slide.link} className="hero-button">
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories?.slice(0, 8).map(category => (
              <Link 
                key={category.name}
                to={`/products?category=${category.name}`}
                className="category-card"
              >
                <h3>{category.name}</h3>
                <span>{category.count} products</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <div className="container">
          <h2>Featured Products</h2>
          <Slider {...productSliderSettings}>
            {featuredProducts?.map(product => (
              <div key={product._id} className="product-slide">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-grid">
            <div className="promo-card promo-large">
              <img src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=300&fit=crop" alt="Electronics Sale" />
              <div className="promo-content">
                <h3>Electronics Sale</h3>
                <p>Up to 40% off on smartphones & laptops</p>
                <Link to="/products?category=Electronics">Shop Electronics</Link>
              </div>
            </div>
            <div className="promo-card">
              <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=200&fit=crop" alt="Fashion" />
              <div className="promo-content">
                <h3>Fashion Week</h3>
                <p>New arrivals daily</p>
                <Link to="/products?category=Fashion">Explore Fashion</Link>
              </div>
            </div>
            <div className="promo-card">
              <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop" alt="Home & Garden" />
              <div className="promo-content">
                <h3>Home & Garden</h3>
                <p>Decorate your space</p>
                <Link to="/products?category=Home">Shop Home</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
