import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import Chat from './Chat';

// Removed the email prop entirely if the Hub doesn't need it
const ChatHub = () => { 
  const [selectedChatId, setSelectedChatId] = useState(null);

  if (!selectedChatId) {
    return (
      <div className="chat-hub-container">
        <div className="chat-hub-header">
          <h2>Messages</h2>
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