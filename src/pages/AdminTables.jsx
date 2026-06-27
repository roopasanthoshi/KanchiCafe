import React, { useState, useEffect } from 'react';

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTable, setEditTable] = useState(null); // null if adding
  const [formData, setFormData] = useState({
    table_number: '',
    status: 'Available'
  });

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

  const handleStatusChange = async (tableNumber, newStatus) => {
    try {
      const res = await fetch(`/api/admin/tables/${tableNumber}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTables(prev => prev.map(t => t.table_number === Number(tableNumber) ? { ...t, status: newStatus } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (table) => {
    setEditTable(table);
    setFormData({
      table_number: table.table_number,
      status: table.status
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditTable(null);
    // Suggest next table number
    const maxNum = tables.reduce((max, t) => t.table_number > max ? t.table_number : max, 0);
    setFormData({
      table_number: maxNum + 1,
      status: 'Available'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (tableNumber) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNumber}?`)) return;
    try {
      const res = await fetch(`/api/admin/tables/${tableNumber}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const url = editTable ? `/api/admin/tables/${editTable.table_number}` : '/api/admin/tables';
    const method = editTable ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchTables();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save table');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <h1 className="admin-title">Tables</h1>
        <button onClick={handleAddClick} className="btn btn-primary">
          + Add Table
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#8a7c73' }}>Loading tables...</div>
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
          No tables configured. Click "+ Add Table" to create.
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map((table) => {
            const isOccupied = table.status === 'Occupied';
            return (
              <div 
                key={table.table_number} 
                className={`table-card ${isOccupied ? 'occupied' : ''}`}
              >
                <div>
                  <div className="table-card-header">
                    <span className="table-number-label">Table {table.table_number}</span>
                    <span className="table-index-num">#{table.table_number}</span>
                  </div>

                  <div style={{ marginTop: '15px' }}>
                    <label className="form-label">Availability</label>
                    <select 
                      value={table.status} 
                      onChange={(e) => handleStatusChange(table.table_number, e.target.value)}
                      className="select-control"
                      style={{
                        backgroundColor: isOccupied ? 'rgba(209, 161, 83, 0.1)' : '#fff',
                        borderColor: isOccupied ? 'var(--accent-color)' : 'var(--border-color)',
                        fontWeight: isOccupied ? '700' : 'normal'
                      }}
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </div>
                </div>

                <div className="table-actions">
                  <button 
                    onClick={() => handleEditClick(table)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '5px 10px', fontSize: '11px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(table.table_number)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '5px 10px', fontSize: '11px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog for Table Add/Edit */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editTable ? `Edit Table ${editTable.table_number}` : 'Add Table'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Table Number *</label>
                <input 
                  type="number" 
                  value={formData.table_number} 
                  onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                  className="form-input" 
                  disabled={!!editTable}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Default Status *</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="select-control"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Table</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
