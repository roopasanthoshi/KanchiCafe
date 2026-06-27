import React, { useState, useEffect } from 'react';

export default function AdminApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom Confirmation Dialog State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'approve' | 'reject'
    orderId: null,
    orderNumber: ''
  });

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/admin/approvals');
      const data = await res.json();
      setApprovals(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
    
    const interval = setInterval(fetchApprovals, 5000); // 5s refresh
    
    // Listen for custom SSE notifications
    window.addEventListener('api-refresh', fetchApprovals);

    return () => {
      clearInterval(interval);
      window.removeEventListener('api-refresh', fetchApprovals);
    };
  }, []);

  const openConfirmation = (type, orderId, orderNumber) => {
    setConfirmModal({
      isOpen: true,
      type,
      orderId,
      orderNumber
    });
  };

  const handleConfirmAction = async () => {
    const { type, orderId } = confirmModal;
    setConfirmModal({ isOpen: false, type: '', orderId: null, orderNumber: '' });
    
    try {
      const endpoint = type === 'approve' ? 'approve' : 'reject';
      const res = await fetch(`/api/admin/orders/${orderId}/${endpoint}`, { method: 'PUT' });
      if (res.ok) {
        fetchApprovals();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Order payment has been ${type === 'approve' ? 'approved' : 'rejected'}.`, type: 'success' }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Failed to process payment status.', type: 'error' }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Approvals</h1>
        <div style={{ fontSize: '13px', color: '#8a7c73', fontWeight: '500' }}>
          Pending verification
        </div>
      </div>

      {loading && approvals.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading approvals...</div>
      ) : approvals.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid #f1ebd8',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#8a7c73',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', color: '#d1a153', marginBottom: '15px' }}>
            <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#3c2218', marginBottom: '5px' }}>No Pending Approvals</h3>
          <p style={{ fontSize: '14px', color: '#8a7c73' }}>All customer payments are up to date.</p>
        </div>
      ) : (
        <div className="approvals-list">
          <div style={{ fontSize: '14px', color: '#8a7c73', marginBottom: '10px', fontWeight: '500' }}>
            {approvals.length} payment{approvals.length > 1 ? 's' : ''} awaiting approval
          </div>
          {approvals.map((order) => (
            <div key={order.id} className="order-card" style={{ maxWidth: '650px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#3c2218' }}>{order.order_number}</h3>
                  <div className="table-badge" style={{ display: 'inline-block', marginTop: '4px' }}>Table {order.table_number}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#8a7c73', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#3c2218' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Customer Metadata Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', backgroundColor: 'rgba(247, 242, 234, 0.5)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#8a7c73' }}>Customer:</span> <strong style={{ color: '#3c2218' }}>{order.customer_name}</strong>
                </div>
                <div>
                  <span style={{ color: '#8a7c73' }}>Mobile:</span> <strong style={{ color: '#3c2218' }}>{order.customer_mobile}</strong>
                </div>
                <div>
                  <span style={{ color: '#8a7c73' }}>Payment Time:</span> <strong style={{ color: '#3c2218' }}>
                    {order.payment_time ? new Date(order.payment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#8a7c73' }}>Payment Status:</span> <strong style={{ color: '#d1a153' }}>{order.status}</strong>
                </div>
              </div>

              {/* Items summary */}
              <div style={{ fontSize: '14px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#8a7c73', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Ordered Items</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {order.items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.item_name} <span style={{ color: '#8a7c73' }}>&times; {item.quantity}</span></span>
                      <strong>₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {order.notes && (
                <div className="order-notes-box">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button 
                  onClick={() => openConfirmation('approve', order.id, order.order_number)}
                  className="btn btn-primary"
                  style={{ flexGrow: 1 }}
                  id={`btn-approve-${order.id}`}
                >
                  Approve
                </button>
                <button 
                  onClick={() => openConfirmation('reject', order.id, order.order_number)}
                  className="btn btn-danger"
                  style={{ flexGrow: 1 }}
                  id={`btn-reject-${order.id}`}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Premium React-based Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center', padding: '30px' }}>
            <h3 className="modal-title" style={{ 
              color: confirmModal.type === 'approve' ? 'var(--primary-color)' : '#c62828',
              fontSize: '20px',
              marginbottom: '10px'
            }}>
              {confirmModal.type === 'approve' ? 'Confirm Payment Approval' : 'Confirm Payment Rejection'}
            </h3>
            
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
              {confirmModal.type === 'approve' 
                ? `Are you sure you want to APPROVE payment for ${confirmModal.orderNumber}? This will send the order details to the kitchen immediately.`
                : `Are you sure you want to REJECT payment for ${confirmModal.orderNumber}? This will cancel the order.`
              }
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setConfirmModal({ isOpen: false, type: '', orderId: null, orderNumber: '' })} 
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleConfirmAction} 
                className={`btn ${confirmModal.type === 'approve' ? 'btn-primary' : 'btn-danger'}`}
                style={{ flex: 1 }}
                id="modal-confirm-btn"
              >
                Yes, Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
