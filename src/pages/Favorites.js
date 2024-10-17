import React, { useState, useEffect } from 'react';
import { Button, List, ListItem, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/favorites', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavorites(response.data.favorites); // Successfully fetch favorites
        } catch (err) {
          console.error('Error fetching favorites:', err);
          setError('Failed to load favorites. Please try again.');
        }
      } else {
        setError('You must be logged in to view favorites.');
      }
    };

    fetchFavorites();
  }, []);

  const handleCityClick = (cityName) => {
    // Navigate to the search page and pass the cityName to perform the search
    navigate('/search', { state: { cityName } });
  };

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        Your Favorite Cities
      </Typography>

      {error && (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}

      {favorites.length > 0 ? (
        <List>
          {favorites.map((city, index) => (
            <ListItem key={index} onClick={() => handleCityClick(city)}>
              <Button variant="contained" fullWidth>
                {city}
              </Button>
            </ListItem>
          ))}
        </List>
      ) : (
        !error && <Typography align="center">No favorites added yet.</Typography>
      )}
    </Box>
  );
};

export default FavoritesPage;
