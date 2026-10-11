/**
 * Validates a single hotel object for data integrity.
 * @param {Object} hotel 
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateHotelData = (hotel) => {
  const errors = [];

  if (!hotel) {
    return { valid: false, errors: ['Hotel object is null or undefined'] };
  }

  if (!hotel.id || typeof hotel.id !== 'string' || !hotel.id.trim()) {
    errors.push('Hotel ID must be a non-empty string');
  }

  if (!hotel.image || typeof hotel.image !== 'string' || !hotel.image.trim()) {
    errors.push('Hotel image must be a valid path string');
  }

  if (!hotel.title || typeof hotel.title !== 'string' || !hotel.title.trim()) {
    errors.push('Hotel title must be a non-empty string');
  }

  if (!hotel.description || typeof hotel.description !== 'string' || !hotel.description.trim()) {
    errors.push('Hotel description must be a non-empty string');
  }

  if (typeof hotel.latitude !== 'number' || Number.isNaN(hotel.latitude) || hotel.latitude < -90 || hotel.latitude > 90) {
    errors.push('Hotel latitude must be a number between -90 and 90');
  }

  if (typeof hotel.longitude !== 'number' || Number.isNaN(hotel.longitude) || hotel.longitude < -180 || hotel.longitude > 180) {
    errors.push('Hotel longitude must be a number between -180 and 180');
  }

  if (typeof hotel.price !== 'number' || Number.isNaN(hotel.price) || hotel.price <= 0) {
    errors.push('Hotel price must be a positive number');
  }

  if (typeof hotel.rating !== 'number' || Number.isNaN(hotel.rating) || hotel.rating < 0 || hotel.rating > 5) {
    errors.push('Hotel rating must be a number between 0 and 5');
  }

  if (typeof hotel.reviews !== 'number' || Number.isNaN(hotel.reviews) || hotel.reviews < 0 || !Number.isInteger(hotel.reviews)) {
    errors.push('Hotel reviews must be a non-negative integer');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Validates the initial seed dataset during development.
 * @param {Array} hotels 
 * @returns {boolean}
 */
export const validateInitialHotels = (hotels) => {
  if (!Array.isArray(hotels)) {
    console.error('Initial hotels data is not an array.');
    return false;
  }

  if (hotels.length !== 100) {
    console.error(`Initial hotels count mismatch: expected 100, found ${hotels.length}`);
    return false;
  }

  const idSet = new Set();
  let isValid = true;

  hotels.forEach((hotel, index) => {
    if (idSet.has(hotel.id)) {
      console.error(`Duplicate hotel ID found: ${hotel.id} at index ${index}`);
      isValid = false;
    }
    idSet.add(hotel.id);

    const validation = validateHotelData(hotel);
    if (!validation.valid) {
      console.error(`Invalid hotel record at index ${index} (${hotel.id || 'No ID'}):`, validation.errors);
      isValid = false;
    }
  });

  if (isValid) {
    console.log(`[Dev Validation] Initial hotels dataset verified successfully (${hotels.length} valid unique records).`);
  }

  return isValid;
};
