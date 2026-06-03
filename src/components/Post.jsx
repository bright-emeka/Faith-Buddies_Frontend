// Post component - displays individual post with interactions
import React, { useState, useEffect } from 'react';
import { toggleLike, checkLiked, toggleFollow, checkFollowing } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Post = ({ post, onDelete, onUserClick }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (user && user.uid !== post.userId) {
        try {
          const likeStatus = await checkLiked(post.id);
          setLiked(likeStatus.liked);

          const followStatus = await checkFollowing(post.userId);
          setFollowing(followStatus.following);
        } catch (error) {
          console.error('Error checking post status:', error);
        }
      }
    };

    checkStatus();
  }, [post.id, post.userId, user]);

  const handleLike = async () => {
    try {
      const result = await toggleLike(post.id);
      setLiked(result.liked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleFollow = async () => {
    try {
      const result = await toggleFollow(post.userId);
      setFollowing(result.following);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info" onClick={() => onUserClick?.(post.userId)} style={{ cursor: 'pointer' }}>
          <img src={post.author?.avatar} alt="avatar" className="post-avatar" />
          <div>
            <h4>{post.author?.name || 'User'}</h4>
            <p className="post-date">{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        {user && user.uid !== post.userId && (
          <button className={`follow-btn ${following ? 'following' : ''}`} onClick={handleFollow}>
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </div>

      <div className="post-content">{post.content}</div>

      {post.image && <img src={post.image} alt="post" className="post-image" />}

      <div className="post-stats">
        <span>{post.likesCount || 0} likes</span>
        <span>{post.commentsCount || 0} comments</span>
      </div>

      <div className="post-actions">
        <button className={`action-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          ❤️ Like
        </button>
        <button className="action-btn" onClick={() => setShowComments(!showComments)}>
          💬 Comment
        </button>
        <button className="action-btn">↗️ Share</button>
        {user && user.uid === post.userId && (
          <button className="action-btn delete-btn" onClick={() => onDelete(post.id)}>
            🗑️ Delete
          </button>
        )}
      </div>

      {showComments && <div className="post-comments">Comments will load here</div>}
    </div>
  );
};

export default Post;