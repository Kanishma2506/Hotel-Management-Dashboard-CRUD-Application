import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createHotel, updateHotel } from '../../store/hotelSlice';
import { getImageUrl } from '../../utils/hotelHelpers';
import Button from '../common/Button';
import './HotelForm.css';

const PLACEHOLDER_IMAGE = '/hotels/hotel-placeholder.svg';

const HotelForm = ({ mode, hotel, onToast }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    image: '',
    title: '',
    description: '',
    latitude: '',
    longitude: '',
    price: '',
    rating: 0,
    reviews: 0,
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && hotel) {
      setFormData({
        image: hotel.image || '',
        title: hotel.title || '',
        description: hotel.description || '',
        latitude: hotel.latitude !== undefined ? hotel.latitude : '',
        longitude: hotel.longitude !== undefined ? hotel.longitude : '',
        price: hotel.price !== undefined ? hotel.price : '',
        rating: hotel.rating !== undefined ? hotel.rating : 0,
        reviews: hotel.reviews !== undefined ? hotel.reviews : 0,
      });
      setImagePreview(getImageUrl(hotel.image));
    }
  }, [mode, hotel]);

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'title':
        if (!value || !value.trim() || value.trim().length < 3 || value.trim().length > 100) {
          error = 'Hotel title must be between 3 and 100 characters.';
        }
        break;
      case 'description':
        if (!value || !value.trim() || value.trim().length < 20 || value.trim().length > 1000) {
          error = 'Description must be between 20 and 1000 characters.';
        }
        break;
      case 'latitude':
        const lat = parseFloat(value);
        if (value === '' || isNaN(lat) || lat < -90 || lat > 90) {
          error = 'Latitude must be between -90 and 90.';
        }
        break;
      case 'longitude':
        const lng = parseFloat(value);
        if (value === '' || isNaN(lng) || lng < -180 || lng > 180) {
          error = 'Longitude must be between -180 and 180.';
        }
        break;
      case 'price':
        const price = parseFloat(value);
        if (value === '' || isNaN(price) || price <= 0) {
          error = 'Price must be greater than zero.';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const validateForm = () => {
    const newErrors = {};

    ['title', 'description', 'latitude', 'longitude', 'price'].forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    if (mode === 'create' && !selectedFile && !formData.image) {
      newErrors.image = 'An image is required for new hotel listing.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Please upload a JPG, JPEG, PNG, or WebP image.' }));
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, image: 'Image size must be less than 5 MB.' }));
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));

    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submissionData = new FormData();
      submissionData.append('title', formData.title.trim());
      submissionData.append('description', formData.description.trim());
      submissionData.append('latitude', formData.latitude);
      submissionData.append('longitude', formData.longitude);
      submissionData.append('price', formData.price);
      submissionData.append('rating', formData.rating || 0);
      submissionData.append('reviews', formData.reviews || 0);

      if (selectedFile) {
        submissionData.append('image', selectedFile);
      } else if (formData.image) {
        submissionData.append('image', formData.image);
      }

      if (mode === 'create') {
        await dispatch(createHotel(submissionData)).unwrap();
        if (onToast) onToast('Hotel added successfully.');
        navigate('/hotels');
      } else if (mode === 'edit') {
        await dispatch(updateHotel({ id: hotel.id, formDataOrData: submissionData })).unwrap();
        if (onToast) onToast('Hotel updated successfully.');
        navigate('/hotels');
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = typeof err === 'string' ? err : (err.message || 'Failed to save hotel.');
      setSubmitError(msg);
    }
  };

  return (
    <form className="hotel-form" onSubmit={handleSubmit}>
      {submitError && (
        <div className="error-banner" style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}>
          {submitError}
        </div>
      )}

      <div className="hotel-form-group">
        <label>Image</label>
        <div className="image-preview-container">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt={formData.title ? `Preview of ${formData.title}` : "Hotel preview"} 
              className="image-preview" 
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
            />
          ) : (
            <div className="image-placeholder">No image selected</div>
          )}
        </div>
        <input 
          type="file" 
          accept="image/jpeg, image/jpg, image/png, image/webp" 
          onChange={handleImageChange} 
        />
        {errors.image && <span className="error-message">{errors.image}</span>}
      </div>

      <div className="hotel-form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          value={formData.title}
          onChange={handleChange}
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>

      <div className="hotel-form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          maxLength={1000}
        />
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', alignSelf: 'flex-end' }}>
          {formData.description.length} / 1000
        </div>
        {errors.description && <span className="error-message">{errors.description}</span>}
      </div>

      <div className="hotel-form-group">
        <label htmlFor="latitude">Latitude</label>
        <input
          id="latitude"
          name="latitude"
          type="number"
          step="any"
          value={formData.latitude}
          onChange={handleChange}
        />
        {errors.latitude && <span className="error-message">{errors.latitude}</span>}
      </div>

      <div className="hotel-form-group">
        <label htmlFor="longitude">Longitude</label>
        <input
          id="longitude"
          name="longitude"
          type="number"
          step="any"
          value={formData.longitude}
          onChange={handleChange}
        />
        {errors.longitude && <span className="error-message">{errors.longitude}</span>}
      </div>

      <div className="hotel-form-group">
        <label htmlFor="price">Price (₹)</label>
        <input
          id="price"
          name="price"
          type="number"
          step="any"
          value={formData.price}
          onChange={handleChange}
        />
        {errors.price && <span className="error-message">{errors.price}</span>}
      </div>

      <div className="hotel-form-actions">
        <Button type="button" variant="ghost" onClick={() => navigate('/hotels')} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {mode === 'create' 
            ? (isSubmitting ? 'Adding Hotel...' : 'Add Hotel') 
            : (isSubmitting ? 'Saving Changes...' : 'Save Changes')}
        </Button>
      </div>
    </form>
  );
};

export default HotelForm;
