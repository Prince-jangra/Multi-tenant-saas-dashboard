import React, { useState, useEffect } from 'react';
import './TenantSelection.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function TenantSelection({ onSelectTenant }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/tenants`);
      if (!response.ok) throw new Error('Failed to fetch tenants');
      const data = await response.json();
      setTenants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const query = searchQuery.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(query) ||
      tenant.slug.toLowerCase().includes(query) ||
      (tenant.brand?.tagline && tenant.brand.tagline.toLowerCase().includes(query))
    );
  });

  const handleTenantSelect = (tenantSlug) => {
    onSelectTenant(tenantSlug);
  };

  return (
    <div className="tenant-selection">
      {/* Simple Background */}
      <div className="tech-background"></div>

      {/* Content */}
      <div className="ts-content">
        {/* Header */}
        <div className="ts-header">
          <div className="ts-logo">
            <div className="ts-logo-box">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"/>
              </svg>
            </div>
          </div>
          <h1 className="ts-title">Multi Tenant SaaS App</h1>
          <p className="ts-subtitle">Select your organization to continue</p>
        </div>

        {/* Search Bar */}
        <div className="ts-search-wrapper">
          <svg className="ts-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="ts-search-input"
            placeholder="Search by name or slug (e.g. acme, globex)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                // If only one result, select it; otherwise try to match slug
                const exactMatch = tenants.find(t => 
                  t.slug.toLowerCase() === searchQuery.trim().toLowerCase()
                );
                if (exactMatch) {
                  handleTenantSelect(exactMatch.slug);
                } else if (filteredTenants.length === 1) {
                  handleTenantSelect(filteredTenants[0].slug);
                }
              }
            }}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="ts-error">
            {error}. Make sure the backend is running and you've run: <code>npm run seed</code>
          </div>
        )}

        {/* Search Results Dropdown */}
        {!loading && searchQuery && filteredTenants.length > 0 && (
          <div className="ts-results-dropdown">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant._id || tenant.slug}
                className="ts-result-item"
                onClick={() => handleTenantSelect(tenant.slug)}
              >
                <div className="ts-result-info">
                  <span className="ts-result-name">{tenant.name}</span>
                  <span className="ts-result-slug">@{tenant.slug}</span>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            ))}
          </div>
        )}

        {/* Loading or Empty State */}
        {loading && (
          <div className="ts-loading">
            <div className="ts-spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {!loading && searchQuery && filteredTenants.length === 0 && (
          <div className="ts-empty">
            <p>No tenants found matching "{searchQuery}"</p>
          </div>
        )}

      </div>
    </div>
  );
}

