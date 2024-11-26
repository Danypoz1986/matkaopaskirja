import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SearchPage.css';
import faviconImage from '../favicon/android-chrome-192x192.png';

const SearchPage = () => {
  const [city, setCity] = useState('');
  const [cityData, setCityData] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // Success or Warning
  const [username, setUsername] = useState(''); // State to store the username
  const navigate = useNavigate();
  const resultsContainerRef = useRef(null); // Reference to the results container

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Timer for inactivity
  let inactivityTimer;

  // Function to reset inactivity timer
  const resetTimer = () => {
    console.log('Resetting inactivity timer');
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      console.log('Inactivity timeout reached. Logging out.');
      handleLogout();
    }, 300000); // 5 minute inactivity timeout
  };


  // Fetch user info when the component mounts
  useEffect(() => {
    console.log('Component mounted. Fetching user info.');
    const fetchUserInfo = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('Token found. Fetching user info from server.');
        try {
          const response = await axios.get(`${API_URL}/user-info`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log('User info fetched successfully:', response.data);
          setUsername(response.data.username || response.data.email); // Set the username or email
        } catch (error) {
          console.error('Error fetching user information:', error.message);
        }
      } else {
        console.log('No token found in localStorage.');
      }
    };

    fetchUserInfo();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    // Start the timer initially
    resetTimer();

    // Clean up the event listeners on component unmount
    return () => {
      console.log('Component unmounted. Cleaning up event listeners.');
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(inactivityTimer);
    };
  }, []);

  useEffect(() => {
    const handleOverflow = () => {
      const isOverflowing =
        (resultsContainerRef.current && resultsContainerRef.current.scrollHeight > window.innerHeight) || 
        Array.from(document.getElementsByClassName('center-column')).some(
          element => element.scrollHeight > window.innerHeight
        );
  
      // Enable auto overflow only between 900px and 1080px width or if content overflows
      if ((window.innerWidth > 900 && window.innerWidth <= 1080) || isOverflowing) {
        document.body.style.overflow = 'auto';
      } else if (window.innerWidth > 1080) {
        // For screens larger than 1080px, apply overflow based on content
        document.body.style.overflow = isOverflowing ? 'auto' : 'hidden';
      } else {
        // Default behavior for screens smaller than 900px
        document.body.style.overflow = 'hidden';
      }
    };
  
    handleOverflow(); // Run on mount
    window.addEventListener('resize', handleOverflow); // Update on resize
  
    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleOverflow);
      document.body.style.overflow = 'auto'; // Reset on unmount
    };
  }, [cityData]);
   
  const handleSearch = async () => {
    console.log('Search button clicked. City:', city);
    if (city.trim() === '') {
      console.log('City input is empty. Showing warning alert.');
      setAlertMessage('Please enter a city name.');
      setAlertType('warning');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Sending request to fetch city data for:', city);
      const response = await axios.post(
        `${API_URL}/city-info`,
        { cityName: city },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('City data response received:', response.data);
      if (!response.data || Object.keys(response.data).length === 0) {
        console.log('No results found for the entered city name.');
        setAlertMessage('No results found for the entered city name. Please check the city name and try again.');
        setAlertType('danger');
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
        return;
      }

      setCityData(response.data);
    } catch (error) {
      console.error('Error fetching city data:', error.message);
      if (error.response) {
        console.log('Error response status:', error.response.status);
        if (error.response.status === 404) {
          setAlertMessage('No results found. Please check the city name and try again.');
          setAlertType('danger');
        } else if (error.response.status === 403) {
          handleLogout();
        } else if (error.response.status === 500) {
          setAlertMessage('Internal server error. Please try again later.');
          setAlertType('danger');
        } else {
          setAlertMessage(`Unexpected error: ${error.response.data.message || 'Please try again later.'}`);
          setAlertType('danger');
        }
      } else if (error.request) {
        console.log('No response received from the server.');
        setAlertMessage('No response from the server. Please check your connection and try again.');
        setAlertType('danger');
      } else {
        console.log('Error occurred while setting up the request.');
        setAlertMessage('An error occurred while setting up your request. Please try again.');
        setAlertType('danger');
      }

      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    }
  };

  const handleAddToFavorite = async () => {
    if (!cityData) {
      console.log('No city data available to add to favorites.');
      setAlertMessage('No city data available to add to favorites.');
      setAlertType('warning');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const cityName = cityData.name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      console.log('Sending request to add city to favorites:', cityName);
      await axios.post(
        `${API_URL}/add-favorite`,
        { cityName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('City added to favorites successfully.');
      setAlertMessage(`${cityName} has been added to your favorites.`);
      setAlertType('success');
      setTimeout(() => {
        setAlertMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error adding city to favorites:', error.message);
      if (error.response && error.response.status === 400) {
        console.log('City already in favorites.');
        setAlertMessage('You already added this city to your favorites.');
        setAlertType('warning');
        setTimeout(() => {
          setAlertMessage('');
        }, 3000);
      }
    }
  };

  const handleShowFavorites = () => {
    console.log('Navigating to favorites page.');
    navigate('/favorites');
  };

  const handleLogout = () => {
    console.log('Logging out.');
    localStorage.removeItem('token');
    navigate('/');
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
      console.log('Sending request to delete account.');
      const response = await axios.delete(`${API_URL}/delete-account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log('Account deleted successfully.');
        localStorage.removeItem('token');
        alert(response.data.message);
        navigate('/register');
      }
    } catch (error) {
      console.error('Error deleting account:', error.message);
      alert('An error occurred while trying to delete your account. Please try again later.');
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
                <li>
                  <p className="dropdown-item" onClick={handleLogout} style={{ margin: 0, cursor: 'pointer' }}>
                    Logout
                  </p>
                </li>
                <li>
                  <p className="dropdown-item" onClick={handleDeleteAccount} style={{ margin: 0, cursor: 'pointer', color: 'red' }}>
                    Delete Account
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

      <div className="page-container" ref={resultsContainerRef} style={{ overflowY: cityData ? 'scroll' : 'hidden' }}>
        {/* Alert Message */}
        {alertMessage && (
          <div
            className={`alert alert-${alertType} text-center`}
            style={{ position: 'fixed', top: '0', left: '0', right: '0', zIndex: '1000' }}
          >
            {alertMessage}
          </div>
        )}

        <div className="center-column">
          <div className="input-group mb-4">
            <input
              type="text"
              className="form-control"
              placeholder="Enter a city"
              value={city}
              onChange={(e) => {
                console.log('City input changed:', e.target.value);
                setCity(e.target.value);
              }}
            />
            <div className="input-group-append">
              <button className="btn btn-primary"  onClick={handleSearch}>
                Search
              </button>
            </div>
          </div>

          <button className="btn btn-info" id="showFavorites" style={{ width: '150px' }} onClick={handleShowFavorites}>
            Show Favorites
          </button>

          {cityData && (
            <div className="city-info-section mt-4">
              <div className="d-flex justify-content-between align-items-center">
                <h3>
                  {cityData.name
                    .split(' ')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </h3>
                <button className="btn btn-success ml-3" onClick={handleAddToFavorite}>
                  Add to Favorite
                </button>
              </div>
              <p>Temperature: {cityData.weather.temperature}°C</p>
              <p>Description: {cityData.weather.description}</p>

              {/* Places to Visit Section */}
              <div className="place-section">
                <h4>Places to Visit:</h4>
                <ul>
                  {cityData.placesToVisit && cityData.placesToVisit.map((place, index) => (
                    <li key={index}>
                      <strong>{place.name} - Rating: {place.rating || 'N/A'}</strong>
                      <ul className="review-list">
                        {Array.isArray(place.reviews) && place.reviews.length > 0 ? place.reviews.map((review, idx) => (
                          <li key={idx}>
                            {review.author}: {review.text}
                          </li>
                        )) : <li>No reviews available</li>}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Restaurant Opinions Section */}
              <div className="place-section">
                <h4>Restaurant Opinions:</h4>
                <ul>
                  {cityData.restaurantOpinions && cityData.restaurantOpinions.map((restaurant, index) => (
                    <li key={index}>
                      <strong>{restaurant.name} - Rating: {restaurant.rating || 'N/A'}</strong>
                      <ul className="review-list">
                        {Array.isArray(restaurant.reviews) && restaurant.reviews.length > 0 ? restaurant.reviews.map((review, idx) => (
                          <li key={idx}>
                            {review.author}: {review.text}
                          </li>
                        )) : <li>No reviews available</li>}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Monuments Section */}
              <div className="place-section">
                <h4>Monuments:</h4>
                <ul>
                  {cityData.monuments && cityData.monuments.map((monument, index) => (
                    <li key={index}>
                      <strong>{monument.name} - Rating: {monument.rating || 'N/A'}</strong>
                      <ul className="review-list">
                        {Array.isArray(monument.reviews) && monument.reviews.length > 0 ? monument.reviews.map((review, idx) => (
                          <li key={idx}>
                            {review.author}: {review.text}
                          </li>
                        )) : <li>No reviews available</li>}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lower Add to Favorite Button */}
              <button className="btn btn-success mt-3" onClick={handleAddToFavorite}>
                Add to Favorite
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SearchPage;