import {
  getFeed,
  getUserPosts,
  getPost,
  createPost,
  deletePost,
  toggleLike,
  checkLiked,
  addComment,
  getComments,
  deleteComment,
  toggleFollow,
  checkFollowing,
  getFollowers,
  getFollowing,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  searchUsers,
} from './firestore';
import { uploadFile } from './storage';

const sendMessage = async () => {
  throw new Error('AI chat is not available via Firestore. Use the chat services directly.');
};

const getChatHistory = async () => {
  throw new Error('Chat history is not available via Firestore. Use the chat services directly.');
};

export {
  sendMessage,
  getChatHistory,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  searchUsers,
  createPost,
  getFeed,
  getUserPosts,
  getPost,
  deletePost,
  toggleLike,
  checkLiked,
  addComment,
  getComments,
  deleteComment,
  toggleFollow,
  checkFollowing,
  getFollowers,
  getFollowing,
  uploadFile,
};