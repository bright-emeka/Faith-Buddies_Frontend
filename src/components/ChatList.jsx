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
      avatarUrl: '',
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
    <div className="chat-list-container" style={{ padding: '0 0.5rem' }}>
      {chatItems.map((chat) => (
        <button
          key={chat.id}
          type="button"
          className={`chat-item-row ${chat.isAI ? 'ai-item' : ''}`}
          onClick={() => onSelectChat(chat.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '100%',
            padding: '0.85rem 1rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-xs)',
            marginBottom: '0.5rem',
            textAlign: 'left'
          }}
        >
          {/* Avatar Section */}
          <div className="avatar-wrapper" style={{ position: 'relative', marginRight: '0.75rem', flexShrink: 0 }}>
            {chat.avatarUrl || chat.isAI ? (
              <img
                src={chat.avatarUrl}
                alt={chat.name}
                className="messenger-avatar"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-full)',
                  objectFit: 'cover',
                  border: '2px solid var(--color-border)'
                }}
              />
            ) : (
              <div className="avatar-placeholder" style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--gradient-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                color: 'var(--color-text)',
                border: '2px solid var(--color-border)'
              }}>
                {chat.name.charAt(0)}
              </div>
            )}
            {/* Green dot for AI or active users */}
            {(chat.isAI || !chat.unread) && (
              <div className="online-status-dot" style={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 12,
                height: 12,
                backgroundColor: 'var(--color-success)',
                border: '2px solid var(--color-surface)',
                borderRadius: 'var(--radius-full)'
              }} />
            )}
          </div>

          {/* Content Section */}
          <div className="chat-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="chat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`chat-name ${chat.isAI ? 'ai-name' : ''}`} style={{
                fontWeight: 700,
                color: chat.isAI ? 'var(--color-primary)' : 'var(--color-text)',
                fontSize: '0.9rem'
              }}>
                {chat.name}
                {chat.isAI && (
                  <span className="ai-tag" style={{
                    marginLeft: '0.4rem',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    fontSize: '0.65rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.03em'
                  }}>AI</span>
                )}
              </span>
              <span className="chat-timestamp" style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {chat.time}
              </span>
            </div>

            <div className="chat-sub-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
              <p className="chat-last-message" style={{
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '85%'
              }}>
                {chat.lastMessage}
              </p>
              {chat.unread && (
                <div className="unread-indicator-dot" style={{
                  width: 10,
                  height: 10,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--gradient-primary)',
                  boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
                  flexShrink: 0
                }} />
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;