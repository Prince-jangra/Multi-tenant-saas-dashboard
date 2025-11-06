import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'
import Login from './components/Login.jsx'
import UserManagement from './components/UserManagement.jsx'
import TenantSelection from './components/TenantSelection.jsx'
import Dashboard from './components/Dashboard.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

function useTenantSlug() {
  // Accept /t/:slug prefix or query ?tenant=, fallback to header-only mode
  const extractSlug = () => {
    const path = window.location.pathname
    const m = path.match(/^\/(t|tenant)\/([a-z0-9-]+)(\/|$)/i)
    if (m) return m[2].toLowerCase()
    const url = new URL(window.location.href)
    return url.searchParams.get('tenant')?.toLowerCase() || null
  }
  
  const [slug, setSlug] = useState(extractSlug)
  
  // Update slug when path changes (on navigation)
  useEffect(() => {
    const handlePopState = () => {
      const newSlug = extractSlug()
      if (newSlug !== slug) setSlug(newSlug)
    }
    window.addEventListener('popstate', handlePopState)
    // Also check on mount/update
    const newSlug = extractSlug()
    if (newSlug !== slug) setSlug(newSlug)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [slug])
  
  return [slug, setSlug]
}

async function fetchJSON(url, { tenant, token, ...opts } = {}) {
  const headers = new Headers(opts.headers || {})
  if (tenant) headers.set('X-Tenant-ID', tenant)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(url, { ...opts, headers, credentials: 'include' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function App() {
  const [tenant, setTenant] = useTenantSlug()
  const [user, setUser] = useState(null)
  const [me, setMe] = useState(null)
  const [resources, setResources] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard' or 'users'
  const themeHref = useMemo(() => `${API_BASE}/api/themes/current.css`, [])

  // Check authentication on mount and when tenant changes
  useEffect(() => {
    const checkAuth = async () => {
      if (!tenant) {
        setUser(null)
        setLoading(false)
        return
      }

      const token = localStorage.getItem('token')
      if (!token) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const data = await fetchJSON(`${API_BASE}/api/auth/me`, { tenant, token })
        setUser(data.user)
      } catch (err) {
        console.error('Auth check failed:', err)
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [tenant])

  useEffect(() => {
    if (!tenant) return
    // Fetch theme CSS with tenant header and inject it
    fetch(`${API_BASE}/api/themes/current.css`, {
      headers: { 'X-Tenant-ID': tenant }
    })
      .then(res => res.text())
      .then(css => {
        // Remove old theme style if exists
        const oldStyle = document.getElementById('dynamic-tenant-theme')
        if (oldStyle) oldStyle.remove()
        
        // Inject new theme CSS
        const style = document.createElement('style')
        style.id = 'dynamic-tenant-theme'
        style.textContent = css
        document.head.appendChild(style)
      })
      .catch(err => console.error('Failed to load theme:', err))
  }, [tenant])

  useEffect(() => {
    if (!tenant || !user) {
      setMe(null)
      return
    }
    setError(null)
    fetchJSON(`${API_BASE}/api/tenants/me`, { tenant, token: localStorage.getItem('token') })
      .then((data) => {
        console.log('Tenant data:', data)
        setMe(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to fetch tenant:', err)
        setMe(null)
        setError(`Tenant "${tenant}" not found. Make sure you've run: npm run seed (in backend folder)`)
      })
  }, [tenant, user])

  useEffect(() => {
    if (!tenant || !user) {
      setResources([])
      return
    }
    const token = localStorage.getItem('token')
    fetchJSON(`${API_BASE}/api/resources`, { tenant, token })
      .then(setResources)
      .catch(() => setResources([]))
  }, [tenant, user])

  async function createResource(e) {
    e.preventDefault()
    if (!tenant) return alert('Set a tenant first (e.g. acme)')
    if (!user) return alert('Please login first')
    setCreating(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetchJSON(`${API_BASE}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        tenant,
        token
      })
      setResources(prev => [res, ...prev])
      setForm({ title: '', content: '' })
    } catch (err) {
      alert('Failed to create resource')
    } finally { setCreating(false) }
  }

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    }
    localStorage.removeItem('token')
    setUser(null)
    setResources([])
  }

  // Show login page if not authenticated
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f0f1e',
        color: '#fff'
      }}>
        Loading...
      </div>
    )
  }

  if (!tenant) {
    return (
      <TenantSelection onSelectTenant={(slug) => {
        setTenant(slug);
        window.location.href = `/t/${slug}/`;
      }} />
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} tenant={tenant} />
  }

  // Show User Management if that's the current view
  if (currentView === 'users') {
    return (
      <UserManagement 
        tenant={tenant} 
        currentUser={user}
        onBack={() => setCurrentView('dashboard')}
      />
    )
  }

  // Show Dashboard
  return (
    <Dashboard
      tenant={tenant}
      user={user}
      me={me}
      resources={resources}
      creating={creating}
      form={form}
      setForm={setForm}
      createResource={createResource}
      onUserManagement={() => setCurrentView('users')}
      onLogout={handleLogout}
    />
  )
}

function TenantSwitcher({ tenant, onChange }) {
  const [value, setValue] = useState(tenant || '')
  
  // Update input when tenant changes from outside (e.g., URL)
  useEffect(() => {
    if (tenant && tenant !== value) {
      setValue(tenant)
    }
  }, [tenant])
  
  const handleApply = () => {
    const slug = value.trim().toLowerCase()
    if (slug) {
      onChange(slug)
      // Navigate to path prefix mode for better theme support
      window.location.href = `/t/${slug}/`
    } else {
      onChange(null)
    }
  }
  
  return (
    <div className="hstack">
      <input 
        className="input" 
        placeholder="tenant (e.g. acme)" 
        value={value} 
        onChange={e=>setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            handleApply()
          }
        }}
      />
      <button className="btn" onClick={handleApply}>Apply</button>
      <a className="link" href={`/t/${value || 'acme'}/`}>Use path prefix</a>
    </div>
  )
}
