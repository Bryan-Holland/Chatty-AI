/*
 * FILE: screens/LoginScreen.jsx
 * PURPOSE: Authentication screen — sign in / sign up UI
 * IMPORTS: useAuth hook
 * EXPORTS: default LoginScreen component
 * RELATED: Shown by App.jsx when user is not authenticated
 * SESSION 7: Initial auth screen with email/password
 */

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function LoginScreen() {
  const { signIn, signUp, error } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError('')
    setLoading(true)

    if (mode === 'signup') {
      const result = await signUp(email, password, { name })
      if (!result.success) {
        setLocalError(result.error)
      }
    } else {
      const result = await signIn(email, password)
      if (!result.success) {
        setLocalError(result.error)
      }
    }

    setLoading(false)
  }

  const isSignUp = mode === 'signup'

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F7FA',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: 40,
        width: 360,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#1A1D23',
            marginBottom: 8,
          }}>
            Chatty AI
          </h1>
          <p style={{
            fontSize: 14,
            color: '#5A606B',
            fontWeight: 300,
          }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#5A606B',
                marginBottom: 6,
              }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #E4E7EC',
                  borderRadius: 8,
                  fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3D8CC7'}
                onBlur={(e) => e.target.style.borderColor = '#E4E7EC'}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: '#5A606B',
              marginBottom: 6,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #E4E7EC',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3D8CC7'}
              onBlur={(e) => e.target.style.borderColor = '#E4E7EC'}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              color: '#5A606B',
              marginBottom: 6,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #E4E7EC',
                borderRadius: 8,
                fontSize: 14,
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
              }}
              onFocus={(e) => e.target.style.borderColor = '#3D8CC7'}
              onBlur={(e) => e.target.style.borderColor = '#E4E7EC'}
            />
          </div>

          {/* Error message */}
          {(localError || error) && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 13,
              color: '#991B1B',
            }}>
              {localError || error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9198A1' : '#3D8CC7',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'DM Sans, sans-serif',
              marginBottom: 16,
            }}
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>

          {/* Toggle mode */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setMode(isSignUp ? 'signin' : 'signup')
                setLocalError('')
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#3D8CC7',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                textDecoration: 'underline',
              }}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
