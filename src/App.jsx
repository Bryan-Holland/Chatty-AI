/*
 * FILE: App.jsx
 * PURPOSE: Root app - handles auth routing and screen navigation
 */

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import TestScreen from './screens/TestScreen';

export default function App() {
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');

  // Show loading state while checking auth
  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F5F7FA',
        fontFamily: 'DM Sans, sans-serif',
      }}>
        <p style={{ fontSize: '18px', color: '#5A606B' }}>Loading...</p>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return <LoginScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  // Handle screen navigation
  if (currentScreen === 'test') {
    return <TestScreen onBack={() => setCurrentScreen('home')} />;
  }

  // Show home screen by default
  return (
    <HomeScreen 
      user={user} 
      onSignOut={signOut}
      onNavigateToTest={() => setCurrentScreen('test')}
    />
  );
}
