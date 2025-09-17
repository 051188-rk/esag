import React from 'react';
import './Loading.css';

const Loading = ({ size = 'medium' }) => {
  return (
    <div className={`loading-container ${size}`}>
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default Loading;
