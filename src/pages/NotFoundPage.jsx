import React from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Helmet>
        <title>Page Not Found | HotelFinder</title>
      </Helmet>
      <EmptyState 
        title="404 - Page not found"
        description="The page you're looking for doesn't exist."
        action={<Button onClick={() => navigate('/hotels')}>Back to Hotels</Button>}
      />
    </div>
  );
};

export default NotFoundPage;
