/*
 * FILE: App.jsx
 * PURPOSE: Root shell — iPhone frame, status bar, bottom nav, screen router, settings sheet, auth gate
 * IMPORTS: AppContext (provider), all screen components, DM Sans font, useAuth hook
 * EXPORTS: default App
 * RELATED: context/AppContext.jsx, screens/HomeScreen.jsx, TasksScreen.jsx, FilesScreen.jsx, LoginScreen.jsx
 * SESSION 7: Added auth gate — shows LoginScreen when not authenticated
 */

import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { useAuth } from "./hooks/useAuth";
import TasksScreen from "./screens/TasksScreen";
import SettingsSheet from "./screens/SettingsSheet";
import HomeScreen from "./screens/HomeScreen";
import FilesScreen from "./screens/FilesScreen";
import LoginScreen from "./screens/LoginScreen";

const T = {
  blue1:   "#3D8CC7",
  blue2:   "#5CA4D8",
  blue3:   "#7FBBE6",
  gray1:   "#A0A0A0",
  gray2:   "#C2C2C2",
  confirm: "#4A6B58",
  reject:  "#7A8FA6",
  bg:      "#F5F7FA",
  surface: "#FFFFFF",
  border:  "#E4E7EC",
  textPrimary:   "#1A1D23",
  textSecondary: "#5A606B",
  textMuted:     "#9198A1",
};

const NAV = [
  {
    id: "home", label: "Home",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z"
          stroke={active ? T.blue1 : T.gray1} strokeWidth="1.8"
          fill={active ? T.blue1 + "20" : "none"} strokeLinejoin="round"/>
        <path d="M9 22V12h6v10" stroke={active ? T.blue1 : T.gray1} strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
    Screen: HomeScreen,
  },
  {
    id: "tasks", label: "Tasks",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3"
          stroke={active ? T.blue1 : T.gray1} strokeWidth="1.8"
          fill={active ? T.blue1 + "20" : "none"}/>
        <path d="M8 12l2.5 2.5L16 9" stroke={active ? T.blue1 : T.gray1}
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Screen: TasksScreen,
  },
  {
    id: "files", label: "Files",
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 6a2 6 0 012-2h4.586a1 1 0 01.707.293L12 6h7a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
          stroke={active ? T.blue1 : T.gray1} strokeWidth="1.8"
          fill={active ? T.blue1 + "20" : "none"}/>
      </svg>
    ),
    Screen: FilesScreen,
  },
];

function StatusBar() {
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 4px", flexShrink: 0 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>{time}</span>
      <div style={{ width: 120, height: 30, background: "#000", borderRadius: 20 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <rect x="0"  y="7" width="2.5" height="4"  rx="0.5" fill={T.textSecondary}/>
          <rect x="4"  y="5" width="2.5" height="6"  rx="0.5" fill={T.textSecondary}/>
          <rect x="8"  y="3" width="2.5" height="8"  rx="0.5" fill={T.textSecondary}/>
          <rect x="12" y="0" width="2.5" height="11" rx="0.5" fill={T.textSecondary}/>
        </svg>
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
          <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke={T.textSecondary}/>
          <rect x="2"   y="2"   width="14" height="8"  rx="1.5" fill={T.textSecondary}/>
          <path d="M22 4v4a2 2 0 000-4z" fill={T.textSecondary}/>
        </svg>
      </div>
    </div>
  );
}

function TopHeader({ activeScreen, onOpenSettings }) {
  const { activeLocation, locations, setActiveLocationId } = useApp();
  const [showLocPicker, setShowLocPicker] = useState(false);
  const titles = { home: "Chatty AI", tasks: "Tasks", files: "Files" };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 16px 10px", flexShrink: 0,
      borderBottom: `1px solid ${T.border}`, background: T.surface,
    }}>
      <div style={{ position: "relative" }}>
        <button onClick={() => setShowLocPicker(p => !p)}
          style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: T.blue1, fontFamily: "DM Sans, sans-serif" }}>{activeLocation?.name}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1l4 4 4-4" stroke={T.blue1} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        {showLocPicker && (
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 50,
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.10)", minWidth: 180, overflow: "hidden",
          }}>
            {locations.map(loc => (
              <button key={loc.id}
                onClick={() => { setActiveLocationId(loc.id); setShowLocPicker(false); }}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "10px 14px",
                  background: "none", border: "none", cursor: "pointer", fontSize: 13,
                  fontFamily: "DM Sans, sans-serif",
                  color: loc.id === activeLocation?.id ? T.blue1 : T.textPrimary,
                  fontWeight: loc.id === activeLocation?.id ? 600 : 400,
                  borderBottom: `1px solid ${T.border}`,
                }}>
                {loc.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <span style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, fontFamily: "DM Sans, sans-serif" }}>
        {titles[activeScreen]}
      </span>

      <button onClick={onOpenSettings} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
        <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
          <path d="M0 1h20M0 7h20M0 13h20" stroke={T.textSecondary} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

function BottomNav({ active, onSelect }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-around",
      padding: "8px 0 20px", flexShrink: 0,
      background: T.surface, borderTop: `1px solid ${T.border}`,
    }}>
      {NAV.map(({ id, label, icon }) => {
        const isActive = active === id;
        return (
          <button key={id} onClick={() => onSelect(id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              padding: "6px 16px", background: "none", border: "none", cursor: "pointer", borderRadius: 10,
            }}>
            {icon(isActive)}
            <span style={{ fontSize: 10, fontWeight: 500, fontFamily: "DM Sans, sans-serif", color: isActive ? T.blue1 : T.gray1, letterSpacing: "0.3px" }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function InnerApp() {
  const [activeScreen, setActiveScreen] = useState("home");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const ActiveScreen = NAV.find(n => n.id === activeScreen)?.Screen ?? HomeScreen;

  return (
    <div style={{
      width: 390, height: 844,
      background: T.bg,
      borderRadius: 44,
      overflow: "hidden",
      display: "flex", flexDirection: "column",
      position: "relative",
      boxShadow: "0 30px 80px rgba(0,0,0,0.25), 0 0 0 10px #1a1a1a, 0 0 0 12px #333",
    }}>
      <StatusBar />
      <TopHeader activeScreen={activeScreen} onOpenSettings={() => setSettingsOpen(true)} />
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <ActiveScreen />
      </div>
      <BottomNav active={activeScreen} onSelect={setActiveScreen} />
      {settingsOpen && <SettingsSheet onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

// Auth-wrapped app component
function AuthenticatedApp() {
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d8e6f0 0%, #e8eff5 50%, #dde8f0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
        color: "#5A606B",
      }}>
        Loading...
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen />;
  }

  // Show main app if authenticated
  return (
    <AppProvider>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #d8e6f0 0%, #e8eff5 50%, #dde8f0 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "DM Sans, sans-serif",
      }}>
        <InnerApp />
      </div>
    </AppProvider>
  );
}

export default function App() {
  return <AuthenticatedApp />;
}
