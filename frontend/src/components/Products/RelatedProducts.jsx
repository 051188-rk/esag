import React from 'react';
import { useQuery } from 'react-query';
import Slider from 'react-slick';
import api from '../../services/api';
import ProductCard from './ProductCard';
import Loading from '../Common/Loading';
import './RelatedProducts.css';

const RelatedProducts = ({ productId }) => {
  // Fetch related products using the productId
  const { data, isLoading, isError } = useQuery(
    ['related-products', productId],
    () => api.get(`/products/${productId}/related`).then(res => res.data),
    {
      enabled: !!productId, // Only run query if productId exists
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    }
  );

  // Safely get the products array from the API response
  const relatedProducts = data?.products || [];

  // If there's an error fetching, just hide the section to avoid clutter
  if (isError) {
    return null;
  }

  // Slider settings that adapt to the number of products
  const sliderSettings = {
    dots: false,
    infinite: relatedProducts.length > 4, // Only loop if there are more products than slides
    speed: 500,
    slidesToShow: Math.min(4, relatedProducts.length || 1), // Show up to 4, or fewer if not enough products
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, relatedProducts.length || 1),
          infinite: relatedProducts.length > 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, relatedProducts.length || 1),
          infinite: relatedProducts.length > 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          infinite: relatedProducts.length > 1,
        },
      },
    ],
  };

  return (
    <section className="related-products">
      <div className="container">
        <h2 className="section-title">You Might Also Like</h2>
        
        {/* Show loading state */}
        {isLoading && <Loading size="large" />}

        {/* Show slider only if not loading AND there are products */}
        {!isLoading && relatedProducts.length > 0 && (
          <div className="products-slider">
            <Slider {...sliderSettings}>
              {relatedProducts.map(product => (
                <div key={product._id} className="product-slide">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>
        )}
        
        {/* Optional: Show a message if no related products are found after loading */}
        {!isLoading && relatedProducts.length === 0 && (
            <p style={{ textAlign: 'center', color: '#6b7280' }}>No similar products found.</p>
        )}
      </div>
    </section>
  );
};

export default RelatedProducts;