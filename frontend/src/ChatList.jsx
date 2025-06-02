import React, { useEffect, useState } from 'react';

const layoutStyle = {
  display: 'flex',
  height: '80vh',
  maxWidth: '900px',
  margin: '40px auto',
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  overflow: 'hidden',
};

const sidebarStyle = {
  width: '280px',
  background: '#f5f7fa',
  borderRight: '1px solid #e0e7ef',
  display: 'flex',
  flexDirection: 'column',
  padding: '1.5rem 0',
};

const chatListStyle = {
  flex: 1,
  overflowY: 'auto',
};

const chatItemStyle = (active) => ({
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #e0e7ef',
  cursor: 'pointer',
  background: active ? '#e0e7ef' : 'none',
  textAlign: 'left',
  fontWeight: active ? 700 : 400,
});

const newChatBtnStyle = {
  margin: '0 1.5rem 1rem 1.5rem',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
};

const mainAreaStyle = {
  flex: 1,
  padding: '2rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const messagesContainerStyle = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  background: '#f8fafc',
  borderRadius: '10px',
  padding: '2rem',
  minHeight: '300px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

const messageItemStyle = {
  marginBottom: '1.2rem',
  paddingBottom: '0.7rem',
  borderBottom: '1px solid #e0e7ef',
};

const inputContainerStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginTop: '1.5rem',
};
const inputStyle = {
  flex: 1,
  padding: '0.7rem 1rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: 16,
};
const sendBtnStyle = {
  padding: '0.7rem 1.5rem',
  borderRadius: '8px',
  border: 'none',
  background: '#2563eb',
  color: '#fff',
  fontWeight: 600,
  fontSize: 16,
  cursor: 'pointer',
};

function ChatList({ user }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`/api/chat/list?userId=${user.sub}`, {
          headers: { Authorization: `Bearer ${user.jwt}` },
        });
        if (!res.ok) throw new Error('Failed to fetch chats');
        const data = await res.json();
        setChats(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchChats();
  }, [user, creatingChat]);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      setMessagesError(null);
      return;
    }
    const fetchMessages = async () => {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const res = await fetch(`/api/chat/messages?userId=${user.sub}&chatId=${selectedChatId}`, {
          headers: { Authorization: `Bearer ${user.jwt}` },
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        setMessagesError(err.message);
      }
      setMessagesLoading(false);
    };
    fetchMessages();
  }, [selectedChatId, user]);

  const handleNewChat = async () => {
    setCreatingChat(true);
    try {
      const res = await fetch('/api/chat/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({ userId: user.sub }),
      });
      if (!res.ok) throw new Error('Failed to create chat');
      const newChat = await res.json();
      setChats((prev) => [newChat, ...prev]);
      setSelectedChatId(newChat.id);
    } catch (err) {
      alert('Error creating chat: ' + err.message);
    }
    setCreatingChat(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChatId) return;
    setSending(true);
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.jwt}`,
        },
        body: JSON.stringify({ userId: user.sub, chatId: selectedChatId, message: newMessage }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      setNewMessage("");
      // Refresh messages
      const msgRes = await fetch(`/api/chat/messages?userId=${user.sub}&chatId=${selectedChatId}`, {
        headers: { Authorization: `Bearer ${user.jwt}` },
      });
      if (msgRes.ok) {
        const data = await msgRes.json();
        setMessages(data);
      }
    } catch (err) {
      alert('Error sending message: ' + err.message);
    }
    setSending(false);
  };

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <button style={newChatBtnStyle} onClick={handleNewChat}>+ New Chat</button>
        <div style={chatListStyle}>
          <h3 style={{margin: '0 0 1rem 1.5rem', fontWeight: 600}}>Your Chats</h3>
          {loading ? (
            <div style={{padding: '1rem 1.5rem'}}>Loading...</div>
          ) : error ? (
            <div style={{padding: '1rem 1.5rem', color: 'red'}}>Error: {error}</div>
          ) : chats.length === 0 ? (
            <div style={{padding: '1rem 1.5rem'}}>No chats found.</div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                style={chatItemStyle(selectedChatId === chat.id)}
                onClick={() => setSelectedChatId(chat.id)}
              >
                <strong>{chat.title || 'Untitled Chat'}</strong>
                <div style={{fontSize: 12, color: '#888', marginTop: 2}}>
                  {chat.lastModified ? `Last modified: ${new Date(chat.lastModified).toLocaleString()}` : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
      <main style={mainAreaStyle}>
        {!selectedChatId ? (
          <div style={{textAlign: 'center', color: '#888'}}>
            <h2>Що у вас сьогодні на думці?</h2>
            <p>Виберіть чат або почніть новий.</p>
          </div>
        ) : (
          <div style={messagesContainerStyle}>
            {messagesLoading ? (
              <div>Loading messages...</div>
            ) : messagesError ? (
              <div style={{color: 'red'}}>Error: {messagesError}</div>
            ) : messages.length === 0 ? (
              <div>No messages in this chat yet.</div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={messageItemStyle}>
                  <div style={{fontWeight: 600, color: msg.senderId === user.sub ? '#2563eb' : '#111'}}>
                    {msg.senderId === user.sub ? 'You' : msg.senderId}
                  </div>
                  <div>{msg.content}</div>
                  <div style={{fontSize: 11, color: '#888', marginTop: 2}}>
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}
                  </div>
                </div>
              ))
            )}
            <form style={inputContainerStyle} onSubmit={handleSendMessage}>
              <input
                style={inputStyle}
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                disabled={sending}
                autoFocus
              />
              <button style={sendBtnStyle} type="submit" disabled={sending || !newMessage.trim()}>
                Send
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default ChatList; 