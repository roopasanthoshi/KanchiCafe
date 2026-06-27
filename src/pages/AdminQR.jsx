import React, { useState, useEffect } from 'react';

export default function AdminQR() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTables = async () => {
    try {
      const res = await fetch('/api/admin/tables');
      const data = await res.json();
      setTables(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const getQRData = (tableNumber) => {
    const origin = window.location.origin;
    return `${origin}/table/${tableNumber}`;
  };

  const getQRImageUrl = (tableNumber) => {
    const data = encodeURIComponent(getQRData(tableNumber));
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=2B170F&bgcolor=FFFFFF&data=${data}`;
  };

  const handlePrint = (tableNumber) => {
    const qrUrl = getQRImageUrl(tableNumber);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table ${tableNumber} QR</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              text-align: center;
              padding: 40px;
              color: #3c2218;
              background-color: #fbf9f6;
            }
            .container {
              border: 3px double #d1a153;
              padding: 40px 30px;
              border-radius: 16px;
              display: inline-block;
              max-width: 320px;
              background-color: white;
              box-shadow: 0 10px 30px rgba(43,23,15,0.06);
            }
            .logo {
              font-family: 'Playfair Display', serif;
              font-size: 26px;
              font-weight: 700;
              margin-bottom: 4px;
              letter-spacing: 0.5px;
            }
            .logo-sub {
              font-size: 10px;
              color: #d1a153;
              text-transform: uppercase;
              margin-bottom: 30px;
              letter-spacing: 2px;
              font-weight: 600;
            }
            .qr {
              width: 220px;
              height: 220px;
              margin-bottom: 30px;
            }
            .table-label {
              font-family: 'Playfair Display', serif;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            .instructions {
              font-size: 13px;
              color: #8a7c73;
              font-weight: 500;
              line-height: 1.5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">KANCHI CAFE</div>
            <div class="logo-sub">PREMIUM DINING</div>
            <img src="${qrUrl}" class="qr" />
            <div class="table-label">TABLE ${tableNumber}</div>
            <div class="instructions">Scan QR Code to View Menu<br>&amp; Place Your Order</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              // Close window after printing prompt completes
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSave = async (tableNumber) => {
    const url = getQRImageUrl(tableNumber);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `kanchi_cafe_table_${tableNumber}_qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error('Failed to download QR code image', e);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">QR Management</h1>
        <div style={{ fontSize: '13px', color: '#8a7c73', fontWeight: '500' }}>
          Table QR generators
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading QR codes...</div>
      ) : tables.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid #f1ebd8',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#8a7c73',
          boxShadow: 'var(--shadow-soft)'
        }}>
          No tables found. Please add tables in "Tables" page to generate QRs.
        </div>
      ) : (
        <div className="qr-grid">
          {tables.map((table) => {
            const qrUrl = getQRImageUrl(table.table_number);
            const qrData = getQRData(table.table_number);

            return (
              <div key={table.table_number} className="qr-card">
                <span className="qr-table-title">Table {table.table_number}</span>
                
                <div className="qr-image-wrapper">
                  <img src={qrUrl} alt={`Table ${table.table_number} QR`} className="qr-image" />
                </div>

                <div className="qr-link-text">
                  {qrData}
                </div>

                <div className="qr-actions">
                  <button 
                    onClick={() => handleSave(table.table_number)} 
                    className="btn btn-secondary btn-sm"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => handlePrint(table.table_number)} 
                    className="btn btn-primary btn-sm"
                  >
                    Print
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
