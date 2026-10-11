const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Extract base server host without trailing /api
const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');
const DEFAULT_PLACEHOLDER = '/hotels/hotel-placeholder.svg';

/**
 * Returns full URL for hotel images (prefacing relative uploads/hotels paths with server base URL)
 * @param {string} imagePath 
 * @returns {string}
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return DEFAULT_PLACEHOLDER;
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/hotels/')) {
    return `${SERVER_BASE_URL}${imagePath}`;
  }

  if (imagePath.startsWith('uploads/')) {
    return `${SERVER_BASE_URL}/${imagePath}`;
  }

  return imagePath;
};

/**
 * Formats a numeric price into INR currency display.
 * @param {number} price 
 * @returns {string} e.g. "₹4,500"
 */
export const formatPrice = (price) => {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Finds a hotel record by its unique ID.
 * @param {Array} hotels 
 * @param {string|number} id 
 * @returns {Object|null}
 */
export const getHotelById = (hotels, id) => {
  if (!Array.isArray(hotels) || id === undefined || id === null) return null;
  return hotels.find((hotel) => String(hotel.id) === String(id)) || null;
};

/**
 * Validates coordinate pair.
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {boolean}
 */
export const validateHotelCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    !Number.isNaN(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    !Number.isNaN(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Truncates a description string cleanly to a maximum length.
 * @param {string} description 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateDescription = (description, maxLength = 120) => {
  if (!description || typeof description !== 'string') return '';
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength).trim()}...`;
};
