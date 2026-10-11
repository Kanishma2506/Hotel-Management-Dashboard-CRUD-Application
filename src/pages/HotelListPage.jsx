import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import HotelCard from '../components/hotels/HotelCard';
import HotelSearch from '../components/hotels/HotelSearch';
import PriceFilter from '../components/hotels/PriceFilter';
import Toast from '../components/common/Toast';
import DeleteModal from '../components/common/DeleteModal';
import { selectHotels, selectHotelsTotal, selectHotelsLoading, selectHotelsError } from '../store/hotelSelectors';
import { fetchHotels, deleteHotel } from '../store/hotelSlice';
import { Helmet } from 'react-helmet-async';
import './HotelListPage.css';

const ITEMS_PER_PAGE = 10;

const HotelListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const hotels = useSelector(selectHotels);
  const total = useSelector(selectHotelsTotal);
  const loading = useSelector(selectHotelsLoading);
  const error = useSelector(selectHotelsError);

  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [hotelToDelete, setHotelToDelete] = useState(null);

  const isFiltered = searchTerm.trim() !== '' || minPrice !== '' || maxPrice !== '';

  // Trigger server-side fetch whenever filters or page change
  useEffect(() => {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    dispatch(fetchHotels({
      title: searchTerm,
      minPrice,
      maxPrice,
      offset,
      limit: ITEMS_PER_PAGE,
    }));
  }, [dispatch, searchTerm, minPrice, maxPrice, currentPage]);

  // Reset page to 1 when filters change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleMinPriceChange = (value) => {
    setMinPrice(value);
    setCurrentPage(1);
  };

  const handleMaxPriceChange = (value) => {
    setMaxPrice(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const confirmDelete = async () => {
    if (!hotelToDelete) return;
    try {
      await dispatch(deleteHotel(hotelToDelete.id)).unwrap();
      setToastMessage('Hotel deleted successfully.');
      setHotelToDelete(null);
      // Re-fetch current page
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      dispatch(fetchHotels({
        title: searchTerm,
        minPrice,
        maxPrice,
        offset,
        limit: ITEMS_PER_PAGE,
      }));
    } catch (err) {
      setToastMessage(typeof err === 'string' ? err : 'Failed to delete hotel.');
      setHotelToDelete(null);
    }
  };

  const startRecord = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * ITEMS_PER_PAGE, total);

  return (
    <div className="hotel-list-page">
      <Helmet>
        <title>Hotels | HotelFinder</title>
        <meta name="description" content="Find and manage your hotel listings." />
      </Helmet>

      {/* Page Header */}
      <div className="hotel-page-header">
        <div>
          <h1>Hotels</h1>
          <p className="hotel-page-subtitle">Find and manage your hotel listings.</p>
        </div>
        <Button onClick={() => navigate('/hotels/new')}>+ Add Hotel</Button>
      </div>

      {/* Filter Bar */}
      <div className="hotel-filter-bar">
        <HotelSearch value={searchTerm} onChange={handleSearchChange} />
        <PriceFilter
          minPrice={minPrice}
          maxPrice={maxPrice}
          onMinChange={handleMinPriceChange}
          onMaxChange={handleMaxPriceChange}
          onClear={handleClearFilters}
          isFiltered={isFiltered}
        />
      </div>

      {/* Results Count Summary */}
      <div className="hotel-results-info">
        <span className="results-count">
          {loading ? (
            'Loading hotels...'
          ) : total === 0 ? (
            '0 hotels found'
          ) : (
            `Showing ${startRecord}\u2013${endRecord} of ${total} ${total === 1 ? 'hotel' : 'hotels'}`
          )}
        </span>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
          <p>Loading hotel listings from server...</p>
        </div>
      ) : error ? (
        <EmptyState
          title="Error loading hotels"
          description={error || "Could not connect to the backend server."}
          action={<Button onClick={handleClearFilters}>Try Again</Button>}
        />
      ) : hotels.length === 0 ? (
        <EmptyState
          title="No hotels found"
          description="Try changing your search terms or price range filters."
          action={<Button onClick={handleClearFilters}>Clear Filters</Button>}
        />
      ) : (
        <>
          <div className="hotel-cards-grid">
            {hotels.map((hotel) => (
              <HotelCard 
                key={hotel.id} 
                hotel={hotel} 
                onDeleteRequest={(h) => setHotelToDelete(h)}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <DeleteModal 
        isOpen={!!hotelToDelete}
        onClose={() => setHotelToDelete(null)}
        onConfirm={confirmDelete}
        hotelName={hotelToDelete?.title || ''}
      />

      <Toast 
        message={toastMessage} 
        onClose={() => setToastMessage('')} 
      />
    </div>
  );
};

export default HotelListPage;
