// API service for backend communication
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://faith-buddies-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout to prevent hanging requests
});

// 🔒 GLOBAL REQUEST INTERCEPTOR: Automatically attaches Firebase Token dynamically
api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        // Automatically fetches the token (and auto-refreshes it if it expired)
        const token = await user.getIdToken();
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (authError) {
      console.warn('Could not attach Firebase Auth token to request:', authError);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Retry logic for failed requests
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      // Only retry on network errors or 5xx errors, not 4xx
      if (attempt === maxRetries || (error.response && error.response.status < 500)) {
        throw error;
      }
      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Send message to AI chat
export const sendMessage = async (message, userId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.post('/api/chat/message', {
        message,
        userId,
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

// Get chat history for user
export const getChatHistory = async (userId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/chat/history/${userId}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching chat history:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch chat history');
  }
};

// ===== USER ROUTES =====

// Create or get user profile
export const createUserProfile = async (userId, data) => {
  try {
    const response = await retryWithBackoff(() =>
      api.post('/api/users/profile', {
        ...data,
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error creating user profile:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to create user profile');
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/users/${userId}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch user profile');
  }
};

// Update user profile
export const updateUserProfile = async (userId, data) => {
  try {
    const response = await retryWithBackoff(() =>
      api.put(`/api/users/${userId}`, data)
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to update user profile');
  }
};

// Search users
export const searchUsers = async (query) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/users/search/${query}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to search users');
  }
};

// ===== POST ROUTES =====

// Create post
export const createPost = async (content, image) => {
  try {
    const response = await retryWithBackoff(() =>
      api.post('/api/posts', {
        content,
        image,
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to create post');
  }
};

// Get feed
export const getFeed = async (lastTimestamp) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get('/api/posts/feed', {
        params: { lastTimestamp },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching feed:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch feed');
  }
};

// Get user posts
export const getUserPosts = async (userId, lastTimestamp) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/posts/user/${userId}`, {
        params: { lastTimestamp },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user posts:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch user posts');
  }
};

// Get single post
export const getPost = async (postId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/posts/${postId}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching post:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch post');
  }
};

// Delete post
export const deletePost = async (postId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.delete(`/api/posts/${postId}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to delete post');
  }
};

// ===== INTERACTIONS ROUTES =====

// Toggle like on post
export const toggleLike = async (postId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.post(`/api/interactions/${postId}/like`)
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to toggle like');
  }
};

// Check if post is liked
export const checkLiked = async (postId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/interactions/${postId}/liked`)
    );
    return response.data;
  } catch (error) {
    console.error('Error checking like status:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to check like status');
  }
};

// Add comment
export const addComment = async (postId, content) => {
  try {
    const response = await retryWithBackoff(() =>
      api.post(`/api/interactions/${postId}/comments`, {
        content,
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to add comment');
  }
};

// Get comments
export const getComments = async (postId, lastTimestamp) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/interactions/${postId}/comments`, {
        params: { lastTimestamp },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching comments:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch comments');
  }
};

// Delete comment
export const deleteComment = async (postId, commentId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.delete(`/api/interactions/${postId}/comments/${commentId}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to delete comment');
  }
};

// ===== FOLLOWS ROUTES =====

// Toggle follow
export const toggleFollow = async (targetUserId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.post(`/api/follows/${targetUserId}/follow`)
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling follow:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to toggle follow');
  }
};

// Check if following
export const checkFollowing = async (targetUserId) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/follows/status/${targetUserId}/following`)
    );
    return response.data;
  } catch (error) {
    console.error('Error checking follow status:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to check follow status');
  }
};

// Get followers
export const getFollowers = async (userId, limit = 50) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/follows/${userId}/followers`, {
        params: { limit },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching followers:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch followers');
  }
};

// Get following
export const getFollowing = async (userId, limit = 50) => {
  try {
    const response = await retryWithBackoff(() =>
      api.get(`/api/follows/${userId}/following`, {
        params: { limit },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching following:', error.message || error);
    throw new Error(error.response?.data?.error || 'Failed to fetch following');
  }
};

export default api;