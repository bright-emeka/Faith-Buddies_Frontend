import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, getChatHistory, setAuthToken } from '../services/api';
import { auth } from '../services/firebase';

const Chat = ({ onBack, selectedChatId }) => { 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize auth token and load chat history
  useEffect(() => {
    const initChat = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const token = await user.getIdToken();
        setAuthToken(token);

        // LOGIC: If it's NOT the AI Buddy, fetch history from the database
        if (selectedChatId && selectedChatId !== 'ai-buddy') {
          const history = await getChatHistory(user.uid);
          setMessages(history.messages || []);
        } else {
          // If it's AI BUDDY, we start with a welcome message
          setMessages([
            {
              role: 'assistant',
              content: "Peace be with you! I am AI BUDDY. How can I help you with your faith today?",
              timestamp: new Date().toISOString(),
            }
          ]);
        }
      } catch (err) {
        // Renaming to 'err' and logging it clears the "unused variable" error
        console.error('Initialization error:', err);
      }
    };

    initChat();
  }, [selectedChatId]); // Refetch if the chat target changes

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const user = auth.currentUser;
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
    <div className="chat-interface-wrapper">
      {/* Header Section */}
      <div className="chat-active-header">
        <button onClick={onBack} className="back-arrow" type="button">←</button>
        <div className="header-user-info">
          <img 
            src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
            alt="AI" 
            className="small-avatar" 
          />
          <div className="header-text">
            <span className="chat-header-name">AI BUDDY</span>
            <span className="online-status">Online</span>
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
             <div className="text-content">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <form className="chat-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" className="send-icon-btn" disabled={loading || !input.trim()}>
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat;