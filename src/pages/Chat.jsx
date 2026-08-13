import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getChatHistory } from '../services/api';
import { useAuth } from '../context/useAuth';

const Chat = ({ onBack, selectedChatId }) => { 
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        if (!user) return;

        if (selectedChatId && selectedChatId !== 'ai-buddy') {
          const history = await getChatHistory(user.uid);
          setMessages(history.messages || []);
        } else {
          setMessages([
            {
              role: 'assistant',
              content: "Peace be with you! I am AI BUDDY. How can I help you with your faith today?",
              timestamp: new Date().toISOString(),
            }
          ]);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initChat();
  }, [selectedChatId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!user) return;

    const userMessage = { 
      role: 'user', 
      content: input, 
      timestamp: new Date().toISOString() 
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send message to your backend (AI processing)
      const response = await sendMessage(input, user.uid);

      const aiMessage = { 
        role: 'assistant', 
        content: response.message, 
        timestamp: new Date().toISOString() 
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Message error:', err);
      setMessages((prev) => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I hit a snag. Please try again.', 
          timestamp: new Date().toISOString() 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Header Section */}
      <div className="chat-active-header" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 2rem',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <button onClick={onBack} className="back-arrow" type="button" style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-sm)',
          transition: 'all var(--transition-fast)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36
        }}
        onMouseEnter={(e) => {
          e.target.style.color = 'var(--color-primary)';
          e.target.style.background = 'var(--color-border-light)';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = 'var(--color-text-secondary)';
          e.target.style.background = 'none';
        }}
        >←</button>
        <div className="header-user-info" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-full)',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            ✨
          </div>
          <div className="header-text">
            <div className="chat-header-name" style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>
              AI BUDDY
            </div>
            <div className="online-status" style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 500 }}>
              ● Online
            </div>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
            {msg.role !== 'user' && (
              <div className="message-badge">✨</div>
            )}
            <div className={`message-bubble ${msg.role === 'user' ? 'user' : 'ai'}`} style={{
              background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--color-surface)',
              color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
              border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
              borderRadius: msg.role === 'user' ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
              padding: '0.85rem 1.25rem',
              maxWidth: '70%',
              boxShadow: msg.role === 'user' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              lineHeight: 1.6,
              fontSize: '0.95rem'
            }}>
              <div className="text-content">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="message-badge" style={{ background: 'var(--gradient-warm)' }}>🙏</div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <form className="chat-input-form" onSubmit={handleSendMessage} style={{
        display: 'flex',
        gap: '1rem',
        padding: '1.25rem 2rem',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          className="chat-input"
          style={{
            flex: 1,
            padding: '0.85rem 1.25rem',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.95rem',
            transition: 'all var(--transition-fast)',
            background: 'var(--color-bg)'
          }}
        />
        <button type="submit" className="send-icon-btn" disabled={loading || !input.trim()} style={{
          padding: '0.85rem 2rem',
          background: 'var(--gradient-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.95rem',
          fontWeight: 700,
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          boxShadow: 'var(--shadow-md)',
          whiteSpace: 'nowrap'
        }}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;