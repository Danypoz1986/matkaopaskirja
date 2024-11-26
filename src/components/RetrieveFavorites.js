import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const RetrieveFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  const handleShowFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error.message);
    }
  };

  useEffect(() => {
    handleShowFavorites();
  }, []);

  return (
    <div className="favorites-section mt-4">
      <h4>Your Favorite Cities:</h4>
      <ul>
        {favorites.map((favorite, index) => (
          <li key={index}>
            <strong>{favorite.cityName}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RetrieveFavorites;
