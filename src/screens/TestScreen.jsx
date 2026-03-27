/*
 * FILE: screens/TestScreen.jsx
 * PURPOSE: Test screen for component verification
 */

import Button from '../components/Button';

export default function TestScreen({ onBack }) {
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
        Test Screen
      </h1>
      
      <p style={{ fontSize: '18px', color: '#5A606B', marginBottom: '40px' }}>
        Testing the Button component
      </p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
        <Button variant="primary">Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
      </div>

      <Button variant="secondary" onClick={onBack}>
        Back to Home
      </Button>
    </div>
  );
}
