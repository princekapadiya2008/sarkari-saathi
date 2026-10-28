import React, { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, UserRound, AlertCircle, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';

export default function Auth({ mode, onSubmit, navigate, isBackendLive }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const signup = mode === 'signup';
  const isDev = Boolean(
    import.meta.env?.DEV ||
    (typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === ''
    ))
  );

  const validate = () => {
    const errs = {};
    if (signup) {
      if (!name.trim()) {
        errs.name = 'Full name is required.';
      } else if (name.trim().length < 2) {
        errs.name = 'Full name must be at least 2 characters.';
      } else if (name.trim().length > 60) {
        errs.name = 'Full name must be 60 characters or fewer.';
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (signup) {
      if (password.length < 8) {
        errs.password = 'Password must be at least 8 characters long.';
      } else if (!/[A-Za-z]/.test(password)) {
        errs.password = 'Password must include at least one letter.';
      } else if (!/[0-9]/.test(password)) {
        errs.password = 'Password must include at least one number.';
      }
    }

    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple concurrent submissions

    setGeneralError('');
    setFieldErrors({});

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const result = await onSubmit({
        name: signup ? name.trim() : undefined,
        email: email.trim(),
        password,
      });

      if (result?.error) {
        if (result.details?.fields) {
          setFieldErrors(result.details.fields);
        } else if (result.code === 'EMAIL_TAKEN' || result.error.toLowerCase().includes('email')) {
          setFieldErrors({ email: result.error });
        } else {
          setGeneralError(result.error);
        }
      }
    } catch (err) {
      setGeneralError(err.message || 'Something went wrong. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@example.com');
    setPassword('ChangeMe_admin1');
    setGeneralError('');
    setFieldErrors({});
  };

  const fillDemoCitizen = () => {
    if (signup) setName('Priya Sharma');
    setEmail('citizen@example.com');
    setPassword('Citizen123!');
    setGeneralError('');
    setFieldErrors({});
  };

  return (
    <main className="authPage">
      <section className="authCard">
        <button className="brand authBrand" onClick={() => navigate('home')} aria-label="Sarkari Saathi home">
          <img src="/logo-icon.png" alt="Sarkari Saathi" className="brandLogoImg" />
          <span className="brandTextGroup">
            <span className="brandText">Sarkari <span className="brandAccent">Saathi</span></span>
            <span className="brandSub">Your Guide for Every Government Process</span>
          </span>
        </button>

        <div className="authIntro">
          <span className="eyebrow">{signup ? 'New Citizen Registration' : 'Account Sign In'}</span>
          <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>
          <p>
            {signup
              ? 'Register as a citizen to save your personal journeys and track progress securely.'
              : 'Sign in to access your personal journeys, checklists, or administrative tools.'}
          </p>
        </div>

        {isBackendLive === false && (
          <div className="formError" role="alert" style={{ background: '#fef2f2', borderColor: '#ef4444', color: '#991b1b' }}>
            <AlertCircle size={16} />
            <span>Backend server is currently offline. Please ensure the backend is running on port 3001.</span>
          </div>
        )}

        {generalError && (
          <div className="formError" role="alert">
            <AlertCircle size={15} />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={submit} className="authForm" noValidate>
          {signup && (
            <label className="formField">
              <span>Full Name</span>
              <div className={`authInput ${fieldErrors.name ? 'inputError' : ''}`}>
                <UserRound size={16} />
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. Priya Sharma"
                  disabled={loading}
                  required
                />
              </div>
              {fieldErrors.name ? (
                <span className="fieldErrorText">{fieldErrors.name}</span>
              ) : (
                <span className="authFieldHint">Minimum 2 characters</span>
              )}
            </label>
          )}

          <label className="formField">
            <span>Email Address</span>
            <div className={`authInput ${fieldErrors.email ? 'inputError' : ''}`}>
              <Mail size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="you@example.com"
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && <span className="fieldErrorText">{fieldErrors.email}</span>}
          </label>

          <label className="formField">
            <span>Password</span>
            <div className={`authInput ${fieldErrors.password ? 'inputError' : ''}`}>
              <LockKeyhole size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder={signup ? 'At least 8 chars (letters & numbers)' : 'Enter your password'}
                disabled={loading}
                required
                autoComplete={signup ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="passwordToggleBtn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password ? (
              <span className="fieldErrorText">{fieldErrors.password}</span>
            ) : signup ? (
              <span className="authFieldHint">At least 8 characters with a letter and a number</span>
            ) : null}
          </label>

          <button className="button primary full" type="submit" disabled={loading || isBackendLive === false}>
            {loading ? (
              <>
                <Loader2 size={15} className="spinner" />
                <span>{signup ? 'Creating account...' : 'Signing in...'}</span>
              </>
            ) : (
              <>
                <span>{signup ? 'Create account' : 'Sign in'}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        {isDev && (
          <div className="authQuickFill">
            <p>
              <Sparkles size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {signup ? 'Sample Citizen Info' : 'Quick Fill Test Accounts (Local Demo)'}
            </p>
            <div className="quickFillButtons">
              {!signup && (
                <button
                  type="button"
                  className="quickFillBtn"
                  onClick={fillAdmin}
                  disabled={loading}
                  title="Fill test admin credentials into form"
                >
                  Demo Admin
                </button>
              )}
              <button
                type="button"
                className="quickFillBtn"
                onClick={fillDemoCitizen}
                disabled={loading}
                title="Fill test citizen credentials into form"
              >
                {signup ? 'Sample Citizen Info' : 'Demo Citizen'}
              </button>
            </div>
            <span className="authQuickFillHint">
              Fills credentials into the form fields above. Click &quot;{signup ? 'Create account' : 'Sign in'}&quot; to verify credentials via backend.
            </span>
          </div>
        )}

        <p className="authSwitch">
          {signup ? 'Already have an account?' : 'New to Sarkari Saathi?'}{' '}
          <button
            type="button"
            onClick={() => {
              setGeneralError('');
              setFieldErrors({});
              setShowPassword(false);
              navigate(signup ? 'signin' : 'signup');
            }}
          >
            {signup ? 'Sign in' : 'Create an account'}
          </button>
        </p>

        <p className="authNote">
          Connected to secure Sarkari Saathi backend API with hashed credentials.
        </p>
      </section>
    </main>
  );
}
