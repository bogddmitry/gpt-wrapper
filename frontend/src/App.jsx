import React, { useState, useEffect } from 'react';
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import { GoogleOAuthProvider } from '@react-oauth/google';

Amplify.configure(awsconfig);

function Chat({ user, setUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetch(`/api/chat/history?userId=${user.attributes.sub}`, {
        headers: { Authorization: `Bearer ${user.signInUserSession.idToken.jwtToken}` }
      })
        .then(res => res.json())
        .then(setMessages);
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.signInUserSession.idToken.jwtToken}`
      },
      body: JSON.stringify({ userId: user.attributes.sub, message: input })
    });
    setInput('');
  };

  const signOut = () => {
    Auth.signOut();
    setUser(null);
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>GPT Wrapper Chat</h2>
      <button onClick={signOut} style={{ float: 'right' }}>Sign Out</button>
      <div style={{ border: '1px solid #ccc', padding: 16, minHeight: 200, marginBottom: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: '8px 0' }}>
            <b>{msg.userId === user.attributes.sub ? 'You' : 'AI'}:</b> {msg.message}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1 }} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

function App() {
  const [jwt, setJwt] = useState(null);
  const [loading, setLoading] = useState(true);

  if (loading) return null;

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <Router>
        <Routes>
          <Route path="/login" element={!jwt ? <Login onLogin={setJwt} /> : <Navigate to="/" />} />
          <Route path="/" element={jwt ? <div>Logged in with Google! JWT: {jwt}</div> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App; 