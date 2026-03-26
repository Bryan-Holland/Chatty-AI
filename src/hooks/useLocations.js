/*
 * FILE: hooks/useLocations.js
 * PURPOSE: Custom hook — fetches the list of restaurant locations from Supabase
 * IMPORTS: supabase client from lib/supabase.js
 * EXPORTS: useLocations() → { locations, loading, error }
 * RELATED: Used by context/AppContext.jsx
 * SESSION 7: Initial build
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('locations')
          .select('*')
          .order('name', { ascending: true })

        if (fetchError) throw fetchError

        setLocations(data || [])
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  return { locations, loading, error }
}
