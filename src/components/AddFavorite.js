import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const AddFavorite = ({ cityData }) => {
  const handleAddToFavorite = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/add-favorite',
        { cityName: cityData.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(`${cityData.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} has been added to your favorites.`);
    } catch (error) {
      console.error('Error adding favorite:', error.message);
    }
  };

  return (
    <button className="btn btn-success mt-3" onClick={handleAddToFavorite}>
      Add to Favorite
    </button>
  );
};

export default AddFavorite;