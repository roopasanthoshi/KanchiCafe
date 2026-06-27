import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Custom SVG Icons
const Icons = {
  Orders: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
  ),
  Revenue: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
  ),
  Active: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  Pending: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
  ),
  Tables: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
  ),
  Reviews: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  )
};

// ==========================================
// HIGH FIDELITY SVG CHART COMPONENTS
// ==========================================

// Line chart for Revenue Trend (7 days)
function RevenueTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a7c73', fontStyle: 'italic' }}>No data available</div>;
  }

  const days = data.map(d => d.day);
  const values = data.map(d => Number(d.total));
  const maxVal = Math.max(...values, 5000); // minimum scale of 5000
  const height = 200;
  const width = 450;
  const padding = 35;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Compute points
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (Number(d.total) / maxVal) * chartHeight;
    return { x, y, val: d.total, day: d.day };
  });

  const pathD = points.reduce((acc, p, index) => {
    return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // For gradient fill path
  const fillD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
    : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d1a153" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#d1a153" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding + ratio * chartHeight;
        const gridVal = Math.round(maxVal - ratio * maxVal);
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1ebd8" strokeDasharray="3,3" />
            <text x={padding - 8} y={y + 4} fill="#8a7c73" fontSize="9" textAnchor="end">₹{gridVal}</text>
          </g>
        );
      })}

      {/* Area Fill */}
      {fillD && <path d={fillD} fill="url(#chartGrad)" />}

      {/* Main line */}
      {pathD && <path d={pathD} fill="none" stroke="#3c2218" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

      {/* Dots and tooltips */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#d1a153" stroke="#3c2218" strokeWidth="1.5" />
          <text x={p.x} y={p.y - 8} fill="#3c2218" fontSize="8" fontWeight="bold" textAnchor="middle">₹{Math.round(p.val)}</text>
          {/* Day label */}
          <text x={p.x} y={height - padding + 15} fill="#8a7c73" fontSize="9" textAnchor="middle">{p.day}</text>
        </g>
      ))}
    </svg>
  );
}

