import React, { useState, useEffect } from "react";

import { useParams, useNavigate } from "react-router-dom";
import {
  createUserProfile,
  getCurrentUserProfile,
  getUserProfile,
  getUserPosts,
  getFollowers,
  getFollowing,
  updateUserProfile,
  createPost,
} from "../services/api";
import { useAuth } from "../context/useAuth";
import Post from "../components/Post";
import { useTheme } from "../context/ThemeContext";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://faith-buddies-backend.onrender.com";

const Profile = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  const isOwnProfile = user && user.uid === uid;

  const currentUserUid = user?.uid;

  const computeIsFollowingFromFollowers = (followersList) => {
    if (!currentUserUid) return false;
    if (!Array.isArray(followersList)) return false;

    // Backend followers shape can be [{ uid, ... }] or [{ _id, ... }]
    return followersList.some((f) => (f?.uid || f?._id) === currentUserUid);
  };

  const refreshFollowers = async (targetUid) => {
    const followersList = await getFollowers(targetUid).catch(() => []);
    setFollowers(followersList || []);
    setIsFollowing(computeIsFollowingFromFollowers(followersList || []));
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!uid || uid === "undefined") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        let profileData = null;

        try {
          profileData = isOwnProfile
            ? await getCurrentUserProfile()
            : await getUserProfile(uid);
        } catch {
          profileData = null;
        }

        if (!profileData && isOwnProfile && user) {
          try {
            profileData = await createUserProfile(user.uid, {
              name:
                user.displayName || user.email?.split("@")[0] || "New Believer",
              email: user.email,
              avatar: user.avatar || "",
              bio: "Faithful believer sharing wisdom and inspiration",
              religion: "Christian",
            });
          } catch {
            profileData = null;
          }
        }

        if (cancelled) return;
        setProfile(profileData);

        // 2) Fetch posts + followers + following
        const [userPosts, followersList, followingList] = await Promise.all([
          getUserPosts(uid).catch(() => []),
          getFollowers(uid).catch(() => []),
          getFollowing(uid).catch(() => []),
        ]);

        if (cancelled) return;
        setPosts(userPosts || []);
        setFollowers(followersList || []);
        setFollowing(followingList || []);

        // 3) Follow state based on whether currentUser is in followers list
        if (!isOwnProfile) {
          const next = computeIsFollowingFromFollowers(followersList || []);
          setIsFollowing(next);
        } else {
          setIsFollowing(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [uid, isOwnProfile, user, computeIsFollowingFromFollowers]);

  const handleFollow = async () => {
    if (!uid || uid === "undefined") return;
    if (isOwnProfile) return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found for follow request");
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/follows/follow/${uid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error || "Failed to follow"
        );
      }

      // Re-check followers list and recompute button state
      await refreshFollowers(uid);

      // Optional: update visible counts if profile has them
      setProfile((prev) => {
        if (!prev) return prev;
        const followersCount = (Array.isArray(followers) ? followers.length : 0) + 0; // recomputed from refetch
        return {
          ...prev,
          followersCount,
        };
      });
    } catch (err) {
      console.error("Error following user:", err);
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
      await updateUserProfile(uid, editForm);
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

        await updateUserProfile(uid, { avatar: avatarUrl });
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

  const errorUi = (
    <div className="error-container">
      <h2>User not found</h2>
      <p>
        We couldn't find a user with the ID: <strong>{uid}</strong>
      </p>
      <button onClick={() => navigate("/" )}>Go Home</button>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return errorUi;
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
              src={avatarImage || profile.avatar || "https://via.placeholder.com/150"}
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
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
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
                  <span className="stat-number">{profile.followersCount || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{profile.followingCount || 0}</span>
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
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
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

