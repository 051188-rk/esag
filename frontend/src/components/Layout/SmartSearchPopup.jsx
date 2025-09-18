import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import api from '../../services/api';
import './SmartSearchPopup.css';

const SmartSearchPopup = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) setQuery(transcript);
  }, [transcript]);

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      return toast.error("Your browser doesn't support voice recognition.");
    }
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening();
    }
    setIsListening(!isListening);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);

    try {
      const response = await api.post('/products/smart-search', { query });
      const data = response.data;

      if (data.intent === 'addToCart') {
        await addToCart(data.product._id, data.quantity);
        toast.success(`Added ${data.quantity} x ${data.product.name} to cart!`);
        navigate('/cart');
      } else {
        const searchParams = new URLSearchParams();
        delete data.filters.intent; // Remove intent before creating params
        for (const key in data.filters) {
          if (data.filters[key]) {
            searchParams.set(key, data.filters[key]);
          }
        }
        navigate(`/products?${searchParams.toString()}`);
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Search failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="smart-search-overlay" onClick={onClose}>
      <div className="smart-search-popup" onClick={(e) => e.stopPropagation()}>
        <h3>Smart Search</h3>
        <p>Ask me to find products or add items to your cart.</p>
        <form onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g., "smartphones under 20000"'
              autoFocus
            />
            <button 
              type="button" 
              onClick={handleMicClick} 
              className={`mic-button ${isListening ? 'listening' : ''}`}
            >
              🎤
            </button>
          </div>
          <button type="submit" disabled={isLoading} className="search-submit-btn">
            {isLoading ? 'Thinking...' : 'Search'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SmartSearchPopup;