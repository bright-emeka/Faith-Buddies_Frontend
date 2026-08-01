import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase';

const usersCol = collection(db, 'users');
const postsCol = collection(db, 'posts');
const commentsCol = collection(db, 'comments');
const followsCol = collection(db, 'follows');
const likesCol = collection(db, 'likes');
const messagesCol = collection(db, 'messages');
const notificationsCol = collection(db, 'notifications');

export async function getUserProfile(uid) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function createUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await setDoc(ref, { uid, ...data, createdAt: serverTimestamp() }, { merge: true });
  return { uid, ...data };
}

export async function updateUserProfile(uid, data) {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  const snap = await getDoc(ref);
  return snap.exists() ? { uid, ...snap.data() } : null;
}

export async function searchUsers(query) {
  if (!query || !query.trim()) return [];
  const q = query(usersCol, where('name', '>=', query.trim()), where('name', '<=', query.trim() + '\uf8ff'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
}

export async function getFeed() {
  const q = query(postsCol, orderBy('createdAt', 'desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getUserPosts(uid) {
  const q = query(postsCol, where('userId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPost(postId) {
  const ref = doc(db, 'posts', postId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createPost(userId, content, imageUrl) {
  const ref = await addDoc(postsCol, {
    userId,
    content,
    imageUrl: imageUrl || null,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, userId, content, imageUrl: imageUrl || null, likesCount: 0, commentsCount: 0 };
}

export async function deletePost(postId) {
  const ref = doc(db, 'posts', postId);
  await deleteDoc(ref);
  return { id: postId };
}

export async function toggleLike(postId, userId) {
  const likeRef = doc(db, 'likes', `${postId}_${userId}`);
  const snap = await getDoc(likeRef);
  if (snap.exists()) {
    await deleteDoc(likeRef);
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    const current = postSnap.exists() ? (postSnap.data().likesCount || 0) : 0;
    await updateDoc(postRef, { likesCount: Math.max(0, current - 1) });
    return { liked: false };
  } else {
    await setDoc(likeRef, { postId, userId, createdAt: serverTimestamp() });
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    const current = postSnap.exists() ? (postSnap.data().likesCount || 0) : 0;
    await updateDoc(postRef, { likesCount: current + 1 });
    return { liked: true };
  }
}

export async function checkLiked(postId, userId) {
  const ref = doc(db, 'likes', `${postId}_${userId}`);
  const snap = await getDoc(ref);
  return { liked: snap.exists() };
}

export async function getComments(postId) {
  const q = query(
    commentsCol,
    where('postId', '==', postId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addComment(postId, userId, content) {
  const ref = await addDoc(commentsCol, {
    postId,
    userId,
    content,
    createdAt: serverTimestamp(),
  });
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  const current = postSnap.exists() ? (postSnap.data().commentsCount || 0) : 0;
  await updateDoc(postRef, { commentsCount: current + 1 });
  return { id: ref.id, postId, userId, content, createdAt: new Date().toISOString() };
}

export async function deleteComment(postId, commentId) {
  const ref = doc(db, 'comments', commentId);
  await deleteDoc(ref);
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  const current = postSnap.exists() ? (postSnap.data().commentsCount || 0) : 0;
  await updateDoc(postRef, { commentsCount: Math.max(0, current - 1) });
  return { id: commentId };
}

export async function toggleFollow(followerUid, targetUid) {
  const followRef = doc(db, 'follows', `${followerUid}_${targetUid}`);
  const snap = await getDoc(followRef);
  if (snap.exists()) {
    await deleteDoc(followRef);
    return { following: false };
  } else {
    await setDoc(followRef, { followerUid, targetUid, createdAt: serverTimestamp() });
    return { following: true };
  }
}

export async function checkFollowing(followerUid, targetUid) {
  const ref = doc(db, 'follows', `${followerUid}_${targetUid}`);
  const snap = await getDoc(ref);
  return { following: snap.exists() };
}

export async function getFollowers(userId) {
  const q = query(followsCol, where('targetUid', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFollowing(userId) {
  const q = query(followsCol, where('followerUid', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function subscribeToFeed(onUpdate) {
  const q = query(postsCol, orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToPostComments(postId, onUpdate) {
  const q = query(
    commentsCol,
    where('postId', '==', postId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToPostLikes(postId, onUpdate) {
  const q = query(likesCol, where('postId', '==', postId));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToUserProfile(uid, onUpdate) {
  const ref = doc(db, 'users', uid);
  return onSnapshot(ref, (snap) => {
    onUpdate(snap.exists() ? { uid, ...snap.data() } : null);
  });
}

export function subscribeToChatMessages(chatId, onUpdate) {
  const q = query(messagesCol, where('chatId', '==', chatId), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendChatMessage(chatId, userId, text) {
  const ref = await addDoc(messagesCol, {
    chatId,
    userId,
    text,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, chatId, userId, text };
}

export async function subscribeToNotifications(userId, onUpdate) {
  const q = query(
    notificationsCol,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  return onSnapshot(q, (snap) => {
    onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}