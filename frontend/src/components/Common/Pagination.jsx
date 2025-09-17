import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, hasMore }) => {
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }
    
    return visiblePages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="pagination-btn prev"
      >
        ← Previous
      </button>

      <div className="pagination-numbers">
        {currentPage > 3 && (
          <>
            <button onClick={() => onPageChange(1)} className="pagination-number">
              1
            </button>
            {currentPage > 4 && <span className="pagination-dots">...</span>}
          </>
        )}

        {visiblePages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`pagination-number ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <span className="pagination-dots">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="pagination-number">
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages || !hasMore}
        className="pagination-btn next"
      >
        Next →
      </button>

      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
