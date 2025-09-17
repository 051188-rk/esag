import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return action.payload;
    case 'ADD_TO_CART':
      return action.payload;
    case 'UPDATE_CART':
      return action.payload;
    case 'CLEAR_CART':
      return {
        items: [],
        total_amount: 0,
        total_items: 0
      };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    total_amount: 0,
    total_items: 0
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1, selected_color, selected_size) => {
    try {
      const response = await api.post('/cart/add', {
        productId,
        quantity,
        selected_color,
        selected_size
      });
      dispatch({ type: 'ADD_TO_CART', payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const response = await api.put(`/cart/item/${itemId}`, { quantity });
      dispatch({ type: 'UPDATE_CART', payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      dispatch({ type: 'UPDATE_CART', payload: response.data });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      throw error;
    }
  };

  const value = {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
