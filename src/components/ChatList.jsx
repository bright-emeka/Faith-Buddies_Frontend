import React from 'react';

const ChatList = ({ chats = [], onSelectChat = () => {} }) => {
  // 1. Define the AI BUDDY as a persistent first entry
  const aiBuddy = {
    id: 'ai-buddy',
    name: 'AI BUDDY',
    lastMessage: "Ask me anything about your faith. I'm here to help!",
    time: 'Now',
    unread: false,
    isAI: true,
    avatarUrl: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png', 
  };

  const sampleChats = [
    {
      id: '1',
      name: 'Mary Johnson',
      lastMessage: 'I loved your last post about Faith Buddies.',
      time: '9:42 AM',
      unread: true,
      avatarUrl: '',
    },
    {
      id: '2',
      name: 'David Smith',
      lastMessage: 'Ready for Study sesh tonight?',
      time: 'Yesterday',
      unread: false,
      avatarUrl: 'https://media.licdn.com/dms/image/v2/D4D35AQHYcSUKD25rlg/profile-framedphoto-shrink_400_400/B4DZ2Qvh.kIEAc-/0/1776249872772?e=1778234400&v=beta&t=dqlS_qfF7OyhBCegIzMKZBZJLfXEPi3Jjwa2B_ZSs0I',
    },
     {
      id: '3',
      name: 'Mary micheal',
      lastMessage: 'I loved your last post about Faith Buddies.',
      time: '9:42 AM',
      unread: true,
      avatarUrl: '',
    },

   
  ];

  // 2. Combine and filter to ensure AI is at index 0 and not duplicated
  const currentChats = chats.length ? chats : sampleChats;
  const chatItems = [aiBuddy, ...currentChats.filter(c => c.id !== 'ai-buddy')];

  return (
    <div className="chat-list-container">
      {chatItems.map((chat) => (
        <button
          key={chat.id}
          type="button"
          className={`chat-item-row ${chat.isAI ? 'ai-item' : ''}`}
          onClick={() => onSelectChat(chat.id)}
        >
          {/* Avatar Section */}
          <div className="avatar-wrapper">
            {chat.avatarUrl || chat.isAI ? (
              <img 
                src={chat.avatarUrl} 
                alt={chat.name} 
                className="messenger-avatar" 
              />
            ) : (
              <div className="avatar-placeholder">
                {chat.name.charAt(0)}
              </div>
            )}
            {/* Green dot for AI or active users */}
            {(chat.isAI || !chat.unread) && <div className="online-status-dot" />}
          </div>

          {/* Content Section */}
          <div className="chat-body">
            <div className="chat-main-row">
              <span className={`chat-name ${chat.isAI ? 'ai-name' : ''}`}>
                {chat.name}
                {chat.isAI && <span className="ai-tag">AI</span>}
              </span>
              <span className="chat-timestamp">{chat.time}</span>
            </div>
            
            <div className="chat-sub-row">
              <p className="chat-last-message">
                {chat.lastMessage}
              </p>
              {chat.unread && <div className="unread-indicator-dot" />}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;