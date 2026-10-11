import React from 'react';
import { Search } from 'lucide-react';
import './HotelSearch.css';

const HotelSearch = ({ value, onChange }) => {
  return (
    <div className="hotel-search-wrapper">
      <label htmlFor="hotel-search-input" className="sr-only">
        Search hotels by name
      </label>
      <div className="hotel-search-input-container">
        <Search className="hotel-search-icon" size={18} />
        <input
          id="hotel-search-input"
          type="text"
          className="hotel-search-input"
          placeholder="Search hotels by name..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default HotelSearch;
