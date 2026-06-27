import React, { useState, useEffect } from 'react';

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Form / Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null); // null if adding new
  const [imageSource, setImageSource] = useState('url'); // 'file' | 'url'
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    is_available: true,
    image_url: '',
    image: null
  });

  const fetchData = async () => {
    try {
      const catsRes = await fetch('/api/admin/categories');
      const catsData = await catsRes.json();
      setCategories(catsData);

      const menuRes = await fetch('/api/admin/menu');
      const menuData = await menuRes.json();
      setMenuItems(menuData);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for custom SSE notifications
    window.addEventListener('api-refresh', fetchData);
    return () => {
      window.removeEventListener('api-refresh', fetchData);
    };
  }, []);

  const handleToggleAvailable = async (item) => {
    const updatedStatus = !item.is_available;
    try {
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.name,
          category_id: item.category_id,
          price: item.price,
          description: item.description,
          is_available: updatedStatus,
          image_url: item.image_url
        })
      });
      if (res.ok) {
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, is_available: updatedStatus } : m));
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: `Availability status updated for ${item.name}`, type: 'success' }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (item) => {
    setEditItem(item);
    // Determine image source type based on URL pattern (checks if local upload path)
    const isLocalUpload = item.image_url && (item.image_url.startsWith('/uploads/') || item.image_url.startsWith('data:'));
    setImageSource(isLocalUpload ? 'file' : 'url');
    setFormData({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      description: item.description || '',
      is_available: item.is_available === 1 || item.is_available === true,
      image_url: isLocalUpload ? '' : (item.image_url || ''),
      image: null
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditItem(null);
    setImageSource('url');
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      price: '',
      description: '',
      is_available: true,
      image_url: '',
      image: null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Menu item deleted successfully!', type: 'success' }
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category_id', formData.category_id);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('is_available', formData.is_available);

    if (imageSource === 'file' && formData.image) {
      data.append('image', formData.image);
    } else {
      data.append('image_url', formData.image_url);
    }

    const url = editItem ? `/api/admin/menu/${editItem.id}` : '/api/admin/menu';
    const method = editItem ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: data
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Menu item saved successfully!', type: 'success' }
        }));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save menu item');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLivePreview = () => {
    if (imageSource === 'file' && formData.image) {
      return URL.createObjectURL(formData.image);
    }
    if (imageSource === 'url' && formData.image_url) {
      return formData.image_url;
    }
    if (editItem?.image_url) {
      return editItem.image_url;
    }
    return '';
  };

  const filteredMenuItems = filterCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category_name === filterCategory);

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Menu Management</h1>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Category Filter */}
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="select-control"
            style={{ width: '180px' }}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <button onClick={handleAddClick} className="btn btn-primary">
            + Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading menu items...</div>
      ) : filteredMenuItems.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid #f1ebd8',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#8a7c73',
          boxShadow: 'var(--shadow-soft)'
        }}>
          No items found. Click "+ Add Item" to create one.
        </div>
      ) : (
        <div className="menu-grid">
          {filteredMenuItems.map((item) => (
            <div key={item.id} className="menu-card" style={{ opacity: item.is_available ? 1 : 0.7 }}>
              <div>
                <div className="menu-card-img-container">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="menu-card-img" />
                  ) : (
                    <div className="menu-card-img-placeholder">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: '40px', height: '40px' }}>
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="menu-card-body">
                  <span className="menu-card-category">{item.category_name}</span>
                  <h3 className="menu-card-title">{item.name}</h3>
                  <p className="menu-card-desc">{item.description || 'No description provided.'}</p>
                  
                  <div className="menu-card-price-row">
                    <span className="menu-card-price">₹{Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="menu-card-footer">
                <div className="toggle-switch-wrapper">
                  <span>Available</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={item.is_available === 1 || item.is_available === true} 
                      onChange={() => handleToggleAvailable(item)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleEditClick(item)} className="btn btn-secondary btn-sm">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Add/Edit Menu Item */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Item Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input" 
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Category *</label>
                  <select 
                    value={formData.category_id} 
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="select-control"
                    required
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Price (₹) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-input" 
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input" 
                  rows="2"
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Image Source Selector */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Image Source Option</label>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="imageSourceOpt" 
                      value="url" 
                      checked={imageSource === 'url'} 
                      onChange={() => setImageSource('url')}
                    />
                    Image URL
                  </label>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="imageSourceOpt" 
                      value="file" 
                      checked={imageSource === 'file'} 
                      onChange={() => setImageSource('file')}
                    />
                    Upload Local File
                  </label>
                </div>

                {imageSource === 'file' ? (
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="form-input" 
                  />
                ) : (
                  <input 
                    type="text" 
                    placeholder="Paste image web link URL (https://...)" 
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="form-input" 
                  />
                )}
              </div>

              {/* Live Image Preview Area */}
              {getLivePreview() && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px', border: '1px solid #f1ebd8', borderRadius: '8px', backgroundColor: 'rgba(247, 242, 234, 0.2)' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#8a7c73', textTransform: 'uppercase' }}>Live Preview</span>
                  <img 
                    src={getLivePreview()} 
                    alt="Menu item live preview" 
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #f1ebd8' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}

              <div className="toggle-switch-wrapper" style={{ padding: '5px 0' }}>
                <span>Available immediately in Customer Menu</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={formData.is_available} 
                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
