/*
 * FILE: screens/HomeScreen.jsx
 * PURPOSE: Main home screen - authenticated view
 */

import Button from '../components/Button';

export default function HomeScreen({ user, onSignOut, onNavigateToTest }) {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F5F7FA',
      fontFamily: 'DM Sans, sans-serif',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '48px', color: '#1A1D23', marginBottom: '16px' }}>
        Chatty AI
      </h1>
      
      <p style={{ fontSize: '18px', color: '#5A606B', marginBottom: '8px' }}>
        Welcome back!
      </p>

      <p style={{ fontSize: '14px', color: '#8A909B', marginBottom: '40px' }}>
        {user?.email}
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
        <Button variant="primary" onClick={onNavigateToTest}>
          Go to Test Screen
        </Button>
      </div>

      <Button variant="secondary" onClick={onSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
