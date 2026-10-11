import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import Rating from '../common/Rating';
import { formatPrice, truncateDescription, getImageUrl } from '../../utils/hotelHelpers';
import './HotelCard.css';

const PLACEHOLDER_IMAGE = '/hotels/hotel-placeholder.svg';

const HotelCard = ({ hotel, onDeleteRequest }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleCardClick = (e) => {
    if (!e.target.closest('button')) {
      navigate(`/hotels/${hotel.id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/hotels/${hotel.id}`);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/hotels/${hotel.id}/edit`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDeleteRequest) {
      onDeleteRequest(hotel);
    }
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  const imageSrc = imgError ? PLACEHOLDER_IMAGE : getImageUrl(hotel.image);

  return (
    <Card 
      className="hotel-card" 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${hotel.title}, ${formatPrice(hotel.price)} per night`}
    >
      <div className="hotel-card-image-wrapper">
        <img
          src={imageSrc}
          alt={`${hotel.title} hotel`}
          className="hotel-card-image"
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      <div className="hotel-card-content">
        <div className="hotel-card-header">
          <div className="hotel-card-header-left">
            <h2 className="hotel-card-title">{hotel.title}</h2>
            <Rating rating={hotel.rating} reviews={hotel.reviews} />
          </div>
          <div className="hotel-card-price-badge">
            <span className="hotel-card-price">{formatPrice(hotel.price)}</span>
            <span className="hotel-card-price-period"> / night</span>
          </div>
        </div>

        <p className="hotel-card-description">
          {truncateDescription(hotel.description, 130)}
        </p>

        <div className="hotel-card-footer">
          <Button 
            variant="primary" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hotels/${hotel.id}`);
            }}
            className="hotel-card-details-btn"
          >
            View Details &rarr;
          </Button>

          <div className="hotel-card-actions">
            <Button variant="ghost" onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="ghost" onClick={handleDelete} style={{ color: 'var(--color-danger)' }}>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default HotelCard;
