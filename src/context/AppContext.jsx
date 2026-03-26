/*
 * FILE: context/AppContext.jsx
 * PURPOSE: Global app state — active location, users, tasks, workflows, files
 * IMPORTS: React createContext / useState / useEffect, useLocations, useUsers, useTasks hooks
 * EXPORTS: AppProvider, useApp()
 * RELATED: Consumed by all screens and hooks
 * SESSION 7: Integrated useLocations, useUsers, and useTasks hooks — all now from Supabase
 */

import { createContext, useContext, useState, useEffect } from "react";
import { useLocations } from "../hooks/useLocations";
import { useUsers } from "../hooks/useUsers";
import { useTasks } from "../hooks/useTasks";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Fetch locations from Supabase
  const { locations, loading: locationsLoading } = useLocations();
  
  // Active location state
  const [activeLocationId, setActiveLocationId] = useState(null);
  
  // Set default location once locations are loaded
  useEffect(() => {
    if (locations.length > 0 && !activeLocationId) {
      setActiveLocationId(locations[0].id);
    }
  }, [locations, activeLocationId]);

  // Fetch users from Supabase for the active location
  const {
    users,
    loading: usersLoading,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers(activeLocationId);

  // Fetch tasks from Supabase for the active location
  const {
    tasks,
    loading: tasksLoading,
    createTask: createTaskDB,
    updateTask: updateTaskDB,
    deleteTask: deleteTaskDB,
  } = useTasks(activeLocationId);

  // Workflows, files — still in-memory for now (will be converted later)
  const [workflows, setWorkflows] = useState([]);
  const [files,     setFiles]     = useState([]);

  // Title & department option lists (custom entries persist across app)
  const [titleOptions, setTitleOptions] = useState([
    "General Manager", "Assistant Manager", "Shift Lead",
    "Sous Chef", "Line Cook", "Server", "Host", "Bartender", "Busser",
  ]);
  const [deptOptions, setDeptOptions] = useState(["FOH", "BOH", "Bar", "Management"]);

  const activeLocation = locations.find(l => l.id === activeLocationId);

  // ── Task helpers (now using Supabase) ─────────────────────────────────────
  async function createTask(taskObj) {
    const result = await createTaskDB(taskObj);
    return result.success ? result.data : null;
  }

  async function updateTask(id, updates) {
    await updateTaskDB(id, updates);
  }

  async function deleteTask(id) {
    await deleteTaskDB(id);
  }

  // ── User helpers (using Supabase) ─────────────────────────────────────────
  async function addUser(userData) {
    const result = await createUser(userData);
    return result.success ? result.data : null;
  }

  async function updateUserWrapper(id, updates) {
    await updateUser(id, updates);
  }

  async function removeUser(id) {
    await deleteUser(id);
  }

  // ── Option list helpers ───────────────────────────────────────────────────
  function addTitleOption(label) {
    if (!titleOptions.includes(label)) setTitleOptions(prev => [...prev, label]);
  }
  function addDeptOption(label) {
    if (!deptOptions.includes(label)) setDeptOptions(prev => [...prev, label]);
  }

  // Show loading state while locations are being fetched
  if (locationsLoading || !activeLocationId) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F7FA',
        fontFamily: 'DM Sans, sans-serif',
        color: '#5A606B'
      }}>
        Loading...
      </div>
    );
  }

  const value = {
    // Location
    locations,
    activeLocationId,
    setActiveLocationId,
    activeLocation,

    // Users (from Supabase)
    users,
    usersLoading,
    addUser,
    updateUser: updateUserWrapper,
    removeUser,

    // Tasks (from Supabase)
    tasks,
    tasksLoading,
    createTask,
    updateTask,
    deleteTask,

    // Workflows (still in-memory)
    workflows: workflows.filter(w => w.locationId === activeLocationId),
    setWorkflows,

    // Files (still in-memory)
    files: files.filter(f => f.locationId === activeLocationId),
    setFiles,

    // Option lists
    titleOptions, addTitleOption,
    deptOptions,  addDeptOption,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
