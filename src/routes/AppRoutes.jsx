import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HotelListPage from '../pages/HotelListPage';
import AddHotelPage from '../pages/AddHotelPage';
import HotelDetailsPage from '../pages/HotelDetailsPage';
import EditHotelPage from '../pages/EditHotelPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/hotels" replace />} />
      <Route path="/hotels" element={<HotelListPage />} />
      <Route path="/hotels/new" element={<AddHotelPage />} />
      <Route path="/hotels/:id" element={<HotelDetailsPage />} />
      <Route path="/hotels/:id/edit" element={<EditHotelPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
