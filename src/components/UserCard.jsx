// UserCard component - displays user profile card with follow button
import React, { useState, useEffect } from 'react';
import { toggleFollow, checkFollowing } from '../services/api';
import { auth } from '../services/firebase';

const UserCard = ({ user, onUserClick }) => {
  const [following, setFollowing] = useState(false);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const checkStatus = async () => {
      if (currentUser && currentUser.uid !== user.uid) {
        try {
          const result = await checkFollowing(user.uid);
          setFollowing(result.following);
        } catch (error) {
          console.error('Error checking follow status:', error);
        }
      }
    };

    checkStatus();
  }, [user.uid, currentUser]);

  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      const result = await toggleFollow(user.uid);
      setFollowing(result.following);
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  return (
    <div className="user-card" onClick={() => onUserClick(user.uid)}>
      <img src={user.avatar} alt={user.name} className="user-card-avatar" />
      <h3>{user.name}</h3>
      <p className="user-card-bio">{user.bio || 'No bio yet'}</p>
      <div className="user-card-stats">
        <span>{user.followersCount || 0} followers</span>
        <span>{user.postsCount || 0} posts</span>
      </div>
      {currentUser && currentUser.uid !== user.uid && (
        <button className={`follow-btn ${following ? 'following' : ''}`} onClick={handleFollow}>
          {following ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};

export default UserCard;
