import React, { useEffect, useMemo, useState } from 'react'
import './styles.css'

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

async function fetchJSON(url, { tenant, ...opts } = {}) {
  const headers = new Headers(opts.headers || {})
  if (tenant) headers.set('X-Tenant-ID', tenant)
  const res = await fetch(url, { ...opts, headers, credentials: 'include' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function App() {
  const [tenant, setTenant] = useTenantSlug()
  const [me, setMe] = useState(null)
  const [resources, setResources] = useState([])
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [error, setError] = useState(null)
  const themeHref = useMemo(() => `${API_BASE}/api/themes/current.css`, [])

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
    setError(null)
    if (!tenant) {
      setMe(null)
      return
    }
    fetchJSON(`${API_BASE}/api/tenants/me`, { tenant })
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
  }, [tenant])

  useEffect(() => {
    fetchJSON(`${API_BASE}/api/resources`, { tenant })
      .then(setResources)
      .catch(() => setResources([]))
  }, [tenant])

  async function createResource(e) {
    e.preventDefault()
    if (!tenant) return alert('Set a tenant first (e.g. acme)')
    setCreating(true)
    try {
      const res = await fetchJSON(`${API_BASE}/api/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        tenant
      })
      setResources(prev => [res, ...prev])
      setForm({ title: '', content: '' })
    } catch (err) {
      alert('Failed to create resource')
    } finally { setCreating(false) }
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        {me?.brand?.logoUrl ? (
          <img 
            src={me.brand.logoUrl} 
            alt={me.name} 
            className="logo-img"
            onError={(e) => {
              console.error('Logo failed to load:', me.brand.logoUrl)
              e.target.style.display = 'none'
              const fallback = e.target.nextElementSibling
              if (fallback) fallback.style.display = 'block'
            }}
          />
        ) : null}
        {!me?.brand?.logoUrl && <div className="logo" />}
        <div className="brand-title">{me ? me.name : 'Multi-tenant SaaS'}</div>
        <div className="brand-sub">{me ? `(${me.slug})` : 'select a tenant'}</div>
        <div className="spacer" />
        <TenantSwitcher tenant={tenant} onChange={setTenant} />
      </div>

      <main className="container">
        {error && (
          <div className="panel" style={{marginBottom:16, background:'#fee2e2', borderColor:'#fca5a5', color:'#991b1b'}}>
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="hstack" style={{marginBottom:12}}>
          <h2 style={{margin:'6px 0'}}>Resources</h2>
          {me && <span className="badge">{me.slug}</span>}
        </div>

        <div className="panel" style={{marginBottom:16}}>
          <form className="form" onSubmit={createResource}>
            <div className="row">
              <input className="input" placeholder="Title" value={form.title} onChange={e=>setForm(f=>({...f, title:e.target.value}))} required />
              <input className="input" placeholder="Content" value={form.content} onChange={e=>setForm(f=>({...f, content:e.target.value}))} />
            </div>
            <div className="hstack">
              <button className="btn" disabled={creating}>Add Resource</button>
            </div>
          </form>
        </div>

        {resources.length === 0 ? (
          <div className="panel">
            <div className="muted">No resources yet. Create your first resource above.</div>
          </div>
        ) : (
          <div className="grid">
            {resources.map(r => (
              <div key={r._id} className="card">
                <h4>{r.title}</h4>
                <div className="muted">{r.content || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
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


