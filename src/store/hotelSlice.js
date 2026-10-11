import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hotelApi } from '../services/hotelApi';

// Async Thunks
export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (params, { rejectWithValue }) => {
    try {
      const response = await hotelApi.getHotels(params);
      return response; // { success, data, pagination }
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch hotels');
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await hotelApi.getHotelById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch hotel details');
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async (formDataOrData, { rejectWithValue }) => {
    try {
      const response = await hotelApi.createHotel(formDataOrData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create hotel');
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, formDataOrData }, { rejectWithValue }) => {
    try {
      const response = await hotelApi.updateHotel(id, formDataOrData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to update hotel');
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async (id, { rejectWithValue }) => {
    try {
      await hotelApi.deleteHotel(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to delete hotel');
    }
  }
);

const initialState = {
  hotels: [],
  total: 0,
  offset: 0,
  limit: 10,
  currentHotel: null,
  loading: false,
  detailLoading: false,
  error: null,
  initialized: false,
};

export const hotelSlice = createSlice({
  name: 'hotels',
  initialState,
  reducers: {
    setHotels: (state, action) => {
      state.hotels = action.payload;
    },
    addHotel: (state, action) => {
      state.hotels.unshift(action.payload);
      state.total += 1;
    },
    setInitialized: (state, action) => {
      state.initialized = action.payload;
    },
    clearCurrentHotel: (state) => {
      state.currentHotel = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchHotels
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.hotels = action.payload.data;
        state.total = action.payload.pagination.total;
        state.offset = action.payload.pagination.offset;
        state.limit = action.payload.pagination.limit;
        state.initialized = true;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchHotelById
      .addCase(fetchHotelById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // createHotel
      .addCase(createHotel.fulfilled, (state, action) => {
        state.hotels.unshift(action.payload);
        state.total += 1;
      })

      // updateHotel
      .addCase(updateHotel.fulfilled, (state, action) => {
        const index = state.hotels.findIndex((h) => String(h.id) === String(action.payload.id));
        if (index !== -1) {
          state.hotels[index] = action.payload;
        }
        if (state.currentHotel && String(state.currentHotel.id) === String(action.payload.id)) {
          state.currentHotel = action.payload;
        }
      })

      // deleteHotel
      .addCase(deleteHotel.fulfilled, (state, action) => {
        state.hotels = state.hotels.filter((h) => String(h.id) !== String(action.payload));
        state.total = Math.max(0, state.total - 1);
        if (state.currentHotel && String(state.currentHotel.id) === String(action.payload)) {
          state.currentHotel = null;
        }
      });
  },
});

export const {
  setHotels,
  addHotel,
  setInitialized,
  clearCurrentHotel,
} = hotelSlice.actions;

export default hotelSlice.reducer;
