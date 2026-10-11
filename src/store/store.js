import { configureStore } from '@reduxjs/toolkit';
import hotelReducer from './hotelSlice.js';

export const store = configureStore({
  reducer: {
    hotels: hotelReducer,
  },
});
