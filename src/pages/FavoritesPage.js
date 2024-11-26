import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './FavoritesPage.css';
import faviconImage from '../favicon/android-chrome-192x192.png';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [username, setUsername] = useState('');
  const resultsContainerRef = useRef(null);
  const navigate = useNavigate();

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Function to manage scrollbar
  const manageScrollbar = () => {
    if (resultsContainerRef.current) {
      const isOverflowing = resultsContainerRef.current.scrollHeight > window.innerHeight;

      // Add extra padding if the content is not overflowing
      resultsContainerRef.current.style.paddingBottom = isOverflowing ? '0px' : '77px';
      document.body.style.overflow = isOverflowing ? 'auto' : 'hidden';
    }
  };

  // Fetch user info when the component mounts
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
          setUsername(response.data.username || response.data.email);
        } catch (error) {
          console.error('Error fetching user information:', error.message);
        }
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch favorites when the component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/favorites`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFavorites(response.data);
      } catch (error) {
        console.error('Error fetching favorites:', error.message);
      }
    };

    fetchFavorites();
  }, []);

  // Manage the body scrollbar based on content size
  useEffect(() => {
    manageScrollbar(); // Initial check when component is mounted
    window.addEventListener('resize', manageScrollbar);

    return () => {
      window.removeEventListener('resize', manageScrollbar);
      document.body.style.overflow = 'auto'; // Reset overflow when component unmounts
    };
  }, [favorites]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification.message) {
      const timer = setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to login page after logout
  };

  const handleCityClick = (cityName) => {
    document.body.style.overflow = 'auto';
    navigate('/favorites-objects', {
      state: { cityName },
    });
  };

  const handleDeleteCity = async (cityName) => {
    if (!window.confirm(`Are you sure you want to remove ${cityName} from favorites?`)) {
      return;
    }

    try {
      const response = await axios.delete(`${API_URL}/favorites/${cityName}`);
      if (response.status === 200) {
        setFavorites((prevFavorites) => {
          const updatedFavorites = prevFavorites.filter((city) => city.cityName !== cityName);
          manageScrollbar(); // Ensure scrollbar is managed correctly after updating favorites
          return updatedFavorites;
        });
        setNotification({ message: `${cityName} was removed from favorites.`, type: 'success' });
      } else {
        setNotification({ message: `Failed to remove ${cityName} from favorites.`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: `Error deleting ${cityName}: ${error.message}`, type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete the account?")) {
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
        localStorage.removeItem('token');
        alert(response.data.message);
        navigate('/register');
      }
    } catch (error) {
      alert('An error occurred while trying to delete your account. Please try again later.');
    }
  };

  const handleUpdateCity = async (cityName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/city-info`, { cityName }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setFavorites((prevFavorites) =>
          prevFavorites.map((city) =>
            city.cityName === cityName ? { ...city, ...response.data } : city
          )
        );
        setNotification({ message: `${cityName} was updated successfully.`, type: 'success' });
      } else {
        setNotification({ message: `Failed to update ${cityName}.`, type: 'error' });
      }
    } catch (error) {
      setNotification({ message: `Error updating ${cityName}: ${error.message}`, type: 'error' });
    }
  };

  const handleBackToSearch = () => {
    // Ensure the body overflow style is reset to avoid issues with hidden headers
    document.body.style.overflow = 'auto'; 
    document.body.scrollTop = 0; // Scroll to top for consistency
    document.documentElement.scrollTop = 0; // For Firefox compatibility

    if (window.innerWidth <= 800){
      navigate('/search', { replace: true });
      window.location.reload();
    }
    else{
      navigate('/search')
    }
  
  };

  return (
    <>
      <div id="header">
        <div className="title-container">
          <img src={faviconImage} alt="favicon" />
          <h1>Matkaopas kirja</h1>
        </div>

        <div className="dropdown-container">
          <div className="dropdown">
            <p className="dropdown-toggle" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false" style={{ cursor: 'pointer', margin: 0 }}>
              <strong>{username || 'User'}</strong>
            </p>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li><p className="dropdown-item" onClick={handleLogout} style={{ margin: 0, cursor: 'pointer' }}>Logout</p></li>
              <li><p className="dropdown-item" onClick={handleDeleteAccount} style={{ margin: 0, cursor: 'pointer', color: 'red' }}>Delete Account</p></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="page-container" ref={resultsContainerRef}>
        <div className="center-column">
          <h2>Your Favorite Cities</h2>

          {notification.message && (
                <div
                  className={`notification-bar alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}
                  role="alert"
                >
                  {notification.message}
                </div>
              )}

          <ul className="favorites-list mt-4">
            {Array.isArray(favorites) && favorites.length > 0 ? (
              favorites.map((favorite, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <strong onClick={() => handleCityClick(favorite.cityName)} style={{ cursor: 'pointer' }}>
                    {favorite.cityName.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </strong>
                  <div>
                    <button className="btn btn-info btn-sm me-2" id="info-danger" onClick={(e) => { e.stopPropagation(); handleUpdateCity(favorite.cityName); }}>
                      Update
                    </button>
                    <button className="btn btn-danger btn-sm" id="info-danger" onClick={(e) => { e.stopPropagation(); handleDeleteCity(favorite.cityName); }}>
                      Remove
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <p>No favorite cities added yet.</p>
            )}
          </ul>
          <button className="btn btn-secondary mt-4" onClick={handleBackToSearch}>Back to Search</button>
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;