import React, { useState } from 'react';
import './Dashboard.css';

export default function Dashboard({ 
  tenant, 
  user, 
  me, 
  resources, 
  creating, 
  form, 
  setForm, 
  createResource,
  onUserManagement,
  onLogout 
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calculate stats
  const stats = {
    totalResources: resources.length,
    recentResources: resources.filter(r => {
      const created = new Date(r.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created > weekAgo;
    }).length,
    totalUsers: 1, // This would come from API
    activeProjects: resources.length
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {me?.brand?.logoUrl ? (
            <img 
              src={me.brand.logoUrl} 
              alt={me.name} 
              className="sidebar-logo"
            />
          ) : (
            <div className="sidebar-logo-placeholder">
              {me?.name?.charAt(0) || 'M'}
            </div>
          )}
          {sidebarOpen && (
            <div className="sidebar-brand">
              <div className="sidebar-brand-name">{me?.name || 'Multi-tenant SaaS'}</div>
              <div className="sidebar-brand-slug">@{me?.slug || 'tenant'}</div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            {sidebarOpen && <span>Overview</span>}
          </a>
          <a href="#resources" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6"/>
            </svg>
            {sidebarOpen && <span>Resources</span>}
          </a>
          {user?.role === 'admin' && (
            <a href="#users" className="nav-item" onClick={(e) => { e.preventDefault(); onUserManagement(); }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {sidebarOpen && <span>Users</span>}
            </a>
          )}
          <a href="#settings" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
            </svg>
            {sidebarOpen && <span>Settings</span>}
          </a>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-role">{user?.role === 'admin' ? 'Admin' : 'Member'}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="sidebar-logout" onClick={onLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          
          <div className="header-title">
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name}</p>
          </div>

          <div className="header-actions">
            <button className="header-action-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <div className="header-user-menu">
              <div className="header-user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalResources}</div>
                <div className="stat-label">Total Resources</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.recentResources}</div>
                <div className="stat-label">Recent (7 days)</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeProjects}</div>
                <div className="stat-label">Active Projects</div>
              </div>
            </div>
          </div>

          {/* Resources Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Resources</h2>
              <button className="section-action-btn">View All</button>
            </div>

            {/* Create Resource Form */}
            <div className="create-resource-card">
              <h3>Create New Resource</h3>
              <form className="resource-form" onSubmit={createResource}>
                <div className="form-row">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Resource title"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Description or content"
                    value={form.content}
                    onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  />
                </div>
                <button type="submit" className="form-submit-btn" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Resource'}
                </button>
              </form>
            </div>

            {/* Resources Grid */}
            {resources.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <path d="M14 2v6h6"/>
                </svg>
                <h3>No resources yet</h3>
                <p>Create your first resource to get started</p>
              </div>
            ) : (
              <div className="resources-grid">
                {resources.map(resource => (
                  <div key={resource._id} className="resource-card">
                    <div className="resource-card-header">
                      <h4>{resource.title}</h4>
                      <button className="resource-menu-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="5" r="1"/>
                          <circle cx="12" cy="12" r="1"/>
                          <circle cx="12" cy="19" r="1"/>
                        </svg>
                      </button>
                    </div>
                    <p className="resource-content">{resource.content || 'No description'}</p>
                    <div className="resource-footer">
                      <span className="resource-date">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

