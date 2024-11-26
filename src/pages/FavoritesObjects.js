import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FavoritesObjects.css';
import faviconImage from '../favicon/android-chrome-192x192.png';

const FavoritesObjects = () => {
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState(''); // Added for displaying username
  const location = useLocation();
  const { cityName } = location.state || {};
  const navigate = useNavigate();

const  API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/user-info`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUsername(response.data.username || response.data.email); // Set the username or email
        } catch (error) {
          console.error('Error fetching user information:', error.message);
        }
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (cityName) {
      const fetchCityData = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/city/${cityName}`);
          setCityData(response.data);
          setError(null);
        } catch (error) {
          console.error('Error fetching city data:', error.message);
          setError('Failed to fetch city data. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchCityData();
    } else {
      setError('City name not provided. Please go back and select a city.');
      setLoading(false);
    }
  }, [cityName]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to login page after logout
  };

  const handleDeleteAccount = async () => {
    const youSure = window.confirm("Are you sure you want to delete the account?")
    if(!youSure){
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Please log in again.');
      return;
    }
  
    try {
      const response = await axios.delete(`${API_URL}/delete-account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        // Clear the token and navigate to the registration page
        localStorage.removeItem('token');
        alert(response.data.message); // Display a success message
        navigate('/register'); // Redirect to the registration page
      }
    } catch (error) {
      console.error('Error deleting account:', error.message);
      alert('An error occurred while trying to delete your account. Please try again later.');
    }
  };
  

  const handleBackToFavorites = () => {
    // Ensure the body overflow style is reset to avoid issues with hidden headers
    document.body.style.overflow = 'auto'; 
    document.body.scrollTop = 0; // Scroll to top for consistency
    document.documentElement.scrollTop = 0; // For Firefox compatibility

    if (window.innerWidth <= 800){
      navigate('/favorites', { replace: true });
      window.location.reload();
    }
    else{
      navigate('/favorites')
    }
  
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <div className="alert alert-danger text-center" role="alert">{error}</div>;
  }


  return (
    <>
      <div id="header">
        <div className="title-container">
          <img src={faviconImage} alt="favicon" />
          <h1>Matkaopas kirja</h1>
        </div>
        <div className="dropdown-container">
          <div className="dropdown">
            <p
              className="dropdown-toggle"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: 'pointer', margin: 0 }}
            >
              <strong>{username || 'User'}</strong>
            </p>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><p className="dropdown-item" onClick={handleLogout} style={{ margin: 0, cursor: 'pointer' }}>Logout</p></li>
              <li><p className="dropdown-item" onClick={handleDeleteAccount} style={{ margin: 0, cursor: 'pointer', color: 'red' }}>Delete Account</p></li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Top "Back to Favorites" button */}
      <div className="container mt-3">
        <button className="btn btn-secondary" onClick={handleBackToFavorites}>
          Back to Favorites
        </button>
      </div>

      <div className="container mt-4 text-left">
        <h1 className="display-6">
          {cityData.name.charAt(0).toUpperCase() + cityData.name.slice(1)}
        </h1>
        <section className="mt-4">
          <h2 className="h5">Museums:</h2>
          {cityData.monuments && cityData.monuments.length > 0 ? (
            <ul className="list-group">
              {cityData.monuments.map((monument, index) => (
                <li key={index} className="list-group-item">
                  {monument.name} - Rating: {monument.rating || 'N/A'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="small">No museums available.</p>
          )}
        </section>
        
        <section className="mt-4">
          <h2 className="h5">Places to Visit:</h2>
          {cityData.placesToVisit && cityData.placesToVisit.length > 0 ? (
            <ul className="list-group">
              {cityData.placesToVisit.map((place, index) => (
                <li key={index} className="list-group-item">
                  {place.name} - Rating: {place.rating || 'N/A'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="small">No places available.</p>
          )}
        </section>
        
        <section className="mt-4">
          <h2 className="h5">Restaurants:</h2>
          {cityData.restaurantOpinions && cityData.restaurantOpinions.length > 0 ? (
            <ul className="list-group">
              {cityData.restaurantOpinions.map((restaurant, index) => (
                <li key={index} className="list-group-item">
                  {restaurant.name} - Rating: {restaurant.rating || 'N/A'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="small">No restaurants available.</p>
          )}
        </section>

        {/* Bottom "Back to Favorites" button */}
        <div className="mt-4">
          <button className="btn btn-secondary" onClick={handleBackToFavorites}>
            Back to Favorites
          </button>
        </div>
      </div>
    </>
  );
};

export default FavoritesObjects;