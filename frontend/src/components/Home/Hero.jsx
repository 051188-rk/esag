import React from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import './Hero.css';

const Hero = () => {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    // Show 2 slides at a time to create a horizontal scroll for the banners
    slidesToShow: 1, 
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 768, settings: { slidesToShow: 1 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1593642702749-bf650b868e8e?w=1200&h=500&fit=crop&q=80&auto=format',
      png1: '/esag-paper.png',
      png2: '/sale.png',
      title: 'Summer Tech Deals',
      subtitle: 'Up to 50% off on premium gadgets and accessories',
      buttonText: 'Shop Electronics',
      link: '/products?category=Electronics',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1525547719586-0951664c39c5?w=1200&h=500&fit=crop&q=80&auto=format',
      png2: '/sale.png',
      png1: '/esag-paper.png',
      title: 'Fashion Forward',
      subtitle: 'New season collection has arrived! Get 20% off.',
      buttonText: 'Explore Apparel',
      link: '/products?category=Fashion',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&h=500&fit=crop&q=80&auto=format',
      png2: '/sale.png',
      png1: '/esag-paper.png',
      title: 'Footwear Frenzy',
      subtitle: 'Limited-time offer on all athletic shoes. Buy one, get one 50% off.',
      buttonText: 'See Shoes',
      link: '/products?category=Shoes',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=500&fit=crop&q=80&auto=format',
      png1: '/esag-paper.png',
      png2: '/sale.png',
      title: 'Home Essentials',
      subtitle: 'Everything you need to spruce up your living space.',
      buttonText: 'Shop Home',
      link: '/products?category=Home',
    }
  ];

  return (
    <section className="hero">
      <div className="container">
        <Slider {...sliderSettings}>
          {heroSlides.map(slide => (
            <div key={slide.id} className="p-2">
              <div className="hero-banner">
                <div 
                  className="hero-background"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  {/* Inner Shadow from Below (Z-index 2) */}
                  <div className="hero-inner-shadow"></div>

                  <div className="hero-overlay">
                    {/* Overlaid PNGs (Z-index 4) */}
                    <div className="hero-right-images">
                      <img 
                        src={slide.png1} 
                        alt="Sale" 
                        className="hero-png-1"
                        onError={(e) => { e.target.onerror = null; e.target.src = "/sale.png"; }}
                      />
                      <img 
                        src={slide.png2} 
                        alt="ESAG Logo" 
                        className="hero-png-2"
                        onError={(e) => { e.target.onerror = null; e.target.src = "/esag-paper.png"; }}
                      />
                    </div>
                    
                    <div className="hero-content">
                      <h2 className="hero-title">{slide.title}</h2>
                      <p className="hero-subtitle">{slide.subtitle}</p>
                      <Link to={slide.link} className="hero-cta">
                        {slide.buttonText} <span className="cta-arrow">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default Hero;
