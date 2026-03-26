/*
 * FILE: hooks/useTasks.js
 * PURPOSE: Custom hook — all task read/write operations against Supabase
 * IMPORTS: supabase client from lib/supabase.js
 * EXPORTS: useTasks() → { tasks, loading, error, createTask, updateTask, deleteTask, refreshTasks }
 * RELATED: Used by context/AppContext.jsx, screens/TasksScreen.jsx, screens/HomeScreen.jsx
 * SESSION 7: Fixed camelCase to snake_case + empty string to null conversion
 */

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Helper: Convert snake_case from DB to camelCase for app
function dbToApp(dbTask) {
  if (!dbTask) return null
  return {
    id: dbTask.id,
    title: dbTask.title,
    assignedTo: dbTask.assigned_to,
    dueDate: dbTask.due_date,
    dueTime: dbTask.due_time,
    department: dbTask.department,
    notes: dbTask.notes,
    status: dbTask.status,
    locationId: dbTask.location_id,
    workflowId: dbTask.workflow_id,
    workflowPosition: dbTask.workflow_position,
    createdAt: dbTask.created_at,
  }
}

// Helper: Convert camelCase from app to snake_case for DB
// Also converts empty strings to null for UUID fields
function appToDb(appTask) {
  const dbTask = {}
  
  if (appTask.title !== undefined) dbTask.title = appTask.title
  
  // UUID fields: convert empty strings to null
  if (appTask.assignedTo !== undefined) {
    dbTask.assigned_to = appTask.assignedTo === "" ? null : appTask.assignedTo
  }
  if (appTask.workflowId !== undefined) {
    dbTask.workflow_id = appTask.workflowId === "" ? null : appTask.workflowId
  }
  
  // Regular fields
  if (appTask.dueDate !== undefined) dbTask.due_date = appTask.dueDate || null
  if (appTask.dueTime !== undefined) dbTask.due_time = appTask.dueTime || null
  if (appTask.department !== undefined) dbTask.department = appTask.department || null
  if (appTask.notes !== undefined) dbTask.notes = appTask.notes || null
  if (appTask.status !== undefined) dbTask.status = appTask.status
  if (appTask.locationId !== undefined) dbTask.location_id = appTask.locationId
  if (appTask.workflowPosition !== undefined) dbTask.workflow_position = appTask.workflowPosition
  
  return dbTask
}

export function useTasks(locationId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch tasks for the current location
  async function fetchTasks() {
    if (!locationId) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('location_id', locationId)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      // Convert all tasks from snake_case to camelCase
      setTasks((data || []).map(dbToApp))
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Create a new task
  async function createTask(taskData) {
    try {
      // Convert to snake_case for database
      const dbData = appToDb(taskData)
      
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert([{
          ...dbData,
          location_id: locationId,
          status: dbData.status || 'pending',
        }])
        .select()
        .single()

      if (insertError) throw insertError

      // Refresh the tasks list
      await fetchTasks()
      
      // Return in camelCase
      return { success: true, data: dbToApp(data) }
    } catch (err) {
      console.error('Error creating task:', err)
      return { success: false, error: err.message }
    }
  }

  // Update an existing task
  async function updateTask(taskId, updates) {
    try {
      // Convert to snake_case for database
      const dbUpdates = appToDb(updates)
      
      const { data, error: updateError } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select()
        .single()

      if (updateError) throw updateError

      // Refresh the tasks list
      await fetchTasks()
      
      // Return in camelCase
      return { success: true, data: dbToApp(data) }
    } catch (err) {
      console.error('Error updating task:', err)
      return { success: false, error: err.message }
    }
  }

  // Delete a task
  async function deleteTask(taskId) {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (deleteError) throw deleteError

      // Refresh the tasks list
      await fetchTasks()
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting task:', err)
      return { success: false, error: err.message }
    }
  }

  // Fetch tasks when locationId changes
  useEffect(() => {
    fetchTasks()
  }, [locationId])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  }
}
