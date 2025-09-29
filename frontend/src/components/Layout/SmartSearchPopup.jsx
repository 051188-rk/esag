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
      setIsListening(false);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Stop listening if active
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    }
    
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
        delete data.filters.intent;
        for (const key in data.filters) {
          if (data.filters[key]) {
            searchParams.set(key, data.filters[key]);
          }
        }
        navigate(`/products?${searchParams.toString()}`);
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
    }
    onClose();
  };

  return (
    <div className="smart-search-overlay" onClick={handleClose}>
      <div className="smart-search-popup" onClick={(e) => e.stopPropagation()}>
        <div className="popup-content">
          <button className="close-button" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          <h3>Search</h3>
          
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search or use voice...'
                autoFocus
              />
              <div className="mic-button-container">
                <button 
                  type="button"
                  onClick={handleMicClick} 
                  className={`mic-button ${isListening ? 'listening' : ''}`}
                  title={isListening ? 'Stop listening' : 'Start voice search'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" fill="currentColor"/>
                    <path d="M19 10v1a7 7 0 0 1-14 0v-1h-1v1a8 8 0 0 0 7 7.94V22h2v-3.06A8 8 0 0 0 20 11v-1h-1z" fill="currentColor"/>
                  </svg>
                </button>
                {isListening && <div className="mic-ripple"></div>}
              </div>
            </div>

            <button type="submit" disabled={isLoading || !query.trim()} className="search-submit-btn">
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SmartSearchPopup;