import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectHotelById, selectCurrentHotel } from '../store/hotelSelectors';
import { fetchHotelById, deleteHotel, clearCurrentHotel } from '../store/hotelSlice';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Rating from '../components/common/Rating';
import Toast from '../components/common/Toast';
import DeleteModal from '../components/common/DeleteModal';
import HotelMap from '../components/hotels/HotelMap';
import { Helmet } from 'react-helmet-async';
import { formatPrice, getImageUrl } from '../utils/hotelHelpers';
import './HotelListPage.css';

const PLACEHOLDER_IMAGE = '/hotels/hotel-placeholder.svg';

const HotelDetailsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const storeHotel = useSelector(selectHotelById(id));
  const currentHotel = useSelector(selectCurrentHotel);
  const hotel = storeHotel || currentHotel;

  const detailLoading = useSelector((state) => state.hotels.detailLoading);
  const detailError = useSelector((state) => state.hotels.error);

  const [toastMessage, setToastMessage] = useState('');
  const [imgError, setImgError] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelById(id));
    }
    return () => {
      dispatch(clearCurrentHotel());
    };
  }, [dispatch, id]);

  const handleDeleteRequest = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!hotel) return;
    try {
      await dispatch(deleteHotel(hotel.id)).unwrap();
      setToastMessage('Hotel deleted successfully.');
      setIsDeleteModalOpen(false);
      setTimeout(() => {
        navigate('/hotels');
      }, 1000);
    } catch (err) {
      setToastMessage(typeof err === 'string' ? err : 'Failed to delete hotel.');
      setIsDeleteModalOpen(false);
    }
  };

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
    }
  };

  if (detailLoading && !hotel) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p>Loading hotel details...</p>
      </div>
    );
  }

  if (!hotel && !detailLoading) {
    return (
      <div>
        <Helmet>
          <title>Hotel Not Found | HotelFinder</title>
        </Helmet>
        <div style={{ marginBottom: 'var(--spacing-5)' }}>
          <Button variant="ghost" onClick={() => navigate('/hotels')} style={{ paddingLeft: 0, marginBottom: 'var(--spacing-2)' }}>
            &larr; Back to Hotels
          </Button>
          <h1>Hotel Not Found</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {detailError || "The hotel you're looking for could not be found."}
          </p>
        </div>
      </div>
    );
  }

  const imageSrc = imgError ? PLACEHOLDER_IMAGE : getImageUrl(hotel.image);

  const ratingText = hotel.rating && hotel.rating > 0
    ? `Rated ${hotel.rating}/5 with ${hotel.reviews} reviews.`
    : '';

  return (
    <div>
      <Helmet>
        <title>{hotel.title} | HotelFinder</title>
        <meta name="description" content={`Explore ${hotel.title}. ${ratingText} ${formatPrice(hotel.price)} per night. ${hotel.description.slice(0, 120)}`} />
      </Helmet>

      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Button variant="ghost" onClick={() => navigate('/hotels')} style={{ paddingLeft: 0, marginBottom: 'var(--spacing-2)' }}>
          &larr; Back to Hotels
        </Button>
      </div>

      <Card style={{ overflow: 'hidden', marginBottom: 'var(--spacing-6)' }}>
        <img 
          src={imageSrc} 
          alt={`${hotel.title} hotel`} 
          onError={handleImageError}
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderBottom: '1px solid var(--color-border)' }}
        />
        <div style={{ padding: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-3)' }}>
            <h1 style={{ fontSize: '2rem', margin: 0, flex: 1, minWidth: '250px' }}>{hotel.title}</h1>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                {formatPrice(hotel.price)}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>per night</span>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--spacing-4)' }}>
            <Rating rating={hotel.rating} reviews={hotel.reviews} size="large" />
          </div>

          <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--color-text-main)', marginBottom: 'var(--spacing-6)' }}>
            {hotel.description}
          </p>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--spacing-4)' }}>
            <Button variant="primary" onClick={() => navigate(`/hotels/${hotel.id}/edit`)}>
              Edit Hotel
            </Button>
            <Button variant="ghost" onClick={handleDeleteRequest} style={{ color: 'var(--color-danger)' }}>
              Delete Hotel
            </Button>
          </div>
        </div>
      </Card>

      {/* Map Section */}
      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-4)' }}>Location</h2>
        <Card style={{ padding: 'var(--spacing-4)' }}>
          <HotelMap 
            latitude={Number(hotel.latitude)} 
            longitude={Number(hotel.longitude)} 
            hotelTitle={hotel.title} 
          />
        </Card>
      </div>

      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        hotelName={hotel.title}
      />

      <Toast 
        message={toastMessage} 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
};

export default HotelDetailsPage;
