import React, { useState, useEffect } from 'react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // 5s auto-refresh for real-time
    
    // Listen for custom SSE notifications
    window.addEventListener('api-refresh', fetchOrders);

    return () => {
      clearInterval(interval);
      window.removeEventListener('api-refresh', fetchOrders);
    };
  }, [statusFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Orders</h1>
        
        {/* Status Filter Dropdown */}
        <div>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-control"
            style={{ width: '180px' }}
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div style={{ 
          background: '#fff', 
          border: '1px solid #f1ebd8', 
          borderRadius: '12px', 
          padding: '50px 20px', 
          textAlign: 'center', 
          color: '#8a7c73', 
          boxShadow: 'var(--shadow-soft)'
        }}>
          No orders found for status: <strong>{statusFilter}</strong>
        </div>
      ) : (
        <div className="orders-list">
          <div style={{ fontSize: '14px', color: '#8a7c73', marginBottom: '10px', fontWeight: '500' }}>
            {orders.length} order{orders.length > 1 ? 's' : ''} found
          </div>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta-info">
                  <div className="order-meta-row">
                    <span className="order-id-label">{order.order_number}</span>
                    <span className="table-badge">Table {order.table_number}</span>
                    <span className={`badge badge-${order.status.toLowerCase().replace(' ', '')}`}>{order.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a7c73', marginTop: '4px' }}>
                    {new Date(order.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
                <div className="order-total-price">
                  ₹{Number(order.total_amount).toLocaleString('en-IN')}
                </div>
              </div>

              {/* Customer Metadata Banner */}
              <div className="order-customer-banner">
                <span>Customer: <strong>{order.customer_name}</strong></span>
                <span>Mobile: <strong>{order.customer_mobile}</strong></span>
              </div>

              {/* Ordered Items List */}
              <div className="order-items-container">
                {order.items?.map((item) => (
                  <div key={item.id} className="order-item-row">
                    <span style={{ fontWeight: '500' }}>
                      {item.item_name} <span style={{ color: '#8a7c73', fontSize: '13px' }}>&times; {item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: '600' }}>
                      ₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="order-notes-box">
                  <strong>Notes:</strong> {order.notes}
                </div>
              )}

              {/* Dynamic Action Buttons Footer */}
              {(order.status === 'Preparing' || order.status === 'Ready') && (
                <div className="order-actions-footer">
                  {order.status === 'Preparing' && (
                    <>
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Ready')}
                        className="btn btn-primary"
                      >
                        Mark ready
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                        className="btn btn-danger"
                      >
                        Mark cancelled
                      </button>
                    </>
                  )}

                  {order.status === 'Ready' && (
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'Delivered')}
                      className="btn btn-primary"
                    >
                      Mark delivered
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
