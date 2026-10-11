-- Database Schema for Hotels
CREATE TABLE IF NOT EXISTS hotels (
    id SERIAL PRIMARY KEY,
    image TEXT,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
    longitude DECIMAL(10, 7) NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
    price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    reviews INTEGER DEFAULT 0 CHECK (reviews >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
