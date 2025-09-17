import React from 'react';
import { useQuery } from 'react-query';
import Slider from 'react-slick';
import api from '../../services/api';
import ProductCard from '../Products/ProductCard';
import Loading from '../Common/Loading';
import './FeaturedProducts.css';

const FeaturedProducts = () => {
  const { data: featuredProducts, isLoading } = useQuery(
    'featured-products',
    () => api.get('/products/featured').then(res => res.data),
    { staleTime: 300000 }
  );

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1200,
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

  if (isLoading) {
    return (
      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <Loading size="large" />
        </div>
      </section>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section className="featured-products">
      <div className="container">
        <div className="section-header">
          <h2>Featured Products</h2>
          <p>Hand-picked products just for you</p>
        </div>
        
        <div className="products-slider">
          <Slider {...sliderSettings}>
            {featuredProducts.map(product => (
              <div key={product._id} className="product-slide">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
