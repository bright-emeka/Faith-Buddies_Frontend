// Discover page - shows suggested users and trending posts
import React, { useState } from 'react';
import { searchUsers } from '../services/api';
import UserCard from '../components/UserCard';

const Discover = ({ onUserClick }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchUsers(query);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <div className="discover-container">
      <div className="discover-header">
        <h1>Discover</h1>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={handleInputChange}
          className="search-input"
        />
      </div>

      {loading && <div className="loading">Searching...</div>}

      {!loading && users.length === 0 && searchQuery && (
        <div className="empty-state">
          <p>No users found for "{searchQuery}"</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="users-grid">
          {users.map((user) => (
            <UserCard
              key={user.uid}
              user={user}
              onUserClick={onUserClick}
            />
          ))}
        </div>
      )}

      {!searchQuery && (
        <div className="empty-state">
          <p>Search for users to discover the community</p>
        </div>
      )}
    </div>
  );
};

export default Discover;
