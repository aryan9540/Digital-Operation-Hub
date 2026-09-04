import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      addToast('Account created successfully! Welcome to TeamSync.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-app)',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Join thousands of teams shipping faster with TeamSync
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <User size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-name"
                  type="text"
                  className="form-control"
                  placeholder="Alex Morgan"
                  style={{ paddingLeft: '34px' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="reg-email">Work Email</label>
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <Mail size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-email"
                  type="email"
                  className="form-control"
                  placeholder="alex@company.com"
                  style={{ paddingLeft: '34px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="reg-pwd">Password</label>
              <div style={{ position: 'relative', marginTop: '5px' }}>
                <Lock size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                  id="reg-pwd"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  style={{ paddingLeft: '34px', paddingRight: '36px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '9px', marginTop: '4px', fontSize: '13.5px', fontWeight: 600, justifyContent: 'center' }}
            >
              {loading ? 'Creating Account...' : 'Get Started Free'}
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>

        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <Link to="/" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
