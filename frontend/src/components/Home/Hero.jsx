import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import './Hero.css';

const Hero = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    fade: true,
    cssEase: 'linear'
  };

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=500&fit=crop&auto=format',
      title: 'Summer Sale Spectacular',
      subtitle: 'Up to 50% off on all categories',
      buttonText: 'Shop Now',
      link: '/products',
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=500&fit=crop&auto=format',
      title: 'Latest Electronics',
      subtitle: 'Cutting-edge gadgets and tech accessories',
      buttonText: 'Explore Tech',
      link: '/products?category=Electronics',
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8))'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=500&fit=crop&auto=format',
      title: 'Fashion Forward',
      subtitle: 'Trendy clothing for every occasion and season',
      buttonText: 'Discover Fashion',
      link: '/products?category=Fashion',
      gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(219, 39, 119, 0.8))'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=500&fit=crop&auto=format',
      title: 'Home & Living',
      subtitle: 'Transform your space with our curated collection',
      buttonText: 'Shop Home',
      link: '/products?category=Home',
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8))'
    }
  ];

  return (
    <section className="hero">
      <Slider {...sliderSettings}>
        {heroSlides.map(slide => (
          <div key={slide.id} className="hero-slide">
            <div 
              className="hero-background"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div 
                className="hero-overlay"
                style={{ background: slide.gradient }}
              >
                <div className="hero-content">
                  <div className="hero-text">
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-subtitle">{slide.subtitle}</p>
                    <Link to={slide.link} className="hero-cta">
                      {slide.buttonText}
                      <span className="cta-arrow">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Hero;
