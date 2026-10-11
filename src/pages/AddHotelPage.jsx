import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import HotelForm from '../components/hotels/HotelForm';
import Toast from '../components/common/Toast';
import { Helmet } from 'react-helmet-async';

const AddHotelPage = () => {
  const navigate = useNavigate();
  const [toastMessage, setToastMessage] = useState('');

  return (
    <div>
      <Helmet>
        <title>Add Hotel | HotelFinder</title>
      </Helmet>
      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Button variant="ghost" onClick={() => navigate('/hotels')} style={{ paddingLeft: 0, marginBottom: 'var(--spacing-2)' }}>
          &larr; Back to Hotels
        </Button>
        <h1>Add New Hotel</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-2)' }}>
          Create a new hotel listing.
        </p>
      </div>

      <Card>
        <HotelForm 
          mode="create" 
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

export default AddHotelPage;
