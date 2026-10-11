/**
 * Validates hotel request body for creation or update.
 * @param {Object} data 
 * @param {boolean} isUpdate 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateHotelData(data, isUpdate = false) {
  const errors = [];

  // Title validation
  if (!isUpdate || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 3 || data.title.trim().length > 100) {
      errors.push('Title must be between 3 and 100 characters.');
    }
  }

  // Description validation
  if (!isUpdate || data.description !== undefined) {
    if (typeof data.description !== 'string' || data.description.trim().length < 20 || data.description.trim().length > 1000) {
      errors.push('Description must be between 20 and 1000 characters.');
    }
  }

  // Latitude validation
  if (!isUpdate || data.latitude !== undefined) {
    const lat = Number(data.latitude);
    if (data.latitude === undefined || data.latitude === '' || isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Latitude must be a valid number between -90 and 90.');
    }
  }

  // Longitude validation
  if (!isUpdate || data.longitude !== undefined) {
    const lng = Number(data.longitude);
    if (data.longitude === undefined || data.longitude === '' || isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Longitude must be a valid number between -180 and 180.');
    }
  }

  // Price validation
  if (!isUpdate || data.price !== undefined) {
    const price = Number(data.price);
    if (data.price === undefined || data.price === '' || isNaN(price) || price <= 0) {
      errors.push('Price must be a number greater than 0.');
    }
  }

  // Rating validation
  if (data.rating !== undefined && data.rating !== '') {
    const rating = Number(data.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push('Rating must be a number between 0 and 5.');
    }
  }

  // Reviews validation
  if (data.reviews !== undefined && data.reviews !== '') {
    const reviews = Number(data.reviews);
    if (isNaN(reviews) || !Number.isInteger(reviews) || reviews < 0) {
      errors.push('Reviews must be an integer greater than or equal to 0.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateHotelData,
};
