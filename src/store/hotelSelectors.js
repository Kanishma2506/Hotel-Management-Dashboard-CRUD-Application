export const selectHotels = (state) => state.hotels.hotels;

export const selectHotelsTotal = (state) => state.hotels.total;

export const selectHotelsLoading = (state) => state.hotels.loading;

export const selectHotelsError = (state) => state.hotels.error;

export const selectCurrentHotel = (state) => state.hotels.currentHotel;

export const selectHotelById = (id) => (state) => {
  if (state.hotels.currentHotel && String(state.hotels.currentHotel.id) === String(id)) {
    return state.hotels.currentHotel;
  }
  return state.hotels.hotels.find((hotel) => String(hotel.id) === String(id)) || null;
};

export const selectHotelsInitialized = (state) => state.hotels.initialized;
