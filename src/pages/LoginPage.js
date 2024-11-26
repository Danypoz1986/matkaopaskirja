import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../AuthStyles.css';
import faviconImage from '../favicon/android-chrome-192x192.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Set id and class on body when component mounts
    document.body.id = 'auth-body';
    // Clean up by removing the id and class on component unmount
    return () => {
      document.body.id = '';
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/search');
    } catch (error) {
      setError('Invalid login credentials');
    }
  };

  return (
    <>
      <div className="header">
        <div className="title-container" id="log">
          <img src={faviconImage} alt="favicon" />
          <h1>Matkaopas kirja</h1>
        </div>
      </div>
      <div className="auth-page">
        <div className="auth-container" id="login">
          <div className="auth-box">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="auth-button">Login</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p>
              Don't have an account?{' '}
              <span onClick={() => navigate('/register')} className="link">Register</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;