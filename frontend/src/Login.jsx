import React from 'react';
import { Auth } from 'aws-amplify';

const loginContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
};

const card = {
  background: '#fff',
  padding: '2rem 3rem',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  textAlign: 'center',
};

const googleBtn = {
  marginTop: '1.5rem',
  padding: '0.75rem 2rem',
  fontSize: '1.1rem',
  borderRadius: '6px',
  border: 'none',
  background: '#4285F4',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  boxShadow: '0 2px 8px rgba(66,133,244,0.15)',
  transition: 'background 0.2s',
};

function Login() {
  const signIn = () => {
    Auth.federatedSignIn({ provider: 'Google' });
  };

  return (
    <div style={loginContainer}>
      <div style={card}>
        <h2>Welcome to GPT Wrapper</h2>
        <p>Sign in to continue</p>
        <button style={googleBtn} onClick={signIn}>
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 22, marginRight: 12, verticalAlign: 'middle' }} />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login; 