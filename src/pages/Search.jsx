import React, { useState, useEffect, useMemo } from 'react';

// Mock data moved outside the component to prevent recreation on every render cycle
// and fix the VS Code / ESLint "missing dependency" warning.
const MOCK_USERS = [
  {
    id: 1,
    name: 'John Doe',
    avatar: 'https://via.placeholder.com/50',
    bio: 'Software developer & Faith enthusiast',
    followersCount: 125,
    followingCount: 89
  },
  {
    id: 2,
    name: 'Jane Smith',
    avatar: 'https://via.placeholder.com/50',
    bio: 'Christian counselor & worship leader',
    followersCount: 200,
    followingCount: 150
  },
  {
    id: 3,
    name: 'Michael Johnson',
    avatar: 'https://via.placeholder.com/50',
    bio: 'Youth pastor & community builder',
    followersCount: 320,
    followingCount: 180
  },
  {
    id: 4,
    name: 'Sarah Williams',
    avatar: 'https://via.placeholder.com/50',
    bio: 'Bible study leader & prayer warrior',
    followersCount: 180,
    followingCount: 95
  },
  {
    id: 5,
    name: 'David Brown',
    avatar: 'https://via.placeholder.com/50',
    bio: 'Missionary & outreach coordinator',
    followersCount: 450,
    followingCount: 200
  }
];

const MOCK_POSTS = [
  {
    id: 1,
    content: 'Just had an amazing time at youth group tonight! Feeling blessed and grateful for our Faith Buddies community. #blessed #faith',
    author: {
      name: 'John Doe',
      avatar: 'https://via.placeholder.com/50'
    },
    likesCount: 45,
    commentsCount: 12,
    createdAt: '2026-05-15T10:30:00Z'
  },
  {
    id: 2,
    content: 'Started my morning with prayer and devotionals. Remember to cast all your anxieties on Him because He cares for you. 1 Peter 5:7',
    author: {
      name: 'Jane Smith',
      avatar: 'https://via.placeholder.com/50'
    },
    likesCount: 62,
    commentsCount: 8,
    createdAt: '2026-05-15T07:15:00Z'
  },
  {
    id: 3,
    content: 'Excited to announce our new community outreach program launching next month! Stay tuned for details on how you can get involved.',
    author: {
      name: 'Michael Johnson',
      avatar: 'https://via.placeholder.com/50'
    },
    likesCount: 78,
    commentsCount: 22,
    createdAt: '2026-05-14T16:45:00Z'
  },
  {
    id: 4,
    content: 'Sharing a powerful testimony from todays prayer meeting. God is truly faithful and His timing is perfect!',
    author: {
      name: 'Sarah Williams',
      avatar: 'https://via.placeholder.com/50'
    },
    likesCount: 53,
    commentsCount: 15,
    createdAt: '2026-05-14T09:20:00Z'
  },
  {
    id: 5,
    content: 'Just returned from a missions trip overseas. What an incredible experience seeing Gods work in different cultures!',
    author: {
      name: 'David Brown',
      avatar: 'https://via.placeholder.com/50'
    },
    likesCount: 91,
    commentsCount: 30,
    createdAt: '2026-05-13T14:10:00Z'
  }
];

const Search = ({ onUserClick }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce effect: updates debouncedQuery 300ms after user finishes typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);

  // Filter users based on debounced search query
  const filteredUsers = useMemo(() => {
    const cleanQuery = debouncedQuery.trim().toLowerCase();
    if (!cleanQuery) return [];

    return MOCK_USERS.filter(user =>
      user.name.toLowerCase().includes(cleanQuery) ||
      user.bio.toLowerCase().includes(cleanQuery)
    );
  }, [debouncedQuery]);

  // Filter posts based on debounced search query
  const filteredPosts = useMemo(() => {
    const cleanQuery = debouncedQuery.trim().toLowerCase();
    if (!cleanQuery) return [];

    return MOCK_POSTS.filter(post =>
      post.content.toLowerCase().includes(cleanQuery) ||
      post.author.name.toLowerCase().includes(cleanQuery)
    );
  }, [debouncedQuery]);

  return (
    <div className="search-container">
      <div className="search-header">
        <h1>Search</h1>
        <input
          type="text"
          placeholder="Search for users, posts, etc."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="search-results">
        {query.trim() === '' ? (
          <p className="search-placeholder">
            Enter a search term to find users, posts, and more across Faith Buddies
          </p>
        ) : (
          <>
            {(filteredUsers.length > 0 || filteredPosts.length > 0) ? (
              <>
                {/* Users Section */}
                {filteredUsers.length > 0 && (
                  <>
                    <h2>Users ({filteredUsers.length})</h2>
                    <div className="results-list">
                      {filteredUsers.map(user => (
                        <div key={user.id} className="user-result-item" onClick={() => onUserClick?.(user.id)} style={{ cursor: 'pointer' }}>
                          <img src={user.avatar} alt={`${user.name}'s avatar`} className="result-avatar" />
                          <div className="result-info">
                            <h3>{user.name}</h3>
                            <p className="result-bio">{user.bio}</p>
                            <div className="result-stats">
                              <span>{user.followersCount} followers</span>
                              <span>{user.followingCount} following</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Posts Section */}
                {filteredPosts.length > 0 && (
                  <>
                    <h2>Posts ({filteredPosts.length})</h2>
                    <div className="results-list">
                      {filteredPosts.map(post => (
                        <div key={post.id} className="post-result-item">
                          <div className="post-author">
                            <img src={post.author.avatar} alt={`${post.author.name}'s avatar`} className="post-avatar" />
                            <span className="post-author-name">{post.author.name}</span>
                          </div>
                          <p className="post-content">{post.content}</p>
                          <div className="post-stats">
                            <span>{post.likesCount} likes</span>
                            <span>{post.commentsCount} comments</span>
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              // If debounced processing is taking a split second, showing the fallback UI feels cleaner
              <p className="no-results">No results found for "{query}". Try a different search term.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Search;