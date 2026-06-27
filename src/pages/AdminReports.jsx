import React, { useState, useEffect } from 'react';

// Custom SVG line chart for report orders trend
function ReportsLineChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a7c73', fontStyle: 'italic' }}>No trend data found</div>;
  }
  const values = data.map(d => Number(d.revenue || 0));
  const maxVal = Math.max(...values, 5000);
  const height = 180;
  const width = 500;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * chartWidth;
    const y = padding + chartHeight - (Number(d.revenue || 0) / maxVal) * chartHeight;
    return { x, y, rev: d.revenue || 0, label: d.formatted_date || '' };
  });

  const pathD = points.reduce((acc, p, index) => {
    return index === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const fillD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
    : '';

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      <defs>
        <linearGradient id="repChartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d1a153" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d1a153" stopOpacity="0.0" />
        </linearGradient>
      </defs>
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
      {fillD && <path d={fillD} fill="url(#repChartGrad)" />}
      {pathD && <path d={pathD} fill="none" stroke="#3c2218" strokeWidth="2" />}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#d1a153" stroke="#3c2218" strokeWidth="1" />
          {data.length < 15 && (
            <text x={p.x} y={p.y - 8} fill="#3c2218" fontSize="8" fontWeight="bold" textAnchor="middle">₹{Math.round(p.rev)}</text>
          )}
          {/* Label x axis */}
          {(data.length < 10 || i % Math.round(data.length / 5) === 0) && (
            <text x={p.x} y={height - padding + 15} fill="#8a7c73" fontSize="9" textAnchor="middle">{p.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

// Custom SVG chart for Peak Hours (24-hour histogram)
function PeakHoursChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8a7c73', fontStyle: 'italic' }}>No order logs found</div>;
  }

  // Pre-populate 24 hours
  const hoursMap = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
  (data || []).forEach(d => {
    if (d && d.hour !== undefined && hoursMap[d.hour]) {
      hoursMap[d.hour].count = d.count || 0;
    }
  });

  const values = hoursMap.map(h => h.count);
  const maxVal = Math.max(...values, 3);
  const height = 180;
  const width = 500;
  const padding = 35;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / 24 - 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
      {[0, 0.5, 1].map((ratio, i) => {
        const y = padding + ratio * chartHeight;
        const gridVal = Math.round(maxVal - ratio * maxVal);
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f1ebd8" strokeDasharray="3,3" />
            <text x={padding - 8} y={y + 4} fill="#8a7c73" fontSize="9" textAnchor="end">{gridVal}</text>
          </g>
        );
      })}

      {hoursMap.map((h, i) => {
        const x = padding + i * (chartWidth / 24) + 2;
        const valHeight = (h.count / maxVal) * chartHeight;
        const y = padding + chartHeight - valHeight;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={valHeight} fill="#3c2218" rx="2" ry="2" />
            {/* Show label every 4 hours to avoid crowding */}
            {i % 4 === 0 && (
              <text x={x + barWidth / 2} y={height - padding + 15} fill="#8a7c73" fontSize="9" textAnchor="middle">
                {i === 0 ? '12am' : i === 12 ? '12pm' : i > 12 ? `${i - 12}pm` : `${i}am`}
              </text>
            )}
            {/* Hover tooltip simulated simple */}
            {h.count > 0 && (
              <title>{`${h.count} orders at ${i}:00`}</title>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function AdminReports() {
  const [filterType, setFilterType] = useState('weekly');
  const [customDates, setCustomDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const [summary, setSummary] = useState({ revenue: 0, ordersCount: 0 });
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  // Revenue Cards metrics
  const [periodMetrics, setPeriodMetrics] = useState({
    daily: 0,
    weekly: 0,
    monthly: 0
  });

  const fetchPeriodMetrics = async () => {
    const safeJson = async (res) => {
      try { return await res.json(); } catch { return null; }
    };
    try {
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        fetch('/api/admin/reports?type=daily'),
        fetch('/api/admin/reports?type=weekly'),
        fetch('/api/admin/reports?type=monthly')
      ]);
      const [dailyData, weeklyData, monthlyData] = await Promise.all([
        safeJson(dailyRes),
        safeJson(weeklyRes),
        safeJson(monthlyRes)
      ]);
      setPeriodMetrics({
        daily: Number(dailyData?.summary?.revenue || 0),
        weekly: Number(weeklyData?.summary?.revenue || 0),
        monthly: Number(monthlyData?.summary?.revenue || 0)
      });
    } catch (e) {
      console.error('Failed to load metrics summary', e);
      setPeriodMetrics({ daily: 0, weekly: 0, monthly: 0 });
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    const emptyData = {
      summary: { revenue: 0, ordersCount: 0 },
      ordersTrend: [],
      peakHours: [],
      categoryPerformance: [],
      bestSelling: [],
      topRevenue: []
    };
    let url = `/api/admin/reports?type=${filterType}`;
    if (filterType === 'custom') {
      url += `&startDate=${customDates.startDate}&endDate=${customDates.endDate}`;
    }
    try {
      const res = await fetch(url);
      let json = null;
      try { json = await res.json(); } catch { json = null; }
      if (json && json.summary) {
        setSummary({
          revenue: Number(json.summary.revenue || 0),
          ordersCount: Number(json.summary.ordersCount || 0)
        });
        setCharts({
          ...emptyData,
          ...json,
          ordersTrend: Array.isArray(json.ordersTrend) ? json.ordersTrend : [],
          peakHours: Array.isArray(json.peakHours) ? json.peakHours : [],
          categoryPerformance: Array.isArray(json.categoryPerformance) ? json.categoryPerformance : [],
          bestSelling: Array.isArray(json.bestSelling) ? json.bestSelling : [],
          topRevenue: Array.isArray(json.topRevenue) ? json.topRevenue : []
        });
      } else {
        setSummary({ revenue: 0, ordersCount: 0 });
        setCharts(emptyData);
      }
    } catch (e) {
      console.error(e);
      setSummary({ revenue: 0, ordersCount: 0 });
      setCharts(emptyData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriodMetrics();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filterType, customDates]);

  // Download CSV Spreadsheet
  const handleDownloadExcel = () => {
    if (!charts?.ordersTrend) return;
    
    // Construct CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Date,Orders Count,Total Revenue (₹)\n';
    
    (charts.ordersTrend || []).forEach(row => {
      csvContent += `${row.formatted_date},${row.count},${row.revenue}\n`;
    });
    
    // Export Best Selling Items
    csvContent += '\nBest Selling Items\nItem Name,Quantity Sold\n';
    (charts.bestSelling || []).forEach(item => {
      csvContent += `"${item.name}",${item.value}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kanchi_cafe_sales_report_${filterType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable Report trigger (Print to PDF)
  const handleDownloadPDF = () => {
    const origin = window.location.origin;
    const printWindow = window.open('', '_blank');
    
    // Create print-only layout page
    printWindow.document.write(`
      <html>
        <head>
          <title>Kanchi Cafe - Sales Report</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #3c2218; background-color: white; }
            .header { border-bottom: 2px solid #3c2218; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            h1 { font-family: 'Playfair Display', serif; font-size: 28px; margin: 0; }
            .meta { font-size: 13px; color: #8a7c73; }
            .metrics-box { display: flex; gap: 20px; margin-bottom: 40px; }
            .metric-card { border: 1px solid #f1ebd8; border-radius: 8px; padding: 20px; flex: 1; text-align: center; }
            .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8a7c73; margin-bottom: 5px; }
            .val { font-size: 24px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { border-bottom: 2px solid #f1ebd8; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #8a7c73; }
            td { border-bottom: 1px solid #f1ebd8; padding: 12px; font-size: 14px; }
            h3 { font-family: 'Playfair Display', serif; font-size: 20px; border-bottom: 1px solid #f1ebd8; padding-bottom: 8px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>KANCHI CAFE</h1>
              <div style="font-size:12px; letter-spacing:1px; color:#d1a153; font-weight:bold;">SALES PERFORMANCE REPORT</div>
            </div>
            <div class="meta">
              Report Period: <strong>${filterType.toUpperCase()}</strong><br>
              Generated: ${new Date().toLocaleDateString('en-IN')}
            </div>
          </div>

          <div class="metrics-box">
            <div class="metric-card">
              <div class="label">Total Orders</div>
              <div class="val">${summary.ordersCount}</div>
            </div>
            <div class="metric-card">
              <div class="label">Total Revenue</div>
              <div class="val">₹${Number(summary?.revenue || 0).toLocaleString('en-IN')}</div>
            </div>
          </div>

          <h3>Daily Sales Performance</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders Count</th>
                <th>Revenue (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${(charts?.ordersTrend || []).map(row => `
                <tr>
                  <td>${row.formatted_date}</td>
                  <td>${row.count}</td>
                  <td>₹${Number(row.revenue).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
 
          <div style="page-break-before: always;"></div>
 
          <h3>Best Selling Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity Sold</th>
              </tr>
            </thead>
            <tbody>
              ${(charts?.bestSelling || []).map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.value} units</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
 
          <h3>Category Performance Breakdown</h3>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Value (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${(charts?.categoryPerformance || []).map(cat => `
                <tr>
                  <td>${cat.name}</td>
                  <td>₹${Number(cat.value).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Reports</h1>

        {/* Filter Bar Controls */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="select-control"
            style={{ width: '130px' }}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="custom">Custom Date</option>
          </select>

          {filterType === 'custom' && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="date" 
                value={customDates.startDate} 
                onChange={(e) => setCustomDates({ ...customDates, startDate: e.target.value })}
                className="form-input"
                style={{ padding: '8px', width: '135px' }}
              />
              <span style={{ fontSize: '12px', color: '#8a7c73' }}>to</span>
              <input 
                type="date" 
                value={customDates.endDate} 
                onChange={(e) => setCustomDates({ ...customDates, endDate: e.target.value })}
                className="form-input"
                style={{ padding: '8px', width: '135px' }}
              />
            </div>
          )}

          <button onClick={handleDownloadPDF} className="btn btn-secondary btn-sm" style={{ padding: '10px 14px' }}>
            Download PDF
          </button>
          <button onClick={handleDownloadExcel} className="btn btn-primary btn-sm" style={{ padding: '10px 14px' }}>
            Download Excel
          </button>
        </div>
      </div>

      {/* Revenue Period Overview Cards */}
      <div className="metrics-grid" style={{ marginBottom: '25px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Daily Revenue</span>
          </div>
          <div className="metric-value">₹{Number(periodMetrics.daily).toLocaleString('en-IN')}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Weekly Revenue</span>
          </div>
          <div className="metric-value">₹{Number(periodMetrics.weekly).toLocaleString('en-IN')}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Monthly Revenue</span>
          </div>
          <div className="metric-value">₹{Number(periodMetrics.monthly).toLocaleString('en-IN')}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading report statistics...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Trend Charts Row */}
          <div className="charts-grid-2">
            <div className="chart-card">
              <div className="chart-title">Orders Trend &amp; Sales Summary</div>
              <div className="chart-container-inner">
                <ReportsLineChart data={charts?.ordersTrend} />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-title">Peak Order Hours (Distribution)</div>
              <div className="chart-container-inner">
                <PeakHoursChart data={charts?.peakHours} />
              </div>
            </div>
          </div>

          {/* Product and Category Performance */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '25px' }}>
            
            {/* Category Performance */}
            <div className="chart-card">
              <div className="chart-title">Category Performance</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Sales Value (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(charts?.categoryPerformance || []).map((cat, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: '600' }}>{cat.name}</td>
                      <td style={{ fontWeight: '700', color: '#d1a153' }}>₹{Number(cat.value).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {(!charts?.categoryPerformance || charts.categoryPerformance.length === 0) && (
                    <tr>
                      <td colSpan="2" style={{ textAlign: 'center', color: '#8a7c73', fontStyle: 'italic' }}>No category details recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
 
            {/* Top Selling Items (Best Selling vs. Top Revenue) */}
            <div className="chart-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8a7c73', marginBottom: '15px' }}>Best Selling Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(charts?.bestSelling || []).slice(0, 5).map((item, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid #f1ebd8', paddingBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#8a7c73' }}>{item.value} units sold</div>
                    </div>
                  ))}
                  {(!charts?.bestSelling || charts.bestSelling.length === 0) && (
                    <div style={{ color: '#8a7c73', fontStyle: 'italic', fontSize: '13px' }}>No items sold.</div>
                  )}
                </div>
              </div>
 
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8a7c73', marginBottom: '15px' }}>Top Revenue Items</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(charts?.topRevenue || []).slice(0, 5).map((item, idx) => (
                    <div key={idx} style={{ borderBottom: '1px solid #f1ebd8', paddingBottom: '6px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: '#d1a153', fontWeight: '700' }}>₹{Number(item.value).toLocaleString('en-IN')} revenue</div>
                    </div>
                  ))}
                  {(!charts?.topRevenue || charts.topRevenue.length === 0) && (
                    <div style={{ color: '#8a7c73', fontStyle: 'italic', fontSize: '13px' }}>No items sold.</div>
                  )}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
