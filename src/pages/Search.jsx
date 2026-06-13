import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../services/api';

const Search = ({ onUserClick }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const fetchUsers = async () => {
      const cleanQuery = debouncedQuery.trim();
      if (!cleanQuery) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchUsers(cleanQuery);
        setUsers(results.users || results || []);
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [debouncedQuery]);

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Search</h1>
        <input
          type="text"
          placeholder="Search for users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="search-results">
        {query.trim() === '' ? (
          <p className="search-placeholder">
            Enter a search term to find users across Faith Buddies
          </p>
        ) : loading ? (
          <div className="loading">Searching...</div>
        ) : users.length === 0 ? (
          <p className="no-results">No results found for "{query}". Try a different search term.</p>
        ) : (
          <div className="results-list">
            <h2>Users ({users.length})</h2>
            {users.map((user) => {
              const uid = user.uid || user.id;
              return (
                <Link
                  key={uid}
                  to={`/profile/${uid}`}
                  className="user-result-item"
                  onClick={() => onUserClick?.(uid)}
                  style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                >
                  <img
                    src={user.avatar || 'https://via.placeholder.com/50'}
                    alt={`${user.name}'s avatar`}
                    className="result-avatar"
                  />
                  <div className="result-info">
                    <h3>{user.name}</h3>
                    <p className="result-bio">{user.bio || 'No bio yet'}</p>
                    <div className="result-stats">
                      <span>{user.followersCount || 0} followers</span>
                      <span>{user.followingCount || 0} following</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;