// Vertical bar chart for Orders Trend (7 days)
function OrdersTrendChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a7c73', fontStyle: 'italic' }}>No data available</div>;
  }

  const values = data.map(d => Number(d.count));
  const maxVal = Math.max(...values, 5); // minimum scale of 5
  const height = 200;
  const width = 450;
  const padding = 35;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const barWidth = 24;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
        const y = padding + ratio * chartHeight;
        const gridVal = Math.round(maxVal - ratio * maxVal);
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1ebd8" strokeDasharray="3,3" />
            <text x={padding - 8} y={y + 4} fill="#8a7c73" fontSize="9" textAnchor="end">{gridVal}</text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, index) => {
        const x = padding + (index / (data.length - 1)) * (chartWidth - barWidth) + barWidth/2;
        const valHeight = (d.count / maxVal) * chartHeight;
        const y = padding + chartHeight - valHeight;
        return (
          <g key={index}>
            <rect 
              x={x - barWidth / 2} 
              y={y} 
              width={barWidth} 
              height={valHeight} 
              fill="#d1a153" 
              rx="4" 
              ry="4"
            />
            {/* Value top label */}
            <text x={x} y={y - 5} fill="#3c2218" fontSize="8" fontWeight="bold" textAnchor="middle">{d.count}</text>
            {/* Day label */}
            <text x={x} y={height - padding + 15} fill="#8a7c73" fontSize="9" textAnchor="middle">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Horizontal bar chart for Top Selling Items
function TopSellingChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a7c73', fontStyle: 'italic' }}>No data available</div>;
  }

  const values = data.map(d => Number(d.value));
  const maxVal = Math.max(...values, 1);
  const chartHeight = 220;
  const itemHeight = 35;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {data.map((item, index) => {
        const pct = (item.value / maxVal) * 100;
        return (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '500' }}>
              <span style={{ color: '#3c2218' }}>{item.name}</span>
              <span style={{ fontWeight: '700', color: '#d1a153' }}>{item.value} Qty</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#f1ebd8', borderRadius: '5px', overflow: 'hidden', width: '100%' }}>
              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#3c2218', borderRadius: '5px', transition: 'width 0.8s ease' }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Doughnut chart for Category Performance
function CategoryPerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a7c73', fontStyle: 'italic' }}>No data available</div>;
  }

  const total = data.reduce((acc, curr) => acc + Number(curr.value), 0);
  const colors = ['#3c2218', '#d1a153', '#8a7c73', '#bfa045', '#5a3d31', '#d1c0b3'];

  // Circle details for SVG doughnut
  const size = 150;
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', height: '100%', justifyContent: 'space-around' }}>
      {/* SVG Doughnut */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#f1ebd8" strokeWidth="20" />
        {data.map((item, index) => {
          const pct = Number(item.value) / total;
          const strokeDash = pct * circ;
          const strokeOffset = circ - strokeDash + currentOffset;
          currentOffset -= strokeDash;
          
          return (
            <circle 
              key={index}
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="transparent"
              stroke={colors[index % colors.length]}
              strokeWidth="20"
              strokeDasharray={`${strokeDash} ${circ - strokeDash}`}
              strokeDashoffset={strokeOffset}
              transform={`rotate(-90 ${size/2} ${size/2})`}
            />
          );
        })}
        {/* Center label */}
        <text x="50%" y="47%" textAnchor="middle" fill="#8a7c73" fontSize="10" fontWeight="bold">TOTAL</text>
        <text x="50%" y="60%" textAnchor="middle" fill="#3c2218" fontSize="14" fontWeight="bold">₹{Math.round(total)}</text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '160px' }}>
        {data.map((item, index) => {
          const pct = ((Number(item.value) / total) * 100).toFixed(1);
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[index % colors.length], flexShrink: 0 }}></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', color: '#3c2218', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px' }}>{item.name}</span>
                <span style={{ color: '#8a7c73' }}>{pct}% (₹{Math.round(item.value)})</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      setData(json);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Re-fetch dashboard state every 20 seconds
    const interval = setInterval(fetchDashboardData, 20000);
    
    // Listen for custom SSE notifications
    window.addEventListener('api-refresh', fetchDashboardData);

    return () => {
      clearInterval(interval);
      window.removeEventListener('api-refresh', fetchDashboardData);
    };
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontSize: '16px', color: '#8a7c73' }}>Loading dashboard data...</div>;
  }

  const metrics = data?.metrics || {
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    pendingApprovals: 0,
    occupiedTables: '0/16',
    totalReviews: 0
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Dashboard</h1>
        <div style={{ fontSize: '13px', color: '#8a7c73', fontWeight: '500' }}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
          <div className="metric-header">
            <span className="metric-label">Today's Orders</span>
            <span className="metric-icon-wrapper"><Icons.Orders /></span>
          </div>
          <div className="metric-value">{metrics.todayOrders}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Today's Revenue</span>
            <span className="metric-icon-wrapper"><Icons.Revenue /></span>
          </div>
          <div className="metric-value">₹{metrics.todayRevenue.toLocaleString('en-IN')}</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
          <div className="metric-header">
            <span className="metric-label">Active Orders</span>
            <span className="metric-icon-wrapper"><Icons.Active /></span>
          </div>
          <div className="metric-value">{metrics.activeOrders}</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/approvals')}>
          <div className="metric-header">
            <span className="metric-label">Pending Approvals</span>
            <span className="metric-icon-wrapper"><Icons.Pending /></span>
          </div>
          <div className="metric-value" style={{ color: metrics.pendingApprovals > 0 ? '#ffb300' : '#3c2218' }}>{metrics.pendingApprovals}</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/tables')}>
          <div className="metric-header">
            <span className="metric-label">Occupied Tables</span>
            <span className="metric-icon-wrapper"><Icons.Tables /></span>
          </div>
          <div className="metric-value">{metrics.occupiedTables}</div>
        </div>

        <div className="metric-card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/reviews')}>
          <div className="metric-header">
            <span className="metric-label">Reviews</span>
            <span className="metric-icon-wrapper"><Icons.Reviews /></span>
          </div>
          <div className="metric-value">{metrics.totalReviews}</div>
        </div>
      </div>

      {/* Row 1: Trend Charts */}
      <div className="charts-grid-2">
        <div className="chart-card">
          <div className="chart-title">Revenue Trend (7 days)</div>
          <div className="chart-container-inner">
            <RevenueTrendChart data={data?.charts?.revenueTrend} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Orders Trend (7 days)</div>
          <div className="chart-container-inner">
            <OrdersTrendChart data={data?.charts?.ordersTrend} />
          </div>
        </div>
      </div>

      {/* Row 2: Top Selling & Category Performance */}
      <div className="charts-grid-3">
        <div className="chart-card">
          <div className="chart-title">Top Selling Items</div>
          <div style={{ height: '220px', overflowY: 'auto', paddingRight: '8px' }}>
            <TopSellingChart data={data?.charts?.topSelling} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-title">Category Performance</div>
          <div style={{ height: '220px' }}>
            <CategoryPerformanceChart data={data?.charts?.categoryPerformance} />
          </div>
        </div>
      </div>

      {/* Row 3: Recent Orders & Recent Activities */}
      <div className="dashboard-details-row">
        <div className="recent-orders-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Orders</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/orders')}>View All</button>
          </div>
          
          <div className="data-table-container">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Table</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '600', color: '#3c2218' }}>{order.order_number}</td>
                      <td><span className="table-badge">Table {order.table_number}</span></td>
                      <td style={{ fontWeight: '500' }}>{order.customer_name}</td>
                      <td style={{ fontWeight: '600' }}>₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge badge-${order.status.toLowerCase().replace(' ', '')}`}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#8a7c73' }}>
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8a7c73', fontStyle: 'italic' }}>No orders placed today.</div>
            )}
          </div>
        </div>

        <div className="activity-card">
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Recent Activity</h3>
          <div style={{ flexGrow: 1, overflowY: 'auto' }}>
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              <ul className="activity-list">
                {data.recentActivity.map((activity, i) => (
                  <li className="activity-item" key={i}>
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <div className="activity-text">{activity.message}</div>
                      <div className="activity-time">
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8a7c73', fontStyle: 'italic' }}>No recent activities.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
