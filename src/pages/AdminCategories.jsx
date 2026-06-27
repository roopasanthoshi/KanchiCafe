import React, { useState, useEffect } from 'react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    display_order: '',
    status: 'Active'
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEditClick = (cat) => {
    setEditCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      display_order: cat.display_order,
      status: cat.status
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditCategory(null);
    setFormData({
      name: '',
      slug: '',
      display_order: categories.length + 1,
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deleting this category will delete all menu items under it. Are you sure you want to proceed?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (val) => {
    const slugified = val.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData({ ...formData, name: val, slug: slugified });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = editCategory ? `/api/admin/categories/${editCategory.id}` : '/api/admin/categories';
    const method = editCategory ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save category. Make sure Slug is unique!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Categories</h1>
        <button onClick={handleAddClick} className="btn btn-primary">
          + New Category
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading categories...</div>
      ) : categories.length === 0 ? (
        <div style={{
          background: '#fff',
          border: '1px solid #f1ebd8',
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center',
          color: '#8a7c73',
          boxShadow: 'var(--shadow-soft)'
        }}>
          No categories found. Click "+ New Category" to create one.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px'
        }}>
          {categories.map((cat) => (
            <div key={cat.id} className="table-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#3c2218' }}>{cat.name}</h3>
                  <div style={{ fontSize: '12px', color: '#8a7c73', marginTop: '4px', fontFamily: 'monospace' }}>
                    /{cat.slug} &bull; order {cat.display_order}
                  </div>
                </div>
                <span className={`badge badge-${cat.status === 'Active' ? 'active' : 'inactive'}`}>
                  {cat.status}
                </span>
              </div>

              <div className="table-actions" style={{ marginTop: '20px' }}>
                <button onClick={() => handleEditClick(cat)} className="btn btn-secondary btn-sm">Edit</button>
                <button onClick={() => handleDelete(cat.id)} className="btn btn-danger btn-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog for Category */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editCategory ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Category Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Slug *</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="form-input" 
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Display Order *</label>
                  <input 
                    type="number" 
                    value={formData.display_order} 
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="form-input" 
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Status *</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="select-control"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
