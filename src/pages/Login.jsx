// Login/Register page component
import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';

const Login = () => {
  const { login, signUp, resetPassword } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isResetting) {
        await resetPassword(email);
        setResetSent(true);
        setIsResetting(false);
        return;
      }

      if (isSignUp) {
        if (!name) {
          setError('Name is required');
          return;
        }
        await signUp(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Faith Buddies</h1>
        <p className="subtitle">AI-Powered Faith Chat</p>

        <form onSubmit={handleSubmit}>
          {resetSent ? (
            <div className="success-message">
              Password reset email sent! Check your inbox and follow the instructions.
            </div>
          ) : (
            <>
              {isSignUp && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required={isSignUp}
                  />
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : isResetting ? 'Reset Password' : isSignUp ? 'Sign Up' : 'Login'}
              </button>

              <p className="toggle-auth">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  className="toggle-btn"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setResetSent(false);
                  }}
                >
                  {isSignUp ? 'Login' : 'Sign Up'}
                </button>
              </p>

              {!isSignUp && (
                <p className="toggle-auth">
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={() => setIsResetting(!isResetting)}
                  >
                    {isResetting ? 'Back to Login' : 'Forgot Password?'}
                  </button>
                </p>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;