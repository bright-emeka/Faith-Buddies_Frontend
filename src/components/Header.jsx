// Header component with app name and navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ userId, onUserClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/profile') {
      return location.pathname.startsWith('/profile');
    }
    return location.pathname === path;
  };

  return (
    <header className="app-header">
      <div className="brand-bar">
        <div className="brand-title" onClick={() => navigate('/')}>
          Faith Buddies
        </div>
      </div>

      <div className="nav-bar">
        <div className="nav-items">
          <button
            type="button"
            className={`nav-item ${isActive('/feed') ? 'active' : ''}`}
            onClick={() => navigate('/feed')}
            title="Feed"
          >
            <span className="icon">📰</span>
            <span>Feed</span>
          </button>

          <button
            type="button"
            className={`nav-item ${isActive('/chat') ? 'active' : ''}`}
            onClick={() => navigate('/chat')}
            title="Messages"
          >
            <span className="icon">💬</span>
            <span>Chat</span>
          </button>

          <button
            type="button"
            className={`nav-item ${isActive('/notifications') ? 'active' : ''}`}
            onClick={() => navigate('/notifications')}
            title="Notifications"
          >
            <span className="icon">🔔</span>
            <span>Alerts</span>
          </button>

          <button
            type="button"
            className={`nav-item ${isActive('/search') ? 'active' : ''}`}
            onClick={() => navigate('/search')}
            title="Search"
          >
            <span className="icon">🔍</span>
            <span>Search</span>
          </button>

          <button
            type="button"
            className={`nav-item ${isActive('/groups') ? 'active' : ''}`}
            onClick={() => navigate('/groups')}
            title="Groups"
          >
            <span className="icon">👥</span>
            <span>Groups</span>
          </button>

          <button
            type="button"
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => onUserClick(userId)}
            title="Profile"
          >
            <span className="icon">👤</span>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
