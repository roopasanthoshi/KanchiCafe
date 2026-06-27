import React, { useState, useEffect } from 'react';

export default function AdminPrinterSettings() {
  const [formData, setFormData] = useState({
    printer_name: '',
    ip_address: '',
    port: ''
  });
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.printer) {
          setFormData({
            printer_name: data.printer.printer_name,
            ip_address: data.printer.ip_address,
            port: data.printer.port
          });
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings/printer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Printer settings saved successfully!');
      } else {
        alert('Failed to save printer settings');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/settings/printer/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setTesting(false);
      if (data.success) {
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, message: 'Connection timed out. Check printer status.' });
      }
    } catch (e) {
      setTesting(false);
      setTestResult({ success: false, message: 'Printer connection test failed: ' + e.message });
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading settings...</div>;
  }

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Printer Settings</h1>
        <div style={{ fontSize: '13px', color: '#8a7c73', fontWeight: '500' }}>
          Thermal receipt configuration
        </div>
      </div>

      <div className="settings-form-grid">
        <div className="settings-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Printer Name</label>
              <input 
                type="text" 
                value={formData.printer_name} 
                onChange={(e) => setFormData({ ...formData, printer_name: e.target.value })}
                className="form-input" 
                placeholder="e.g. Kitchen Printer"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">IP Address</label>
              <input 
                type="text" 
                value={formData.ip_address} 
                onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                className="form-input" 
                placeholder="e.g. 192.168.1.100"
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Port</label>
              <input 
                type="number" 
                value={formData.port} 
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="form-input" 
                placeholder="e.g. 9100"
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary" style={{ flexGrow: 1 }}>
                Save Settings
              </button>
              <button 
                type="button" 
                onClick={handleTestConnection} 
                className="btn btn-secondary"
                style={{ flexGrow: 1 }}
                disabled={testing}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#fff',
            border: '1px solid #f1ebd8',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: 'var(--shadow-soft)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>Thermal Printing</h3>
            <p style={{ fontSize: '14px', color: '#8a7c73', lineHeight: '1.6', marginBottom: '15px' }}>
              Kanchi Cafe uses standard ESC/POS ethernet thermal printers. Enter the static IP address and raw TCP port (usually 9100) assigned to your printer.
            </p>
            <div style={{ backgroundColor: '#fff9e6', borderLeft: '3px solid #ffcc00', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: '12px', color: '#8a6d00' }}>
              <strong>Notice:</strong> Make sure the printer is on the same local subnet as this server machine to successfully test connection.
            </div>
          </div>

          {testResult && (
            <div style={{
              background: testResult.success ? '#e8f5e9' : '#ffebee',
              border: `1px solid ${testResult.success ? '#c8e6c9' : '#ffcdd2'}`,
              color: testResult.success ? '#2e7d32' : '#c62828',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '13px',
              fontWeight: '500',
              animation: 'fadeIn 0.3s ease'
            }}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
