import React, { useEffect, useRef } from 'react';
import Button from './Button';
import './DeleteModal.css';

const DeleteModal = ({ isOpen, onClose, onConfirm, hotelName }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex="-1"
        ref={modalRef}
      >
        <h2 id="modal-title">Delete hotel?</h2>
        <p>Are you sure you want to delete <br/> <strong>"{hotelName}"</strong>?</p>
        <p className="modal-warning">This action cannot be undone.</p>
        
        <div className="modal-actions">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm} style={{ backgroundColor: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
            Delete Hotel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
