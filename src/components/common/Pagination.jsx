import React from 'react';
import Button from './Button';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav className="pagination-container" aria-label="Pagination Navigation">
      <Button
        variant="secondary"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="pagination-nav-btn"
      >
        &larr; Previous
      </Button>

      <div className="pagination-numbers">
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }
          return (
            <button
              key={page}
              className={`pagination-num ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          );
        })}
      </div>

      <Button
        variant="secondary"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="pagination-nav-btn"
      >
        Next &rarr;
      </Button>
    </nav>
  );
};

export default Pagination;
