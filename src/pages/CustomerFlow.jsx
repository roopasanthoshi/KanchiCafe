import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Custom SVG Icons for Customer View
const Icons = {
  Hamburger: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px', cursor: 'pointer' }}>
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Copy: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Back: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
      <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px', cursor: 'pointer' }}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  History: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><polyline points="3 3 3 8 8 8" /><line x1="12" y1="7" x2="12" y2="12" /><line x1="12" y1="12" x2="16" y2="14" /></svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
  ),
  Success: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', color: '#d1a153' }}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg 
      viewBox="0 0 24 24" 
      style={{
        width: '32px',
        height: '32px',
        fill: filled ? '#ffb300' : 'none',
        stroke: '#ffb300',
        strokeWidth: '1.5',
        marginRight: '4px'
      }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
};

export default function CustomerFlow() {
  const { tableNumber } = useParams();

  // Settings loaded from backend (UPI ID, Cafe Name)
  const [cafeSettings, setCafeSettings] = useState({
    cafe_name: 'KANCHI CAFE',
    upi_id: 'kanchicafe@upi'
  });

  // Client session state (Name and Mobile)
  const [customer, setCustomer] = useState(() => {
    const saved = sessionStorage.getItem('kc_customer');
    return saved ? JSON.parse(saved) : null;
  });

  // Current view state: 'login' | 'menu' | 'cart' | 'current-orders' | 'previous-orders' | 'profile' | 'grace' | 'payment' | 'tracker' | 'completed'
  const [view, setView] = useState('login');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Menu data
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart state
  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState('');

  // Active Order context (currently tracked order)
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [graceSeconds, setGraceSeconds] = useState(20); // 20 seconds grace period
  const [isOrderEditable, setIsOrderEditable] = useState(true);

  // Full order history for statistics and list rendering
  const [orderHistory, setOrderHistory] = useState([]);
  const [profileFormData, setProfileFormData] = useState({ name: '', mobile: '' });

  // Review states
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  // Fetch initial cafe settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.cafe) {
          setCafeSettings(data.cafe);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  // Fetch Menu on load
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch('/api/customer/menu');
        const data = await res.json();
        setCategories(data.categories || []);
        setMenuItems(data.items || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchMenu();
  }, []);

  // Fetch Customer Order History (both current and past)
  const fetchOrderHistory = async () => {
    if (!customer?.mobile) return;
    try {
      const res = await fetch(`/api/customer/orders?mobile=${customer.mobile}`);
      const data = await res.json();
      setOrderHistory(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Re-fetch order history when customer details change or view transitions
  useEffect(() => {
    if (customer?.mobile) {
      fetchOrderHistory();
      setProfileFormData({ name: customer.name, mobile: customer.mobile });
    }
  }, [customer, view]);

  // Initial table redirection routing
  useEffect(() => {
    if (!tableNumber) {
      alert('Table number is missing. Please scan a table QR code.');
      return;
    }

    localStorage.setItem('kc_table_number', tableNumber);

    // If customer is tracking an active order for this table, restore it
    const savedOrderId = localStorage.getItem(`kc_active_order_id_t${tableNumber}`);
    if (savedOrderId) {
      setActiveOrderId(Number(savedOrderId));
      pollActiveOrder(Number(savedOrderId));
    } else {
      // Force Customer Login Page on scanning QR
      setView('login');
    }
  }, [tableNumber]);

  // Poll Active Order Status when tracking
  const pollActiveOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/customer/orders/${orderId}`);
      if (!res.ok) {
        localStorage.removeItem(`kc_active_order_id_t${tableNumber}`);
        setView('login');
        return;
      }
      const data = await res.json();
      setActiveOrder(data.order);
      setGraceSeconds(data.remainingSeconds);
      setIsOrderEditable(!data.isLocked);

      // Status Routing
      if (data.order.status === 'Grace Period') {
        setView('grace');
      } else if (data.order.status === 'Pending Payment') {
        setView('payment');
      } else if (data.order.status === 'Pending Approval') {
        setView('tracker'); // displays "Payment Verification" state
      } else if (data.order.status === 'Preparing' || data.order.status === 'Ready') {
        setView('tracker');
      } else if (data.order.status === 'Delivered') {
        setView('completed');
      } else if (data.order.status === 'Cancelled') {
        alert('Your order was cancelled.');
        localStorage.removeItem(`kc_active_order_id_t${tableNumber}`);
        setView('menu');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 4s polling loop for active orders and histories
  useEffect(() => {
    if (!activeOrderId) return;
    
    pollActiveOrder(activeOrderId);

    const timer = setInterval(() => {
      pollActiveOrder(activeOrderId);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeOrderId]);

  // General 4s background sync for list updates
  useEffect(() => {
    if (!customer?.mobile) return;
    const interval = setInterval(fetchOrderHistory, 4000);
    return () => clearInterval(interval);
  }, [customer]);

  // 20-Second Grace Period Countdown Timer
  useEffect(() => {
    if (view !== 'grace' || graceSeconds <= 0) return;

    const timer = setInterval(() => {
      setGraceSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Lock order and proceed to payment
          handleLockOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [view, graceSeconds]);

  // Customer Login Form Continue
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    const mobile = e.target.mobile.value.trim();

    if (!name || !mobile) {
      alert('Please fill all fields');
      return;
    }

    const newCustomer = { name, mobile };
    setCustomer(newCustomer);
    // Store in sessionStorage to persist drawer options during browser session
    sessionStorage.setItem('kc_customer', JSON.stringify(newCustomer));
    setView('menu');
  };

  // Cart actions
  const addToCart = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const updated = { ...prev };
      if (!updated[itemId]) return prev;
      
      if (updated[itemId].quantity <= 1) {
        delete updated[itemId];
      } else {
        updated[itemId].quantity -= 1;
      }
      return updated;
    });
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return Object.values(cart).reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Place Order API
  const handlePlaceOrder = async () => {
    const itemsArray = Object.values(cart).map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    if (itemsArray.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const response = await fetch('/api/customer/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          customerName: customer.name,
          customerMobile: customer.mobile,
          items: itemsArray,
          notes
        })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem(`kc_active_order_id_t${tableNumber}`, data.orderId);
        setActiveOrderId(data.orderId);
        setCart({});
        setNotes('');
        setView('grace');
      } else {
        alert(data.error || 'Failed to place order');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reorder previous meal items
  const handleReorder = (prevOrder) => {
    if (!prevOrder.items || prevOrder.items.length === 0) return;
    
    const itemsMap = {};
    prevOrder.items.forEach(item => {
      const originItem = menuItems.find(mi => mi.id === item.menu_item_id) || {
        id: item.menu_item_id,
        name: item.item_name,
        price: Number(item.price),
        is_available: true
      };
      
      if (originItem.is_available) {
        itemsMap[item.menu_item_id] = {
          ...originItem,
          quantity: item.quantity
        };
      }
    });

    setCart(itemsMap);
    setNotes(`Reordered from ${prevOrder.order_number}`);
    setView('cart');
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Items added back to cart!', type: 'success' }
    }));
  };

  // Edit Order Mode during grace period
  const handleEditOrderMode = () => {
    if (!isOrderEditable) {
      alert('Order is already locked and in preparation.');
      return;
    }
    const itemsMap = {};
    activeOrder.items?.forEach(item => {
      const originItem = menuItems.find(mi => mi.id === item.menu_item_id) || {
        id: item.menu_item_id,
        name: item.item_name,
        price: Number(item.price)
      };
      itemsMap[item.menu_item_id] = {
        ...originItem,
        quantity: item.quantity
      };
    });
    setCart(itemsMap);
    setNotes(activeOrder.notes || '');
    setView('menu');
  };

  // Save changes to order
  const handleSaveEditedOrder = async () => {
    const itemsArray = Object.values(cart).map(item => ({
      id: item.id,
      quantity: item.quantity
    }));

    if (itemsArray.length === 0) {
      handleCancelOrder();
      return;
    }

    try {
      const response = await fetch(`/api/customer/orders/${activeOrderId}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsArray,
          notes
        })
      });
      if (response.ok) {
        setCart({});
        setNotes('');
        setView('grace');
        pollActiveOrder(activeOrderId);
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to save changes');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cancel entire order
  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel your entire order?')) return;
    try {
      const res = await fetch(`/api/customer/orders/${activeOrderId}/cancel`, {
        method: 'DELETE'
      });
      if (res.ok) {
        localStorage.removeItem(`kc_active_order_id_t${tableNumber}`);
        setActiveOrderId(null);
        setActiveOrder(null);
        setCart({});
        setView('menu');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Lock order and proceed to payment
  const handleLockOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${activeOrderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Pending Payment' })
      });
      if (res.ok) {
        setView('payment');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(cafeSettings.upi_id);
    alert('UPI ID copied to clipboard!');
  };

  // Pay complete (No screenshots)
  const handlePaymentSubmit = async () => {
    setSubmittingPayment(true);
    try {
      const res = await fetch(`/api/customer/orders/${activeOrderId}/pay`, {
        method: 'POST'
      });
      setSubmittingPayment(false);
      if (res.ok) {
        setView('tracker');
        pollActiveOrder(activeOrderId);
      } else {
        alert('Failed to submit payment details.');
      }
    } catch (err) {
      setSubmittingPayment(false);
      console.error(err);
    }
  };
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Profile Save Changes
  const handleProfileSave = (e) => {
    e.preventDefault();
    if (!profileFormData.name || !profileFormData.mobile) {
      alert('Please fill all fields');
      return;
    }
    const updated = { name: profileFormData.name, mobile: profileFormData.mobile };
    setCustomer(updated);
    sessionStorage.setItem('kc_customer', JSON.stringify(updated));
    
    window.dispatchEvent(new CustomEvent('show-toast', {
      detail: { message: 'Profile updated successfully!', type: 'success' }
    }));
  };

  // Customer Logout
  const handleLogout = () => {
    sessionStorage.removeItem('kc_customer');
    localStorage.removeItem(`kc_active_order_id_t${tableNumber}`);
    setCustomer(null);
    setActiveOrderId(null);
    setActiveOrder(null);
    setCart({});
    setView('login');
    setIsDrawerOpen(false);
  };

  // Review Feedback Submit API
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customer/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrderId,
          rating: reviewRating,
          reviewText: reviewText
        })
      });
      if (res.ok) {
        setReviewSubmitted(true);
        setTimeout(() => {
          localStorage.removeItem(`kc_active_order_id_t${tableNumber}`);
          setActiveOrderId(null);
          setActiveOrder(null);
          setReviewSubmitted(false);
          setReviewText('');
          setView('menu');
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger Review widget popup automatically on completed view
  useEffect(() => {
    if (view === 'completed') {
      const timer = setTimeout(() => {
        setShowReviewPopup(true);
      }, 3500);
      return () => clearTimeout(timer);
    } else {
      setShowReviewPopup(false);
    }
  }, [view]);

  // Statistics calculation for Profile page
  const totalOrdersCount = orderHistory.length;
  const totalAmountSpent = orderHistory
    .filter(o => o.status !== 'Cancelled' && o.status !== 'Pending Payment')
    .reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  // Filter lists of history
  const currentOrders = orderHistory.filter(o => 
    o.status !== 'Delivered' && o.status !== 'Cancelled'
  );
  const previousOrders = orderHistory.filter(o => 
    o.status === 'Delivered' || o.status === 'Cancelled'
  );

  // Filter and Search Menu logic
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category_name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="customer-viewport">
      {/* Customer Mobile Header */}
      <header className="customer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {customer && (
            <button 
              onClick={() => setIsDrawerOpen(true)}
              style={{ background: 'none', border: 'none', color: '#fff', outline: 'none' }}
              id="hamburger-menu-btn"
            >
              <Icons.Hamburger />
            </button>
          )}
          <div>
            <div className="customer-brand-title">{cafeSettings.cafe_name}</div>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Premium Dining Experience</span>
          </div>
        </div>
        <div className="customer-table-pill">
          Table {tableNumber}
        </div>
      </header>

      <div className="customer-main-content">
        
        {/* STEP 2: FORCED LOGIN SCREEN */}
        {view === 'login' && (
          <div className="customer-login-card">
            <div className="customer-login-logo">
              Kanchi <span>Cafe</span>
            </div>
            <p className="customer-login-welcome">
              Welcome! Please enter your details to browse our premium menu and order.
            </p>
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-input" 
                  placeholder="Enter your name" 
                  required 
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Mobile Number *</label>
                <input 
                  type="tel" 
                  name="mobile" 
                  className="form-input" 
                  placeholder="Enter mobile number" 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                Continue
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: MENU BROWSER SCREEN */}
        {view === 'menu' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: getCartCount() > 0 ? '70px' : '0' }}>
            
            {activeOrderId && (
              <div style={{
                background: 'rgba(209,161,83,0.1)',
                border: '1px solid var(--accent-color)',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '13px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>You have an active order editing.</span>
                <button onClick={() => setView('grace')} className="btn btn-primary btn-sm">Track Timer</button>
              </div>
            )}

            {/* Search Bar */}
            <div className="customer-menu-search">
              <span className="customer-search-icon"><Icons.Search /></span>
              <input 
                type="text" 
                placeholder="Search premium coffee, dosa, thali..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Horizontal Categories Scroll */}
            <div className="customer-categories-scroll">
              <button 
                onClick={() => setSelectedCategory('All')}
                className={`customer-category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
              >
                All items
              </button>
              {categories.map((c) => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCategory(c.name)}
                  className={`customer-category-pill ${selectedCategory === c.name ? 'active' : ''}`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Menu Items List */}
            <div className="customer-items-list">
              {filteredMenuItems.map((item) => {
                const cartQty = cart[item.id]?.quantity || 0;
                return (
                  <div key={item.id} className="customer-item-card">
                    <div className="customer-item-info">
                      <div>
                        <div className="customer-item-name">{item.name}</div>
                        <div className="customer-item-desc">{item.description}</div>
                      </div>
                      <div className="customer-item-price">₹{Number(item.price).toFixed(2)}</div>
                    </div>
                    
                    <div className="customer-item-action-area">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="customer-item-img" />
                      ) : (
                        <div className="customer-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1ebd8', color: '#8a7c73', fontSize: '10px', fontWeight: 'bold' }}>
                          KC Logo
                        </div>
                      )}
                      
                      {cartQty > 0 ? (
                        <div className="quantity-controller" style={{ marginTop: '8px' }}>
                          <button onClick={() => removeFromCart(item.id)} className="quantity-btn">-</button>
                          <span className="quantity-value">{cartQty}</span>
                          <button onClick={() => addToCart(item)} className="quantity-btn">+</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: '8px', width: '100%', padding: '4px 8px', borderRadius: '15px' }}
                        >
                          Add +
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {filteredMenuItems.length === 0 && (
                <div style={{ textAlign: 'center', color: '#8a7c73', padding: '30px 10px', fontSize: '14px', fontStyle: 'italic' }}>
                  No items found matching search filters.
                </div>
              )}
            </div>

            {/* Cart Floating Bar */}
            {getCartCount() > 0 && (
              <div 
                className="floating-cart-bar" 
                onClick={() => setView('cart')}
              >
                <div className="floating-cart-info">
                  <span className="floating-cart-count">{getCartCount()}</span>
                  <span style={{ fontWeight: '500' }}>View Cart</span>
                </div>
                <div className="floating-cart-price">
                  ₹{getCartTotal().toFixed(2)} &rarr;
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: CART PREVIEW & REVIEW */}
        {view === 'cart' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={() => setView('menu')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
              >
                <Icons.Back />
              </button>
              <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Review Your Cart</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {Object.values(cart).map((item) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', border: '1px solid #f1ebd8', padding: '16px', borderRadius: '12px' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--primary-color)' }}>{item.name}</div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#d1a153', marginTop: '4px' }}>₹{Number(item.price * item.quantity).toFixed(2)}</div>
                  </div>

                  <div className="quantity-controller">
                    <button onClick={() => removeFromCart(item.id)} className="quantity-btn">-</button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="quantity-btn">+</button>
                  </div>
                </div>
              ))}

              {Object.values(cart).length === 0 && (
                <div style={{ textAlign: 'center', color: '#8a7c73', padding: '40px' }}>Your cart is empty.</div>
              )}
            </div>

            {Object.values(cart).length > 0 && (
              <>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Cooking Instructions / Notes</label>
                  <textarea 
                    placeholder="e.g. Make it extra spicy, no onion, etc." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="form-input"
                    rows="3"
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '8px' }}>
                    <span style={{ color: '#8a7c73' }}>Subtotal:</span>
                    <strong>₹{getCartTotal().toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '8px' }}>
                    <span style={{ color: '#8a7c73' }}>GST (5%):</span>
                    <strong>₹{(getCartTotal() * 0.05).toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', borderTop: '1px solid #f1ebd8', paddingTop: '10px', marginTop: '5px' }}>
                    <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>Grand Total:</span>
                    <strong style={{ color: 'var(--accent-color)' }}>₹{(getCartTotal() * 1.05).toFixed(2)}</strong>
                  </div>
                </div>

                {activeOrderId ? (
                  <button 
                    onClick={handleSaveEditedOrder}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px' }}
                  >
                    Confirm &amp; Update Order
                  </button>
                ) : (
                  <button 
                    onClick={handlePlaceOrder}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px' }}
                  >
                    Confirm &amp; Place Order
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* STEP 5: 20-SECOND GRACE PERIOD TIMER */}
        {view === 'grace' && activeOrder && (
          <div className="grace-period-wrapper">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>Grace Period Active</h2>
            <p style={{ fontSize: '13px', color: '#8a7c73' }}>
              Your order <strong>{activeOrder.order_number}</strong> is confirmed. You have 20 seconds to modify or cancel it.
            </p>

            {/* Circular Timer */}
            <div className="timer-circle-container">
              <svg className="timer-svg">
                <circle cx="75" cy="75" r="65" className="timer-track" />
                <circle 
                  cx="75" 
                  cy="75" 
                  r="65" 
                  className="timer-fill" 
                  strokeDasharray="408.4"
                  strokeDashoffset={(graceSeconds / 20) * 408.4}
                />
              </svg>
              <div className="timer-text">{graceSeconds}s</div>
            </div>

            <div style={{ fontSize: '12px', color: '#8a7c73', fontWeight: '500' }}>
              Seconds remaining to edit/cancel.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '10px' }}>
              <button 
                onClick={handleEditOrderMode}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Edit Order
              </button>
              <button 
                onClick={handleLockOrder}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Proceed to Payment Now
              </button>
              <button 
                onClick={handleCancelOrder}
                className="btn btn-danger"
                style={{ width: '100%' }}
              >
                Cancel Entire Order
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: UPI CHECKOUT SCREEN (SCREENSHOTS REMOVED) */}
        {view === 'payment' && activeOrder && (
          <div className="payment-card">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>Complete Payment</h2>
            <p style={{ fontSize: '13px', color: '#8a7c73', textAlign: 'center' }}>
              Please scan the UPI QR code below and click "I Have Paid" once completed.
            </p>

            <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary-color)' }}>
              ₹{Number(activeOrder.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>

            {/* UPI QR Code representation */}
            <div style={{ border: '1px solid #f1ebd8', padding: '12px', borderRadius: '12px', background: '#fff' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                  `upi://pay?pa=${cafeSettings.upi_id}&pn=${encodeURIComponent(cafeSettings.cafe_name)}&am=${activeOrder.total_amount}&cu=INR`
                )}`} 
                alt="Payment UPI QR Code"
                style={{ width: '200px', height: '200px', display: 'block' }}
              />
            </div>

            {/* Copy UPI Box */}
            <div className="upi-id-copy-box">
              <span>{cafeSettings.upi_id}</span>
              <button onClick={handleCopyUPI} className="copy-icon-btn"><Icons.Copy /></button>
            </div>

            <button 
              onClick={handlePaymentSubmit}
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              disabled={submittingPayment}
            >
              {submittingPayment ? 'Verifying payment...' : 'I Have Paid'}
            </button>
          </div>
        )}

        {/* STEP 7 & 8: ACTIVE TRACKER & AWAITING CASHIER APPROVAL */}
        {view === 'tracker' && activeOrder && (
          <div className="grace-period-wrapper">
            {activeOrder.status === 'Pending Approval' ? (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>Verifying Payment</h2>
                <div className="timer-circle-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg className="timer-svg" style={{ animation: 'spin 2s linear infinite' }}>
                    <circle cx="75" cy="75" r="65" className="timer-track" />
                    <circle cx="75" cy="75" r="65" className="timer-fill" strokeDasharray="100 300" strokeDashoffset="0" />
                  </svg>
                  <div style={{ position: 'absolute', fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Verifying
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#8a7c73', lineHeight: '1.6' }}>
                  Your payment verification is pending with the cashier. Please wait.
                </p>
                <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#b0a49c' }}>
                  The kitchen starts preparation immediately on cashier approval.
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>Kitchen Tracker</h2>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '15px 0' }}>
                  <span className={`badge ${activeOrder.status === 'Preparing' ? 'badge-preparing' : 'badge-ready'}`}>
                    Status: {activeOrder.status}
                  </span>
                </div>

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', margin: '10px 0' }}>
                  {/* Progress steps */}
                  <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
                    <div style={{ position: 'absolute', top: '15px', left: '40px', right: '40px', height: '3px', backgroundColor: '#f1ebd8', zIndex: 1 }}>
                      <div style={{ 
                        height: '100%', 
                        backgroundColor: '#d1a153', 
                        width: activeOrder.status === 'Preparing' ? '0%' : activeOrder.status === 'Ready' ? '50%' : '100%',
                        transition: 'width 0.5s ease' 
                      }}></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#d1a153', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>1</div>
                      <span style={{ fontSize: '11px', color: '#3c2218', fontWeight: '600', marginTop: '6px' }}>Paid</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: activeOrder.status === 'Preparing' || activeOrder.status === 'Ready' ? '#3c2218' : '#f1ebd8', 
                        color: activeOrder.status === 'Preparing' || activeOrder.status === 'Ready' ? '#d1a153' : '#8a7c73', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>2</div>
                      <span style={{ fontSize: '11px', color: activeOrder.status === 'Preparing' ? '#3c2218' : '#8a7c73', fontWeight: '600', marginTop: '6px' }}>Preparing</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: activeOrder.status === 'Ready' ? '#3c2218' : '#f1ebd8', 
                        color: activeOrder.status === 'Ready' ? '#d1a153' : '#8a7c73', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontSize: '12px', 
                        fontWeight: 'bold' 
                      }}>3</div>
                      <span style={{ fontSize: '11px', color: activeOrder.status === 'Ready' ? '#3c2218' : '#8a7c73', fontWeight: '600', marginTop: '6px' }}>Ready</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: '#8a7c73', padding: '0 10px' }}>
                  {activeOrder.status === 'Preparing' 
                    ? 'The kitchen is preparing your fresh meal now. Hang tight!' 
                    : 'Your hot meal is ready and will be served to your table shortly!'}
                </p>
              </>
            )}
          </div>
        )}

        {/* STEP 9: ORDER COMPLETED */}
        {view === 'completed' && activeOrder && (
          <div className="grace-period-wrapper" style={{ padding: '40px 24px' }}>
            <Icons.Success />
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)', marginTop: '10px' }}>Meal Delivered!</h2>
            <p style={{ fontSize: '14px', color: '#8a7c73' }}>
              We hope you enjoyed your fresh meal at Kanchi Cafe. Thank you for dining with us!
            </p>
          </div>
        )}

        {/* NEW CUSTOMER SUB-PAGE: CURRENT ORDERS */}
        {view === 'current-orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>Current Orders</h2>
            
            {currentOrders.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #f1ebd8', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', color: '#8a7c73' }}>
                You have no active orders in preparation.
              </div>
            ) : (
              currentOrders.map(order => (
                <div key={order.id} className="customer-item-card" style={{ flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1ebd8', paddingBottom: '8px' }}>
                    <div>
                      <strong style={{ color: 'var(--primary-color)', fontSize: '15px' }}>{order.order_number}</strong>
                      <span className="table-badge" style={{ marginLeft: '8px' }}>Table {order.table_number}</span>
                    </div>
                    <span className={`badge badge-${order.status.toLowerCase().replace(' ', '')}`}>
                      {order.status === 'Pending Approval' ? 'Payment Verification' : order.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {order.items?.map(item => `${item.item_name} x ${item.quantity}`).join(', ')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-color)' }}>₹{Number(order.total_amount).toFixed(2)}</span>
                    <button 
                      onClick={() => {
                        setActiveOrderId(order.id);
                        pollActiveOrder(order.id);
                      }} 
                      className="btn btn-secondary btn-sm"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NEW CUSTOMER SUB-PAGE: PREVIOUS ORDERS */}
        {view === 'previous-orders' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>Previous Orders</h2>
            
            {previousOrders.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #f1ebd8', borderRadius: '12px', padding: '40px 20px', textAlign: 'center', color: '#8a7c73' }}>
                No past order histories found.
              </div>
            ) : (
              previousOrders.map(order => (
                <div key={order.id} className="customer-item-card" style={{ flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #f1ebd8', paddingBottom: '8px' }}>
                    <div>
                      <strong style={{ color: 'var(--primary-color)' }}>{order.order_number}</strong>
                      <span style={{ fontSize: '12px', color: '#8a7c73', marginLeft: '8px' }}>
                        {new Date(order.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <span className={`badge badge-${order.status.toLowerCase().replace(' ', '')}`}>{order.status}</span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {order.items?.map(item => `${item.item_name} x ${item.quantity}`).join(', ')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary-color)' }}>₹{Number(order.total_amount).toFixed(2)}</span>
                    <button 
                      onClick={() => handleReorder(order)} 
                      className="btn btn-primary btn-sm"
                      id={`btn-reorder-${order.id}`}
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* NEW CUSTOMER SUB-PAGE: PROFILE DETAILS & INLINE EDITOR */}
        {view === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary-color)' }}>My Profile</h2>
            
            {/* Statistics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #f1ebd8', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a7c73', fontWeight: '600' }}>Total Orders</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary-color)', marginTop: '4px' }}>{totalOrdersCount}</div>
              </div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #f1ebd8', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#8a7c73', fontWeight: '600' }}>Total Spent</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#d1a153', marginTop: '4px' }}>₹{totalAmountSpent.toFixed(2)}</div>
              </div>
            </div>

            {/* Editor form */}
            <div className="customer-login-card" style={{ margin: 0, padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', borderBottom: '1px solid #f1ebd8', paddingBottom: '8px', marginBottom: '15px' }}>Edit Profile Information</h3>
              <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    value={profileFormData.name} 
                    onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })}
                    className="form-input" 
                    required 
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={profileFormData.mobile} 
                    onChange={(e) => setProfileFormData({ ...profileFormData, mobile: e.target.value })}
                    className="form-input" 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {/* STEP 10: RATING STAR FEEDBACK POPUP */}
      {showReviewPopup && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '90%', maxWidth: '380px' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '5px' }}>Rate Your Meal</h3>
              <p style={{ fontSize: '13px', color: '#8a7c73' }}>How was your experience at Kanchi Cafe?</p>
            </div>

            {reviewSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#2e7d32', fontWeight: '600' }}>
                Thank you! Your feedback is submitted.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="rating-stars-input">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className={`rating-star-btn ${num <= reviewRating ? 'active' : ''}`}
                    >
                      <Icons.Star filled={num <= reviewRating} />
                    </button>
                  ))}
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Review Comment (Optional)</label>
                  <textarea
                    placeholder="Write a comment about the service, taste, etc."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="form-input"
                    rows="3"
                    style={{ resize: 'none' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MOBILE HEADER SIDEBAR DRAWER (HAMBURGER DRAWER) */}
      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div className="sidebar-brand-name" style={{ color: '#fff', fontSize: '16px' }}>{customer?.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--accent-color)' }}>{customer?.mobile}</div>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', outline: 'none' }}
              >
                <Icons.Close />
              </button>
            </div>

            <ul className="drawer-menu">
              <li className="drawer-menu-item">
                <button 
                  onClick={() => { setView('menu'); setIsDrawerOpen(false); }}
                  className={`drawer-menu-link ${view === 'menu' || view === 'cart' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                  id="drawer-link-home"
                >
                  <Icons.Home />
                  <span>Home / Menu</span>
                </button>
              </li>

              <li className="drawer-menu-item">
                <button 
                  onClick={() => { setView('current-orders'); setIsDrawerOpen(false); }}
                  className={`drawer-menu-link ${view === 'current-orders' || view === 'grace' || view === 'payment' || view === 'tracker' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                  id="drawer-link-current"
                >
                  <Icons.Clock />
                  <span>Current Orders</span>
                </button>
              </li>

              <li className="drawer-menu-item">
                <button 
                  onClick={() => { setView('previous-orders'); setIsDrawerOpen(false); }}
                  className={`drawer-menu-link ${view === 'previous-orders' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                  id="drawer-link-previous"
                >
                  <Icons.History />
                  <span>Previous Orders</span>
                </button>
              </li>

              <li className="drawer-menu-item">
                <button 
                  onClick={() => { setView('profile'); setIsDrawerOpen(false); }}
                  className={`drawer-menu-link ${view === 'profile' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
                  id="drawer-link-profile"
                >
                  <Icons.User />
                  <span>Profile</span>
                </button>
              </li>

              <li className="drawer-menu-item" style={{ marginTop: '30px' }}>
                <button 
                  onClick={handleLogout}
                  className="drawer-menu-link"
                  style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', color: '#ff5252' }}
                  id="drawer-link-logout"
                >
                  <Icons.Logout />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
