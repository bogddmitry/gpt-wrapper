import React, { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';

Amplify.configure(awsconfig);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check for Cognito session and fetch user info from backend
    const checkUser = async () => {
      try {
        const session = await Auth.currentSession();
        const jwt = session.getIdToken().getJwtToken();
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${jwt}` }
        });
        if (res.ok) {
          const userInfo = await res.json();
          setUser({ ...userInfo, jwt });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <div>Welcome, {user.email || user.sub}!</div> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App; 