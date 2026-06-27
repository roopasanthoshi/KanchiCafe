import React, { useState, useEffect } from 'react';

// Custom SVG Star
const StarIcon = ({ filled }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={filled ? '' : 'empty'}
    style={{
      width: '18px',
      height: '18px',
      fill: filled ? '#ffb300' : 'none',
      stroke: '#ffb300',
      strokeWidth: '1.5',
      marginRight: '2px'
    }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('All');

  // Custom Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    reviewId: null
  });

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openDeleteConfirm = (id) => {
    setConfirmModal({
      isOpen: true,
      reviewId: id
    });
  };

  const handleDelete = async () => {
    const id = confirmModal.reviewId;
    setConfirmModal({ isOpen: false, reviewId: null });

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Immediately remove from local state
        setReviews(prev => prev.filter(r => r.id !== id));
        
        // Dispatch success toast
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Review deleted successfully!', type: 'success' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Failed to delete review.', type: 'error' }
        }));
      }
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'An error occurred while deleting.', type: 'error' }
      }));
    }
  };

  // Recalculate Average Rating from state
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  // Recalculate Rating Distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });

  const filteredReviews = filterRating === 'All'
    ? reviews
    : reviews.filter(r => r.rating === Number(filterRating));

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Reviews</h1>
        <div style={{ fontSize: '13px', color: '#8a7c73', fontWeight: '500' }}>
          Customer feedback
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid #f1ebd8',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#8a7c73',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#3c2218', marginBottom: '5px' }}>No Reviews Yet</h3>
          <p style={{ fontSize: '14px', color: '#8a7c73' }}>Reviews submitted by customers will show up here.</p>
        </div>
      ) : (
        <div>
          {/* Reviews Summary Section */}
          <div className="reviews-summary-row">
            <div className="avg-rating-card">
              <div className="avg-rating-num">{averageRating}</div>
              <div className="stars-row" style={{ justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <StarIcon key={num} filled={num <= Math.round(Number(averageRating))} />
                ))}
              </div>
              <div style={{ fontSize: '13px', color: '#8a7c73', fontWeight: '500' }}>
                Based on {totalReviews} review{totalReviews > 1 ? 's' : ''}
              </div>
            </div>

            {/* Rating Distribution Box */}
            <div style={{
              background: '#fff',
              border: '1px solid #f1ebd8',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Rating Distribution</h3>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars];
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                    <span style={{ width: '45px', fontWeight: '600', color: '#3c2218' }}>{stars} stars</span>
                    <div style={{ flexGrow: 1, height: '8px', backgroundColor: '#f1ebd8', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#d1a153', borderRadius: '4px' }}></div>
                    </div>
                    <span style={{ width: '25px', textAnchor: 'end', color: '#8a7c73', fontWeight: '600' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Header */}
          <div className="reviews-filter-header">
            <div style={{ fontSize: '14px', color: '#8a7c73', fontWeight: '500' }}>
              Showing {filteredReviews.length} reviews
            </div>
            
            <select 
              value={filterRating} 
              onChange={(e) => setFilterRating(e.target.value)}
              className="select-control"
              style={{ width: '150px' }}
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Reviews List */}
          {filteredReviews.length === 0 ? (
            <div style={{
              background: '#fff',
              border: '1px solid #f1ebd8',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#8a7c73'
            }}>
              No reviews found matching {filterRating} star{filterRating !== '1' ? 's' : ''}.
            </div>
          ) : (
            <div className="reviews-list">
              {filteredReviews.map((rev) => (
                <div key={rev.id} className="review-card">
                  <div className="review-card-header">
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <StarIcon key={num} filled={num <= rev.rating} />
                      ))}
                    </div>
                    <span className="review-date">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <p className="review-text">
                    {rev.review_text || <span style={{ color: '#b0a49c', fontStyle: 'italic' }}>No comment left.</span>}
                  </p>

                  <button 
                    onClick={() => openDeleteConfirm(rev.id)} 
                    className="review-delete-btn"
                    title="Delete Review"
                    id={`btn-delete-review-${rev.id}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Premium custom confirmation modal */}
      {confirmModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center', padding: '30px' }}>
            <h3 className="modal-title" style={{ color: '#c62828', fontSize: '20px', marginBottom: '10px' }}>
              Delete Review?
            </h3>
            
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              Are you sure you want to delete this customer feedback? This action is permanent and cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setConfirmModal({ isOpen: false, reviewId: null })} 
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleDelete} 
                className="btn btn-danger"
                style={{ flex: 1 }}
                id="modal-confirm-delete-review-btn"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
