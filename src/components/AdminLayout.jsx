import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

// Custom SVG Icons
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  Orders: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Approvals: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  MenuManagement: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Categories: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  ),
  Tables: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  QRManagement: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      <rect x="5" y="5" width="3" height="3" /><rect x="16" y="5" width="3" height="3" /><rect x="5" y="16" width="3" height="3" />
    </svg>
  ),
  Reviews: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Reports: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  PrinterSettings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
  CafeSettings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [toasts, setToasts] = useState([]);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  // Poll pending approvals count or get initially
  const fetchPendingApprovals = async () => {
    try {
      const res = await fetch('/api/admin/approvals');
      const data = await res.json();
      setPendingApprovalsCount(data.length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, [location]);

  // Poll for notifications every 10 seconds (Vercel-compatible, replaces SSE)
  useEffect(() => {
    let lastUpdateTime = new Date().toISOString();

    const pollNotifications = async () => {
      try {
        const res = await fetch('/api/admin/notifications');
        if (!res.ok) return;
        const data = await res.json();

        // Refresh pending approvals count
        if (data.pendingCount !== undefined) {
          setPendingApprovalsCount(Number(data.pendingCount));
        }

        // Show toasts for recent updates
        if (data.recentUpdates && data.recentUpdates.length > 0) {
          window.dispatchEvent(new CustomEvent('api-refresh'));
        }
      } catch (e) {
        console.warn('Notification poll error:', e);
      }
    };

    const interval = setInterval(pollNotifications, 10000);
    pollNotifications(); // initial call
    return () => clearInterval(interval);
  }, []);

  // Setup listener for custom toast events from child pages
  useEffect(() => {
    const handleCustomToast = (e) => {
      const { message, type } = e.detail;
      const newToast = {
        id: Date.now(),
        message,
        type: type || 'info'
      };
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 6000);
    };

    window.addEventListener('show-toast', handleCustomToast);
    return () => {
      window.removeEventListener('show-toast', handleCustomToast);
    };
  }, []);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Icons.Dashboard },
    { name: 'Orders', path: '/admin/orders', icon: Icons.Orders },
    { 
      name: 'Approvals', 
      path: '/admin/approvals', 
      icon: Icons.Approvals, 
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null 
    },
    { name: 'Menu Management', path: '/admin/menu', icon: Icons.MenuManagement },
    { name: 'Categories', path: '/admin/categories', icon: Icons.Categories },
    { name: 'Tables', path: '/admin/tables', icon: Icons.Tables },
    { name: 'QR Management', path: '/admin/qr', icon: Icons.QRManagement },
    { name: 'Reviews', path: '/admin/reviews', icon: Icons.Reviews },
    { name: 'Reports', path: '/admin/reports', icon: Icons.Reports },
    { name: 'Printer Settings', path: '/admin/printer', icon: Icons.PrinterSettings },
    { name: 'Cafe Settings', path: '/admin/settings', icon: Icons.CafeSettings },
    { name: 'Users', path: '/admin/users', icon: Icons.Users }
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    sessionStorage.removeItem('admin_email');
    navigate('/admin/login');
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">KC</div>
          <div>
            <div className="sidebar-brand-name">KANCHI CAFE</div>
            <div className="sidebar-brand-sub">ADMIN PORTAL</div>
          </div>
        </div>

        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.name} className="sidebar-menu-item">
                <Link to={item.path} className={`sidebar-menu-link ${isActive ? 'active' : ''}`}>
                  <Icon />
                  <span style={{ flexGrow: 1 }}>{item.name}</span>
                  {item.badge !== null && (
                    <span style={{
                      backgroundColor: '#ffb300',
                      color: '#2b170f',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>{item.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="sidebar-footer">
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'rgba(220,53,69,0.12)',
              border: '1px solid rgba(220,53,69,0.3)',
              borderRadius: '8px',
              color: '#ff7b7b',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '10px',
              letterSpacing: '0.5px'
            }}
          >
            ⎋ Logout
          </button>
          Kanchi Cafe Admin &copy; {new Date().getFullYear()}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <Outlet />
      </main>

      {/* SSE Toast Notifications Container */}
      <div style={{
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        maxWidth: '350px'
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: '#3c2218',
            color: '#fff',
            borderLeft: '4px solid #d1a153',
            padding: '16px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
            animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '500' }}>{t.message}</span>
            <button 
              onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
