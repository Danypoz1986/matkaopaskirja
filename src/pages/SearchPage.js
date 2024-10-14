import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert } from '@mui/material';
import axios from 'axios';
import AddFavorite from '../components/AddFavorite'; // Adjust the path to your components folder
import '../App.css';

const SearchPage = () => {
  const [cityName, setCityName] = useState('');
  const [favoriteCityName, setFavoriteCityName] = useState('');
  const [cityData, setCityData] = useState(null);
  const [error, setError] = useState('');

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/city-info', { cityName });
      setCityData(response.data);
    } catch (err) {
      setError('Error fetching data. Please try again.');
      console.error('Error fetching city data:', err);
    }
  };

  return (
    <Container maxWidth="md" className="container">
      <Typography variant="h4" align="center" gutterBottom>
        City Information
      </Typography>
      <Typography variant="h6" align="center" color="red" gutterBottom>
        Unlocking Urban Insights
      </Typography>

      <AddFavorite cityName={favoriteCityName} setCityName={setFavoriteCityName} />

      <Box component="form" onSubmit={handleSearchSubmit} className="form">
        <TextField
          variant="outlined"
          fullWidth
          label="Search"
          value={cityName}
          onChange={(e) => setCityName(e.target.value)}
          className="textField"
        />
        <Button type="submit" variant="contained" color="primary" className="button">
          Get Info
        </Button>
      </Box>

      {error && <Alert severity="error" className="alert">{error}</Alert>}

      <Box flexGrow={1} mb={2}>
        {cityData && (
          <Paper elevation={3} className="infoContainer">
            <Box mb={2}>
              <Typography variant="h5">Weather in {cityData.name}</Typography>
              <Typography variant="body1">{cityData.weather.temperature}°C - {cityData.weather.description}</Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="h5">Places to Visit</Typography>
              {cityData.placesToVisit.map((place, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="h6">{place.name} - Rating: {place.rating || 'No Rating'}</Typography>
                  <ul>
                    {place.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>
                        <Typography variant="body2"><strong>{tip.author}</strong>: "{tip.text}"</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              ))}
            </Box>

            <Box mb={2}>
              <Typography variant="h5">Restaurant Opinions</Typography>
              {cityData.restaurantOpinions.map((restaurant, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="h6">{restaurant.name} - Rating: {restaurant.rating || 'No Rating'}</Typography>
                  <ul>
                    {restaurant.reviews.map((review, reviewIndex) => (
                      <li key={reviewIndex}>
                        <Typography variant="body2"><strong>{review.author}</strong> - {review.rating}/5: "{review.text}"</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              ))}
            </Box>

            <Box mb={2}>
              <Typography variant="h5">Monuments</Typography>
              {cityData.monuments.map((monument, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="h6">{monument.name} - Rating: {monument.rating || 'No Rating'}</Typography>
                  <ul>
                    {monument.reviews.map((review, reviewIndex) => (
                      <li key={reviewIndex}>
                        <Typography variant="body2"><strong>{review.author}</strong> - {review.rating}/5: "{review.text}"</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
      </Box>

      <Box mt={2} display="flex" justifyContent="center">
        <Button variant="contained" color="secondary" href="/favorites">
          View Favorites
        </Button>
      </Box>
    </Container>
  );
};

export default SearchPage;
