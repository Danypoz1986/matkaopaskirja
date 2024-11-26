import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../AuthStyles.css';
import faviconImage from '../favicon/android-chrome-192x192.png';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Set id and class on body when component mounts
    document.body.id = 'auth-body';
    document.body.classList.add('auth-body');
  
    // Clean up by removing the id and class on component unmount
    return () => {
      document.body.id = '';
      document.body.classList.remove('auth-body');
    };
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if the email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format. Please enter a valid email.');
      console.log('Invalid email format detected');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    try {
      await axios.post(`${API_URL}/register`, { email, password });
      alert('Account created successfully!'); // Show success alert
      navigate('/'); // Redirect to login page after successful registration
    } catch (error) {
      setError('Error during registration. Please try again.');
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
        <div className="auth-container" id="register">
          <div className="auth-box">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
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
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit" className="auth-button">Register</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            <p>
              Already have an account?{' '}
              <span className="link" onClick={() => navigate('/')}>Login</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;