import React, { useState, useEffect } from 'react';

export default function AdminCafeSettings() {
  const [formData, setFormData] = useState({
    cafe_name: '',
    address: '',
    phone: '',
    gst_number: '',
    gst_percentage: '',
    upi_id: '',
    logo_url: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.cafe) {
          setFormData({
            cafe_name: data.cafe.cafe_name,
            address: data.cafe.address || '',
            phone: data.cafe.phone || '',
            gst_number: data.cafe.gst_number || '',
            gst_percentage: data.cafe.gst_percentage || '5.00',
            upi_id: data.cafe.upi_id || 'kanchicafe@upi',
            logo_url: data.cafe.logo_url || ''
          });
          if (data.cafe.logo_url) {
            setLogoPreview(data.cafe.logo_url);
          }
        }
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('cafe_name', formData.cafe_name);
    data.append('address', formData.address);
    data.append('phone', formData.phone);
    data.append('gst_number', formData.gst_number);
    data.append('gst_percentage', formData.gst_percentage);
    data.append('upi_id', formData.upi_id);
    if (logoFile) {
      data.append('logo', logoFile);
    }

    try {
      const res = await fetch('/api/admin/settings/cafe', {
        method: 'PUT',
        body: data
      });
      if (res.ok) {
        alert('Cafe settings saved successfully!');
      } else {
        alert('Failed to save cafe settings');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading settings...</div>;
  }

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Cafe Settings</h1>
        <div style={{ fontSize: '13px', color: '#8a7c73', fontWeight: '500' }}>
          General profile information
        </div>
      </div>

      <div className="settings-form-grid">
        <div className="settings-card">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* Logo uploader */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cafe Logo</label>
              <div className="logo-uploader-area">
                <div className="logo-preview-wrapper">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="logo-preview-img" />
                  ) : (
                    <div className="logo-preview-placeholder">KC</div>
                  )}
                </div>
                <div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="form-input"
                    style={{ display: 'none' }}
                    id="logo-input-field"
                  />
                  <label 
                    htmlFor="logo-input-field" 
                    className="btn btn-secondary btn-sm"
                    style={{ cursor: 'pointer' }}
                  >
                    Upload Logo
                  </label>
                </div>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Cafe Name</label>
              <input 
                type="text" 
                value={formData.cafe_name} 
                onChange={(e) => setFormData({ ...formData, cafe_name: e.target.value })}
                className="form-input" 
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input" 
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">UPI ID for Payments *</label>
              <input 
                type="text" 
                value={formData.upi_id} 
                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                className="form-input" 
                placeholder="e.g. kanchicafe@upi"
                required
              />
              <div style={{ fontSize: '11px', color: '#8a7c73', marginTop: '4px' }}>
                This UPI ID will generate the payment QR code during customer checkout.
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '15px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">GST Number</label>
                <input 
                  type="text" 
                  value={formData.gst_number} 
                  onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                  className="form-input" 
                  placeholder="33AAAAA1111A1Z1"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">GST Percentage (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.gst_percentage} 
                  onChange={(e) => setFormData({ ...formData, gst_percentage: e.target.value })}
                  className="form-input" 
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Address</label>
              <textarea 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input" 
                rows="3"
                style={{ resize: 'none' }}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Save Settings
            </button>
          </form>
        </div>

        {/* Branding Guide */}
        <div style={{
          background: '#fff',
          border: '1px solid #f1ebd8',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '15px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Kanchi Cafe Identity</h3>
          <p style={{ fontSize: '14px', color: '#8a7c73', lineHeight: '1.6' }}>
            Updating your cafe details dynamically updates your receipts, print slips, GST tax lines, and customer checkout invoices.
          </p>
          <div style={{ fontSize: '13px', color: '#3c2218', fontWeight: '500', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ color: '#d1a153' }}>&bull;</span>
              <span><strong>Logo:</strong> Used on printed bills and invoices.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ color: '#d1a153' }}>&bull;</span>
              <span><strong>UPI ID:</strong> Generates dynamic deep links for mobile payments.</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ color: '#d1a153' }}>&bull;</span>
              <span><strong>GST:</strong> Applied to customer billing totals.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
