/*
 * FILE: hooks/useUsers.js
 * PURPOSE: Custom hook — all user read/write operations against Supabase
 * IMPORTS: supabase client from lib/supabase.js
 * EXPORTS: useUsers() → { users, loading, error, createUser, updateUser, deleteUser, refreshUsers }
 * RELATED: Used by context/AppContext.jsx, screens/SettingsSheet.jsx
 * SESSION 7: Initial build - basic CRUD operations
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useUsers(locationId) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch users for the current location
  async function fetchUsers() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('location_id', locationId)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create a new user
  async function createUser(userData) {
    try {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([{
          ...userData,
          location_id: locationId
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh the users list
      await fetchUsers()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error creating user:', err)
      return { success: false, error: err.message }
    }
  }

  // Update an existing user
  async function updateUser(userId, updates) {
    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh the users list
      await fetchUsers()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error updating user:', err)
      return { success: false, error: err.message }
    }
  }

  // Delete a user
  async function deleteUser(userId) {
    try {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteError) throw deleteError

      // Refresh the users list
      await fetchUsers()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting user:', err)
      return { success: false, error: err.message }
    }
  }

  // Fetch users when locationId changes
  useEffect(() => {
    if (locationId) {
      fetchUsers()
    }
  }, [locationId])

  return {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers: fetchUsers
  }
}
