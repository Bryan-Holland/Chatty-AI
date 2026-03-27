/*
 * FILE: components/Button.jsx
 * PURPOSE: Reusable button component
 */

export default function Button({ children, onClick, variant = 'primary' }) {
  const styles = {
    primary: {
      padding: '16px 32px',
      background: '#10B981',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      fontFamily: 'DM Sans, sans-serif',
    },
    secondary: {
      padding: '12px 24px',
      background: 'transparent',
      color: '#10B981',
      border: '1px solid #10B981',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      fontFamily: 'DM Sans, sans-serif',
    }
  };

  return (
    <button onClick={onClick} style={styles[variant]}>
      {children}
    </button>
  );
}
