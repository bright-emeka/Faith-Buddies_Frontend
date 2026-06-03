import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { createUserProfile } from './services/api.jsx';
import Login from './pages/Login.jsx';
import Chat from './pages/Chat.jsx';
import Feed from './pages/Feed.jsx';
import Profile from './pages/Profile.jsx';
import Discover from './pages/Discover.jsx';
import Notifications from './pages/Notifications.jsx';
import Search from './pages/Search.jsx';
import Groups from './pages/Groups.jsx';
import Header from './components/Header.jsx';
import ChatHub from './pages/ChatHub.jsx';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      try {
        // Create user profile in backend if it doesn't exist
        createUserProfile(user.uid, {
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
        });
      } catch (error) {
        console.error('Error creating user profile:', error);
      }
    }
  }, [user]);

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="App">
      {user ? (
        <>
          <Header 
            userId={user.uid}
            onUserClick={handleUserClick}
          />
          <main className="main-content">
            <ProtectedRoute>
              <Routes>
                <Route path="/feed" element={<Feed />} />
                <Route path="/chat" element={<ChatHub userEmail={user.email} />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/search" element={<Search onUserClick={handleUserClick} />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/discover" element={<Discover onUserClick={handleUserClick} />} />
                <Route path="/" element={<Feed />} />
              </Routes>
            </ProtectedRoute>
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Login />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;