const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { validateHotelData } = require('../utils/hotelValidation');

// Format database row to clean JS types
const formatHotel = (row) => ({
  id: row.id,
  image: row.image,
  title: row.title,
  description: row.description,
  latitude: Number(row.latitude),
  longitude: Number(row.longitude),
  price: Number(row.price),
  rating: Number(row.rating),
  reviews: Number(row.reviews),
  created_at: row.created_at,
  updated_at: row.updated_at,
});

/**
 * GET /api/hotels
 * Support title search, price filter, pagination
 */
exports.getHotels = async (req, res, next) => {
  try {
    const { title, minPrice, maxPrice, offset = 0, limit = 10 } = req.query;

    const conditions = [];
    const params = [];

    if (title && title.trim() !== '') {
      params.push(`%${title.trim()}%`);
      conditions.push(`title ILIKE $${params.length}`);
    }

    if (minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice))) {
      params.push(Number(minPrice));
      conditions.push(`price >= $${params.length}`);
    }

    if (maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice))) {
      params.push(Number(maxPrice));
      conditions.push(`price <= $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count matching records
    const countQuery = `SELECT COUNT(*) FROM hotels ${whereClause}`;
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count, 10);

    // Paginate matching records
    const parsedOffset = Math.max(0, parseInt(offset, 10) || 0);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);

    const dataParams = [...params, parsedLimit, parsedOffset];
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

    const dataQuery = `
      SELECT id, image, title, description, latitude, longitude, price, rating, reviews, created_at, updated_at
      FROM hotels
      ${whereClause}
      ORDER BY id ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const dataResult = await db.query(dataQuery, dataParams);
    const hotels = dataResult.rows.map(formatHotel);

    return res.status(200).json({
      success: true,
      data: hotels,
      pagination: {
        total,
        offset: parsedOffset,
        limit: parsedLimit,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/hotels/:id
 */
exports.getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT * FROM hotels WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatHotel(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/hotels
 */
exports.createHotel = async (req, res, next) => {
  try {
    const { isValid, errors } = validateHotelData(req.body, false);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const { title, description, latitude, longitude, price, rating = 0, reviews = 0 } = req.body;

    let imagePath = '/hotels/hotel-001.webp';
    if (req.file) {
      imagePath = `/uploads/hotels/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    }

    const insertQuery = `
      INSERT INTO hotels (title, description, latitude, longitude, price, rating, reviews, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      title.trim(),
      description.trim(),
      Number(latitude),
      Number(longitude),
      Number(price),
      Number(rating),
      Number(reviews),
      imagePath,
    ];

    const result = await db.query(insertQuery, values);

    return res.status(201).json({
      success: true,
      data: formatHotel(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/hotels/:id
 */
exports.updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if hotel exists
    const existing = await db.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    const existingHotel = existing.rows[0];

    const { isValid, errors } = validateHotelData(req.body, true);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const title = req.body.title !== undefined ? req.body.title.trim() : existingHotel.title;
    const description = req.body.description !== undefined ? req.body.description.trim() : existingHotel.description;
    const latitude = req.body.latitude !== undefined ? Number(req.body.latitude) : Number(existingHotel.latitude);
    const longitude = req.body.longitude !== undefined ? Number(req.body.longitude) : Number(existingHotel.longitude);
    const price = req.body.price !== undefined ? Number(req.body.price) : Number(existingHotel.price);
    const rating = req.body.rating !== undefined ? Number(req.body.rating) : Number(existingHotel.rating);
    const reviews = req.body.reviews !== undefined ? Number(req.body.reviews) : Number(existingHotel.reviews);

    let imagePath = existingHotel.image;
    if (req.file) {
      imagePath = `/uploads/hotels/${req.file.filename}`;
      // Remove old image if stored locally
      if (existingHotel.image && existingHotel.image.startsWith('/uploads/hotels/')) {
        const oldFileName = path.basename(existingHotel.image);
        const oldFilePath = path.join(__dirname, '../uploads/hotels', oldFileName);
        if (oldFilePath.startsWith(path.join(__dirname, '../uploads/hotels')) && fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (e) {
            console.error('Failed to remove old image file:', e);
          }
        }
      }
    } else if (req.body.image && req.body.image.trim() !== '') {
      imagePath = req.body.image.trim();
    }

    const updateQuery = `
      UPDATE hotels
      SET title = $1,
          description = $2,
          latitude = $3,
          longitude = $4,
          price = $5,
          rating = $6,
          reviews = $7,
          image = $8,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;

    const values = [title, description, latitude, longitude, price, rating, reviews, imagePath, id];
    const result = await db.query(updateQuery, values);

    return res.status(200).json({
      success: true,
      data: formatHotel(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/hotels/:id
 */
exports.deleteHotel = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.query('SELECT * FROM hotels WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    const existingHotel = existing.rows[0];

    // Remove file if stored locally in uploads/hotels
    if (existingHotel.image && existingHotel.image.startsWith('/uploads/hotels/')) {
      const fileName = path.basename(existingHotel.image);
      const filePath = path.join(__dirname, '../uploads/hotels', fileName);
      if (filePath.startsWith(path.join(__dirname, '../uploads/hotels')) && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error('Failed to delete image file:', e);
        }
      }
    }

    await db.query('DELETE FROM hotels WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
