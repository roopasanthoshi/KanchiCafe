import React, { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add user.');
      } else {
        setSuccess(`User "${email}" added successfully.`);
        setEmail('');
        setPassword('');
        fetchUsers();
      }
    } catch (err) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, userEmail) => {
    if (!window.confirm(`Remove user "${userEmail}"?`)) return;
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Users</h1>
        <p style={{ color: '#c9a97a', margin: 0, fontSize: '14px' }}>
          Manage who can access the Admin Dashboard
        </p>
      </div>

      {/* Add User Form */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <h2 className="card-title">Add New Admin User</h2>
        </div>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#c9a97a', marginBottom: '6px' }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="form-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ flex: '1', minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#c9a97a', marginBottom: '6px' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Password"
              className="form-input"
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ whiteSpace: 'nowrap' }}
            >
              {loading ? 'Adding...' : '+ Add User'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{
            marginTop: '14px',
            padding: '10px 14px',
            background: 'rgba(220,53,69,0.12)',
            border: '1px solid rgba(220,53,69,0.35)',
            borderRadius: '8px',
            color: '#ff7b7b',
            fontSize: '13px'
          }}>{error}</div>
        )}
        {success && (
          <div style={{
            marginTop: '14px',
            padding: '10px 14px',
            background: 'rgba(40,167,69,0.12)',
            border: '1px solid rgba(40,167,69,0.35)',
            borderRadius: '8px',
            color: '#6fcf97',
            fontSize: '13px'
          }}>{success}</div>
        )}
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Admin Users ({users.length})</h2>
        </div>
        {users.length === 0 ? (
          <p style={{ color: '#c9a97a', textAlign: 'center', padding: '32px' }}>No users found.</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td style={{ color: '#c9a97a', fontWeight: '600' }}>{i + 1}</td>
                    <td style={{ fontWeight: '500' }}>{u.email}</td>
                    <td style={{ color: '#c9a97a', fontSize: '13px' }}>
                      {new Date(u.created_at).toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        style={{
                          background: 'rgba(220,53,69,0.15)',
                          color: '#ff7b7b',
                          border: '1px solid rgba(220,53,69,0.35)',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
