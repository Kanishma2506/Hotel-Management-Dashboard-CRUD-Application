import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectHotelById, selectCurrentHotel } from '../store/hotelSelectors';
import { fetchHotelById } from '../store/hotelSlice';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import HotelForm from '../components/hotels/HotelForm';
import Toast from '../components/common/Toast';
import { Helmet } from 'react-helmet-async';

const EditHotelPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const storeHotel = useSelector(selectHotelById(id));
  const currentHotel = useSelector(selectCurrentHotel);
  const hotel = storeHotel || currentHotel;

  const loading = useSelector((state) => state.hotels.detailLoading);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (id && (!hotel || String(hotel.id) !== String(id))) {
      dispatch(fetchHotelById(id));
    }
  }, [dispatch, id, hotel]);

  if (loading && !hotel) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <p>Loading hotel for edit...</p>
      </div>
    );
  }

  if (!hotel && !loading) {
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
        </div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Edit {hotel.title} | HotelFinder</title>
      </Helmet>
      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Button variant="ghost" onClick={() => navigate('/hotels')} style={{ paddingLeft: 0, marginBottom: 'var(--spacing-2)' }}>
          &larr; Back to Hotels
        </Button>
        <h1>Edit Hotel</h1>
      </div>

      <Card>
        <HotelForm 
          mode="edit" 
          hotel={hotel} 
          onToast={(msg) => setToastMessage(msg)} 
        />
      </Card>

      <Toast 
        message={toastMessage} 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
};

export default EditHotelPage;
