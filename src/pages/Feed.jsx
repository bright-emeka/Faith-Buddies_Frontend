// Feed page - displays posts from followed users
import React, { useState, useEffect } from 'react';
import { getFeed, deletePost } from '../services/api';
import Post from '../components/Post';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const feedPosts = await getFeed();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        setPosts(posts.filter((p) => p.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleUserClick = (userId) => {
    window.location.href = `/profile/${userId}`;
  };

  if (loading) {
    return <div className="loading">Loading feed...</div>;
  }

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Feed</h1>
        <button onClick={loadFeed} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="posts-list">
        {posts.length === 0 ? (
          <div className="empty-state">
            <p>No posts yet. Follow users to see their posts!</p>
          </div>
        ) : (
          posts.map((post) => <Post key={post.id} post={post} onDelete={handleDeletePost} onUserClick={handleUserClick} />)
        )}
      </div>
    </div>
  );
};

export default Feed;
