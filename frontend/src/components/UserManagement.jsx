import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function UserManagement({ tenant, currentUser, onBack }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMenu, setShowMenu] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [tenant]);

  const fetchUsers = async () => {
    if (!tenant) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users`, {
        headers: {
          'X-Tenant-ID': tenant,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUsers([...users, data]);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'user' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-Tenant-ID': tenant,
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      setUsers(users.filter(u => u.id !== userId || u._id !== userId));
      setShowMenu(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', 
      '#10b981', '#ef4444', '#6366f1', '#14b8a6'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  const isCurrentUser = (user) => {
    const userId = user.id || user._id;
    const currentUserId = currentUser?.id || currentUser?._id;
    return userId === currentUserId;
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="um-header">
        <button className="um-back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="um-title">User Management</h1>
      </div>

      {/* Search and Add */}
      <div className="um-actions">
        <div className="um-search-wrapper">
          <svg className="um-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="um-search-input"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="um-add-button" onClick={() => setShowAddModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add New User
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="um-error">
          {error}
        </div>
      )}

      {/* User List */}
      <div className="um-user-list">
        {loading ? (
          <div className="um-loading">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="um-empty">No users found</div>
        ) : (
          filteredUsers.map((user) => {
            const userId = user.id || user._id;
            const userRole = user.role || 'user';
            const displayName = isCurrentUser(user) ? `${user.name} (You)` : user.name;
            
            return (
              <div key={userId} className="um-user-card">
                <div className="um-user-avatar" style={{ backgroundColor: getAvatarColor(user.name) }}>
                  {getInitials(user.name)}
                </div>
                <div className="um-user-info">
                  <div className="um-user-name">{displayName}</div>
                  <div className="um-user-email">{user.email}</div>
                </div>
                <div className="um-user-badges">
                  <span className={`um-role-badge um-role-${userRole}`}>
                    {userRole === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>
                <div className="um-user-menu">
                  <button
                    className="um-menu-button"
                    onClick={() => setShowMenu(showMenu === userId ? null : userId)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="5" r="1"/>
                      <circle cx="12" cy="12" r="1"/>
                      <circle cx="12" cy="19" r="1"/>
                    </svg>
                  </button>
                  {showMenu === userId && (
                    <div className="um-menu-dropdown">
                      {!isCurrentUser(user) && (
                        <button
                          className="um-menu-item um-menu-danger"
                          onClick={() => handleDeleteUser(userId)}
                        >
                          Delete User
                        </button>
                      )}
                      {isCurrentUser(user) && (
                        <div className="um-menu-item um-menu-disabled">Cannot delete yourself</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="um-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <div className="um-modal-header">
              <h2>Add New User</h2>
              <button className="um-modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddUser} className="um-modal-form">
              <div className="um-form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="um-form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="um-form-group">
                <label>Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password"
                />
              </div>
              <div className="um-form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="user">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {error && <div className="um-form-error">{error}</div>}
              <div className="um-modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div className="um-menu-overlay" onClick={() => setShowMenu(null)} />
      )}
    </div>
  );
}

