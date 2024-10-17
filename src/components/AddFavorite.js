import React, { useState } from 'react';
import axios from 'axios';
import { Button, Box, TextField, Alert } from '@mui/material';

const AddFavorite = () => {
  const [favoriteCityName, setFavoriteCityName] = useState('');
  const [error, setError] = useState(''); // Add state for error handling
  const [successMessage, setSuccessMessage] = useState(''); // Success state

  const handleAddFavorite = async () => {
    setError('');
    setSuccessMessage('');
  
    if (!favoriteCityName.trim()) {
      setError('City name cannot be empty.');
      return;
    }
  
    const token = localStorage.getItem('token'); // Retrieve token from localStorage
  
    if (token) {
      try {
        // Send the token in the Authorization header
        await axios.post(
          'http://localhost:5000/favorites',
          { cityName: favoriteCityName },
          { headers: { Authorization: `Bearer ${token}` } } // Add token here
        );
  
        setSuccessMessage(`${favoriteCityName} has been added to your favorites!`);
        setFavoriteCityName(''); // Clear input after success
      } catch (err) {
        setError('Failed to add city to favorites. Please try again.');
        console.error('Error adding favorite:', err);
      }
    } else {
      setError('You must be logged in to add a favorite.');
    }
  };
  
  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
      {/* Input field for city name */}
      <TextField
        label="City Name"
        value={favoriteCityName}
        onChange={(e) => setFavoriteCityName(e.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />

      {/* Error message display */}
      {error && <Alert severity="error" style={{ marginTop: '10px' }}>{error}</Alert>}
      {successMessage && <Alert severity="success" style={{ marginTop: '10px' }}>{successMessage}</Alert>}

      <Button variant="contained" color="primary" onClick={handleAddFavorite} style={{ marginTop: '10px' }}>
        Add to Favorites
      </Button>
    </Box>
  );
};

export default AddFavorite;
