// Main App component - handles routing and auth state
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthChange } from './services/auth.jsx';
import { setAuthToken, createUserProfile } from './services/api.jsx';
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

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      if (authUser) {
        // User is logged in
        setUser({
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
        });

        // Get and set auth token for API calls
        try {
          const token = await authUser.getIdToken();
          setAuthToken(token);

          // Create or get user profile
          await createUserProfile(authUser.uid, {
            name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
            email: authUser.email,
          });
        } catch (error) {
          console.error('Error setting up user:', error);
        }
      } else {
        // User is logged out
        setUser(null);
        setAuthToken(null);
        navigate('/login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [navigate]);

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
          </main>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLoginSuccess={() => {}} />} />
          <Route path="*" element={<Login onLoginSuccess={() => {}} />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
}

export default App;
