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

function Login() {
  const handleCognitoLogin = () => {
    Auth.federatedSignIn({ provider: 'Google' });
  };

  return (
    <div style={loginContainer}>
      <div style={card}>
        <h2>Welcome to GPT Wrapper</h2>
        <p>Sign in to continue</p>
        <button onClick={handleCognitoLogin} style={{ padding: '0.5rem 2rem', fontSize: 18 }}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login; 