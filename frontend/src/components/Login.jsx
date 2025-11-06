import React, { useState } from 'react';
import './Login.css';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export default function Login({ onLogin, tenant }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const body = isRegister 
        ? { email, password, name }
        : { email, password };

      const response = await fetch(`${API_BASE}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenant || ''
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `${isRegister ? 'Registration' : 'Login'} failed`);
      }

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Call onLogin callback with user data
      if (onLogin) {
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message || `An error occurred during ${isRegister ? 'registration' : 'login'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="login-title">
          {isRegister ? 'Create your Account' : 'Sign in to your Dashboard'}
        </h1>
        <p className="login-subtitle">
          {isRegister 
            ? 'Get started by creating your account.' 
            : 'Welcome back! Please enter your details.'}
        </p>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Name Field (only for registration) */}
          {isRegister && (
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="name" className="form-label">Name</label>
              </div>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="email" className="form-label">Email</label>
            </div>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">Password</label>
              <a href="#" className="forgot-password-link">Forgot Password?</a>
            </div>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading 
              ? (isRegister ? 'Creating account...' : 'Logging in...') 
              : (isRegister ? 'Sign Up' : 'Login')}
          </button>

          {/* Toggle between Login and Register */}
          <div className="auth-toggle">
            <span className="auth-toggle-text">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            </span>
            <button
              type="button"
              className="auth-toggle-link"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              disabled={loading}
            >
              {isRegister ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p className="copyright-text">
            © 2023 Acme Corp. All rights reserved.{' '}
            <a href="#" className="footer-link">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}

