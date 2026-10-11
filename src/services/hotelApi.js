const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Utility to process fetch responses
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.message || (data?.errors ? data.errors.join(', ') : 'An unexpected error occurred');
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const hotelApi = {
  /**
   * Fetch paginated & filtered hotels list
   * @param {Object} params { title, minPrice, maxPrice, offset, limit }
   */
  async getHotels({ title = '', minPrice = '', maxPrice = '', offset = 0, limit = 10 } = {}) {
    const queryParams = new URLSearchParams();
    if (title && title.trim()) queryParams.append('title', title.trim());
    if (minPrice !== '' && minPrice !== null && !isNaN(Number(minPrice))) queryParams.append('minPrice', minPrice);
    if (maxPrice !== '' && maxPrice !== null && !isNaN(Number(maxPrice))) queryParams.append('maxPrice', maxPrice);
    queryParams.append('offset', offset);
    queryParams.append('limit', limit);

    const res = await fetch(`${API_BASE_URL}/hotels?${queryParams.toString()}`);
    return handleResponse(res);
  },

  /**
   * Fetch single hotel details by ID
   */
  async getHotelById(id) {
    const res = await fetch(`${API_BASE_URL}/hotels/${id}`);
    return handleResponse(res);
  },

  /**
   * Create new hotel (FormData for multipart file upload or JSON)
   */
  async createHotel(formDataOrData) {
    const options = {
      method: 'POST',
    };

    if (formDataOrData instanceof FormData) {
      options.body = formDataOrData;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(formDataOrData);
    }

    const res = await fetch(`${API_BASE_URL}/hotels`, options);
    return handleResponse(res);
  },

  /**
   * Update existing hotel by ID
   */
  async updateHotel(id, formDataOrData) {
    const options = {
      method: 'PUT',
    };

    if (formDataOrData instanceof FormData) {
      options.body = formDataOrData;
    } else {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(formDataOrData);
    }

    const res = await fetch(`${API_BASE_URL}/hotels/${id}`, options);
    return handleResponse(res);
  },

  /**
   * Delete hotel by ID
   */
  async deleteHotel(id) {
    const res = await fetch(`${API_BASE_URL}/hotels/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },
};
