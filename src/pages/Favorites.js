import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useFavorites } from '../context/FavoritesContext';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <Box>
      <Typography variant="h4" align="center" gutterBottom>
        My Favorites
      </Typography>
      
      <Link to="/">
        <Button variant="contained" color="primary" style={{ marginBottom: '20px' }}>
          Back to Search
        </Button>
      </Link>

      {favorites.length === 0 ? (
        <Typography variant="body1" align="center">
          No favorite cities added yet.
        </Typography>
      ) : (
        favorites.map((city, index) => (
          <Box key={index} display="flex" justifyContent="space-between" alignItems="center" className="favoriteItem">
            <Typography variant="h6">{city}</Typography>
            <Button variant="outlined" color="secondary" onClick={() => removeFavorite(city)}>
              Remove
            </Button>
          </Box>
        ))
      )}
    </Box>
  );
};

export default Favorites;
