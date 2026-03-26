/*
 * FILE: hooks/useAuth.js
 * PURPOSE: Authentication hook — handles signup, login, logout, session management
 * IMPORTS: supabase client from lib/supabase.js
 * EXPORTS: useAuth() → { user, session, loading, signUp, signIn, signOut, error }
 * RELATED: Used by App.jsx, LoginScreen.jsx
 * SESSION 7: Initial auth implementation with Supabase Auth
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email/password
  async function signUp(email, password, metadata = {}) {
    try {
      setError(null)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata, // Can store name, role, etc.
        },
      })

      if (signUpError) throw signUpError

      return { success: true, data }
    } catch (err) {
      console.error('Error signing up:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Sign in with email/password
  async function signIn(email, password) {
    try {
      setError(null)
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      return { success: true, data }
    } catch (err) {
      console.error('Error signing in:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  // Sign out
  async function signOut() {
    try {
      setError(null)
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) throw signOutError

      return { success: true }
    } catch (err) {
      console.error('Error signing out:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  }
}
