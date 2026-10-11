const STORAGE_KEY = 'hotel-finder-hotels';

/**
 * Loads stored hotels from LocalStorage.
 * @returns {Array|null} Parsed hotels array or null if unavailable/invalid.
 */
export const loadHotels = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return null;
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('Failed to load hotels from localStorage:', error);
    return null;
  }
};

/**
 * Saves hotels array to LocalStorage.
 * @param {Array} hotels 
 */
export const saveHotels = (hotels) => {
  try {
    if (Array.isArray(hotels)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    }
  } catch (error) {
    console.error('Failed to save hotels to localStorage:', error);
  }
};

/**
 * Clears stored hotels key from LocalStorage.
 */
export const clearHotels = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear hotels from localStorage:', error);
  }
};
