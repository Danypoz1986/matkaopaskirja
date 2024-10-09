import React from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useFavorites } from '../context/FavoritesContext';

const AddFavorite = ({ cityName, setCityName }) => {
  const { addFavorite } = useFavorites(); 

  const handleAddFavorite = () => {
    if (cityName) {
      addFavorite(cityName);
      setCityName('');
    }
  };

  return (
    <Box display="flex" gap={2}>
      <TextField
        variant="outlined"
        label="Favorite City"
        value={cityName}
        onChange={(e) => setCityName(e.target.value)}
        fullWidth
      />
      <Button variant="contained" color="primary" onClick={handleAddFavorite}>
        Add to Favorites
      </Button>
    </Box>
  );
};

export default AddFavorite;
