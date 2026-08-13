import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import Chat from './Chat';

// Removed the email prop entirely if the Hub doesn't need it
const ChatHub = () => { 
  const [selectedChatId, setSelectedChatId] = useState(null);

  if (!selectedChatId) {
    return (
      <div className="chat-hub-container">
        <div className="chat-hub-header" style={{
          padding: '1.5rem 2rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Messages
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Connect with your faith community
            </p>
          </div>
        </div>
        <ChatList onSelectChat={(id) => setSelectedChatId(id)} />
      </div>
    );
  }

  return (
    <Chat 
      selectedChatId={selectedChatId} 
      onBack={() => setSelectedChatId(null)} 
    />
  );
};

export default ChatHub;