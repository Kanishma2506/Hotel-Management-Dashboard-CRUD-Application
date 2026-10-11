import React from 'react';
import { Star } from 'lucide-react';
import './Rating.css';

const Rating = ({ rating, reviews }) => {
  if (!rating || rating === 0) {
    return (
      <div className="rating-container" aria-label="No reviews yet">
        <span className="rating-no-reviews">No reviews yet</span>
      </div>
    );
  }

  return (
    <div className="rating-container" aria-label={`Rated ${rating} out of 5 with ${reviews} reviews`}>
      <Star className="rating-star-icon" size={16} aria-hidden="true" />
      <span className="rating-score">{rating.toFixed(1)}</span>
      <span className="rating-separator" aria-hidden="true">·</span>
      <span className="rating-reviews">{reviews.toLocaleString('en-IN')} {reviews === 1 ? 'review' : 'reviews'}</span>
    </div>
  );
};

export default Rating;
