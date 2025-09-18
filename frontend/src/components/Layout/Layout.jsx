import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Chatbot from '../Common/Chatbot'; // 1. Import the new Chatbot component
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
      <Chatbot /> {/* 2. Add the Chatbot component here */}
    </div>
  );
};

export default Layout;