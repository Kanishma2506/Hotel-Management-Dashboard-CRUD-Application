import React from 'react';
import Button from '../common/Button';
import './PriceFilter.css';

const PriceFilter = ({ minPrice, maxPrice, onMinChange, onMaxChange, onClear, isFiltered }) => {
  const isInvalid = minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice);

  return (
    <div className="price-filter-container">
      <div className="price-inputs-group">
        <div className="price-input-field">
          <label htmlFor="min-price-input" className="price-label">
            Min ₹
          </label>
          <input
            id="min-price-input"
            type="number"
            min="0"
            className={`price-input ${isInvalid ? 'price-input-error' : ''}`}
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => onMinChange(e.target.value)}
          />
        </div>

        <div className="price-input-field">
          <label htmlFor="max-price-input" className="price-label">
            Max ₹
          </label>
          <input
            id="max-price-input"
            type="number"
            min="0"
            className={`price-input ${isInvalid ? 'price-input-error' : ''}`}
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => onMaxChange(e.target.value)}
          />
        </div>

        {isFiltered && (
          <Button variant="ghost" onClick={onClear} className="clear-filters-btn">
            Clear Filters
          </Button>
        )}
      </div>

      {isInvalid && (
        <p className="price-error-msg" role="alert">
          Minimum price cannot be greater than maximum price.
        </p>
      )}
    </div>
  );
};

export default PriceFilter;
