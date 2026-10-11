const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const upload = require('../middleware/uploadMiddleware');

// Get all hotels (with search, price filter, pagination)
router.get('/', hotelController.getHotels);

// Get hotel by ID
router.get('/:id', hotelController.getHotelById);

// Create new hotel
router.post('/', upload.single('image'), hotelController.createHotel);

// Update existing hotel
router.put('/:id', upload.single('image'), hotelController.updateHotel);

// Delete hotel
router.delete('/:id', hotelController.deleteHotel);

module.exports = router;
