import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

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

function Login({ onLogin }) {
  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (res.ok) {
      const data = await res.json();
      // Store JWT or call onLogin
      if (onLogin) onLogin(data.jwt);
    } else {
      alert('Google authentication failed');
    }
  };

  return (
    <div style={loginContainer}>
      <div style={card}>
        <h2>Welcome to GPT Wrapper</h2>
        <p>Sign in to continue</p>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert('Google Login Failed')}
        />
      </div>
    </div>
  );
}

export default Login; 