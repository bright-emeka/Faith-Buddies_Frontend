import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserProfile,
  getCurrentUserProfile,
  createUserProfile,
  getUserPosts,
  getFollowers,
  getFollowing,
  checkFollowing,
  updateUserProfile,
  createPost,
} from "../services/api";
import { useAuth } from "../context/useAuth";
import Post from "../components/Post";
import { useTheme } from "../context/ThemeContext";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, logout, accessToken: rawAccessToken } = useAuth();
  const accessToken = rawAccessToken;
  const { isDarkMode, toggleTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    avatar: "",
    religion: "",
  });
  const [createPostModal, setCreatePostModal] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImage, setPostImage] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [avatarImage, setAvatarImage] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const isOwnProfile = user && user.uid === userId;

  const loadProfile = useCallback(async () => {
    if (!userId || userId === "undefined") {
      console.error(
        "Profile Error: userId is undefined. Check your Link tags or Routes.",
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // 1. For own profile, use /api/users/profile (authenticated endpoint)
      // For other profiles, use /api/users/{userId}
      let profileData;
      if (isOwnProfile) {
        profileData = await getCurrentUserProfile().catch(() => null);
        if (!profileData) {
          profileData = await getUserProfile(userId);
        }
      } else {
        profileData = await getUserProfile(userId);
      }
      setProfile(profileData);

      // 2. Run other fetches in parallel if the user profile exists
      const [userPosts, followersList, followingList] = await Promise.all([
        getUserPosts(userId).catch(() => []),
        getFollowers(userId).catch(() => []),
        getFollowing(userId).catch(() => []),
      ]);

      setPosts(userPosts || []);
      setFollowers(followersList || []);
      setFollowing(followingList || []);

      // 3. Check follow status if it's someone else's profile
      if (user && !isOwnProfile) {
        const result = await checkFollowing(userId).catch(() => null);
        setIsFollowing(result?.following || false);
      }
    } catch (error) {
      console.warn(
        "Profile not found or loaded with errors. Checking fallback initialization...",
        error.message,
      );

      // FALLBACK: If profile lookup fails (404), check if it's the current user's profile
      if (isOwnProfile) {
        console.log("Initializing brand new MongoDB profile document...");
        try {
          const fallbackProfile = await createUserProfile(user.uid, {
            name:
              user.displayName || user.email?.split("@")[0] || "New Believer",
            email: user.email,
            avatar: user.avatar || "",
            bio: "Faithful believer sharing wisdom and inspiration",
            religion: "Christian",
          });

          setProfile(fallbackProfile);
        } catch (creationError) {
          console.error(
            "Fatal: Failed to auto-initialize profile document:",
            creationError,
          );
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleFollow = async () => {
    try {
      if (!accessToken) {
        console.error('No access token found for follow request');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://faith-buddies-backend.onrender.com'}/api/follows/follow/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${rawAccessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || 'Failed to follow'
        );
      }

      const result = await response.json();

      // Backends vary: prefer `following` boolean if present.
      const nextFollowing =
        typeof result?.following === 'boolean'
          ? result.following
          : !isFollowing;

      setIsFollowing(nextFollowing);

      setProfile((prev) => ({
        ...prev,
        followersCount: nextFollowing
          ? (prev.followersCount || 0) + 1
          : Math.max((prev.followersCount || 0) - 1, 0),
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "",
        religion: profile.religion || "Christian",
      });
      setIsEditing(true);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateUserProfile(userId, editForm);
      setProfile((prev) => ({ ...prev, ...editForm }));
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      alert("Please enter some content for your post");
      return;
    }

    setIsPosting(true);
    try {
      const newPost = await createPost(postContent, postImage || null);
      setPosts([newPost, ...posts]);
      setPostContent("");
      setPostImage("");
      setCreatePostModal(false);
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPostImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploadingAvatar(true);
      try {
        const avatarUrl = URL.createObjectURL(e.target.files[0]);
        setAvatarImage(avatarUrl);

        await updateUserProfile(userId, { avatar: avatarUrl });
        setProfile((prev) => ({ ...prev, avatar: avatarUrl }));

        e.target.value = "";
      } catch (error) {
        console.error("Error updating avatar:", error);
        alert("Failed to update avatar. Please try again.");
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="error-container">
        <h2>User not found</h2>
        <p>
          We couldn't find a user with the ID: <strong>{userId}</strong>
        </p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-container">
          {isUploadingAvatar ? (
            <div className="profile-avatar-loader">
              <span className="spinner"></span>
              <p>Uploading...</p>
            </div>
          ) : (
            <img
              src={
                avatarImage ||
                profile.avatar ||
                "https://via.placeholder.com/150"
              }
              alt={profile.name}
              className="profile-avatar"
            />
          )}
          {isOwnProfile && (
            <label
              className="avatar-upload-label"
              onClick={() => document.getElementById("avatar-input").click()}
            >
              <input
                type="file"
                id="avatar-input"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <div className="avatar-upload-icon">+</div>
            </label>
          )}
        </div>
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <h3>Edit Your Profile</h3>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="text"
                  value={editForm.avatar}
                  onChange={(e) =>
                    setEditForm({ ...editForm, avatar: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Religion</label>
                <select
                  value={editForm.religion}
                  onChange={(e) =>
                    setEditForm({ ...editForm, religion: e.target.value })
                  }
                >
                  <option value="Christian">Christian</option>
                  <option value="Muslim">Muslim</option>
                  <option value="Jewish">Jewish</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddhist">Buddhist</option>
                  <option value="Sikh">Sikh</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSaveEdit}>
                  Save Changes
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1>{profile.name}</h1>
              <p className="religion-tag">{profile.religion}</p>
              <p className="profile-bio">{profile.bio || "No bio yet."}</p>
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-number">{posts.length}</span>
                  <span className="stat-label">Posts</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {profile.followersCount || 0}
                  </span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">
                    {profile.followingCount || 0}
                  </span>
                  <span className="stat-label">Following</span>
                </div>
              </div>
            </>
          )}

          <div className="profile-actions">
            {!isOwnProfile && (
              <button
                className={`follow-btn ${isFollowing ? "following" : ""}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
            {isOwnProfile && !isEditing && (
              <>
                <button className="edit-profile-btn" onClick={handleEdit}>
                  Edit Profile
                </button>
                <button
                  className="theme-toggle-btn"
                  onClick={toggleTheme}
                  title={
                    isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  {isDarkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === "posts" ? "active" : ""}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`tab ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => setActiveTab("followers")}
        >
          Followers
        </button>
        <button
          className={`tab ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "posts" && (
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-posts-state">
                <p>No posts yet</p>
                {isOwnProfile && (
                  <button
                    className="add-post-btn"
                    onClick={() => setCreatePostModal(true)}
                  >
                    +
                  </button>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <Post key={post.id || post._id} post={post} />
              ))
            )}
          </div>
        )}

        {createPostModal && (
          <div
            className="modal-backdrop"
            onClick={() => setCreatePostModal(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create New Post</h3>
                <button
                  className="modal-close-btn"
                  onClick={() => setCreatePostModal(false)}
                >
                  &times;
                </button>
              </div>
              <div className="modal-body">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  maxLength="500"
                />
                <div className="modal-image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <label>Add Image (optional)</label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel-btn"
                  onClick={() => {
                    setPostContent("");
                    setPostImage("");
                    setCreatePostModal(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="modal-post-btn"
                  onClick={handleCreatePost}
                  disabled={isPosting || !postContent.trim()}
                >
                  {isPosting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "followers" && (
          <div className="users-grid">
            {followers.length === 0 ? (
              <p>No followers yet</p>
            ) : (
              followers.map((f) => (
                <div
                  key={f.uid || f._id}
                  className="user-list-item"
                  onClick={() => navigate(`/profile/${f.uid || f._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={f.avatar || "https://via.placeholder.com/50"}
                    alt=""
                  />
                  <h4>{f.name}</h4>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "following" && (
          <div className="users-grid">
            {following.length === 0 ? (
              <p>Not following anyone yet</p>
            ) : (
              following.map((f) => (
                <div
                  key={f.uid || f._id}
                  className="user-list-item"
                  onClick={() => navigate(`/profile/${f.uid || f._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={f.avatar || "https://via.placeholder.com/50"}
                    alt=""
                  />
                  <h4>{f.name}</h4>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <div className="profile-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
