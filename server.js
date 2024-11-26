const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const path = require('path');
const User = require('./src/components/UserSchema'); // Adjust path to your UserSchema
const City = require('./src/components/CitySchema'); // Adjust path to your CitySchema
const Favorite = require('./src/components/FavoriteSchema'); // Add Favorite Schema path
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

// Middleware to verify JWT and extract userId
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Store userId in request object
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Register route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Registering user with email:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    console.log('User registered successfully:', email);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log('Attempting login for user:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Invalid credentials: User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid credentials: Incorrect password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    console.log('Login successful for user:', email);
    res.json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Middleware to get user information from the token
app.get('/api/user-info', verifyToken, async (req, res) => {
  try {
    console.log('Fetching user info for userId:', req.userId);
    const user = await User.findById(req.userId);
    if (!user) {
      console.log('User not found for userId:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User info found:', user.email);
    res.status(200).json({ username: user.email }); // Adjust to return the appropriate field, like 'username' if it exists
  } catch (error) {
    console.error('Error fetching user information:', error);
    res.status(500).json({ message: 'Error fetching user information' });
  }
});

// Fetch city information route
app.post('/api/city-info', verifyToken, async (req, res) => {
  const { cityName } = req.body;

  try {
    console.log("Searching for city:", cityName);

    // Fetch weather data from OpenWeather API
    let weatherResponse;
    try {
      weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_API_KEY}&units=metric`, { timeout: 30000 });
      console.log('Weather data fetched successfully:', JSON.stringify(weatherResponse.data, null, 2));
    } catch (weatherError) {
      console.error('Error fetching weather data:', weatherError);
      if (weatherError.response && weatherError.response.status === 404) {
        console.log('City not found in weather API:', cityName);
        return res.status(404).json({ message: 'City not found. Please check the name and try again.' });
      }
      throw new Error('Error fetching weather data');
    }

    // Fetch places to visit from Google Places API
    const placesResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=attractions+in+${cityName}&key=${process.env.GOOGLE_API_KEY}`, { timeout: 30000 });
    console.log('Raw Places to Visit response:', JSON.stringify(placesResponse.data, null, 2));
    const placesToVisit = await Promise.all(placesResponse.data.results.map(async (place) => {
      const placeDetailsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,reviews&key=${process.env.GOOGLE_API_KEY}`, { timeout: 30000 });
      const placeDetails = placeDetailsResponse.data.result;
      return {
        name: placeDetails.name,
        rating: placeDetails.rating || 'N/A',
        reviews: placeDetails.reviews ? placeDetails.reviews.map(review => ({
          author: review.author_name,
          text: review.text,
        })) : [],
      };
    }));

    // Fetch restaurant data from Google Places API
    const restaurantsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${cityName}&key=${process.env.GOOGLE_API_KEY}`, { timeout: 30000 });
    console.log('Raw Restaurant response:', JSON.stringify(restaurantsResponse.data, null, 2));
    const restaurantOpinions = await Promise.all(restaurantsResponse.data.results.map(async (restaurant) => {
      const restaurantDetailsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&fields=name,rating,reviews&key=${process.env.GOOGLE_API_KEY}`, { timeout: 30000 });
      const restaurantDetails = restaurantDetailsResponse.data.result;
      return {
        name: restaurantDetails.name,
        rating: restaurantDetails.rating || 'N/A',
        reviews: restaurantDetails.reviews ? restaurantDetails.reviews.map(review => ({
          author: review.author_name,
          text: review.text,
        })) : [],
      };
    }));

    // Fetch monuments data from Google Places API
    const monumentsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=monuments+in+${cityName}&key=${process.env.GOOGLE_API_KEY}`);
    console.log('Raw Monuments response:', JSON.stringify(monumentsResponse.data, null, 2));
    const monuments = await Promise.all(monumentsResponse.data.results.map(async (monument) => {
      const monumentDetailsResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${monument.place_id}&fields=name,rating,reviews&key=${process.env.GOOGLE_API_KEY}`);
      const monumentDetails = monumentDetailsResponse.data.result;
      return {
        name: monumentDetails.name,
        rating: monumentDetails.rating || 'N/A',
        reviews: monumentDetails.reviews ? monumentDetails.reviews.map(review => ({
          author: review.author_name,
          text: review.text,
        })) : [],
      };
    }));

    // Construct the full city data response
    const cityData = {
      name: cityName,
      weather: {
        temperature: weatherResponse.data.main.temp,
        description: weatherResponse.data.weather[0].description,
      },
      placesToVisit,
      restaurantOpinions,
      monuments,
    };

    console.log('Final city data before saving:', JSON.stringify(cityData, null, 2));

    // Save to database
    const newCity = new City(cityData);
    await newCity.save();
    console.log('City data saved to MongoDB');

    res.json(cityData);
  } catch (error) {
    console.error('Error fetching city data:', error);
    if (error.message === 'City not found. Please check the name and try again.') {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'An unexpected error occurred while fetching city data' });
    }
  }
});

// Add favorite city route
app.post('/api/add-favorite', verifyToken, async (req, res) => {
  const { cityName } = req.body;

  try {
    console.log('Attempting to add favorite city:', cityName);
    const existingFavorite = await Favorite.findOne({ userId: req.userId, cityName });
    if (existingFavorite) {
      console.log('City already in favorites:', cityName);
      return res.status(400).json({ message: 'You already added this city to your favorites.' });
    }

    const favorite = new Favorite({ userId: req.userId, cityName });
    await favorite.save();
    console.log('City added to favorites:', cityName);
    res.status(201).json({ message: `${cityName} added to favorites.` });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ message: 'Error adding to favorites.' });
  }
});

// Get favorites route
app.get('/api/favorites', verifyToken, async (req, res) => {
  try {
    console.log('Fetching favorites for userId:', req.userId);
    const favorites = await Favorite.find({ userId: req.userId });
    console.log('Favorites found:', favorites);
    res.status(200).json(favorites);
  } catch (error) {
    console.error('Error retrieving favorites:', error);
    res.status(500).json({ message: 'Error retrieving favorites.' });
  }
});

app.get('/api/city/:cityName', async (req, res) => {
  try {
    const cityName = req.params.cityName;
    console.log('City name received:', cityName);

    const city = await City.findOne({ name: new RegExp(`^${cityName}$`, 'i') });
    console.log('Query result:', city);

    if (city) {
      console.log('City found:', city);
      res.json(city);
    } else {
      console.log('City not found');
      res.status(404).json({ message: 'City not found' });
    }
  } catch (error) {
    console.error('Error retrieving city information:', error);
    res.status(500).json({ message: 'Error retrieving city information', error });
  }
});

app.delete('/api/favorites/:cityName', async (req, res) => {
  console.log(`Received DELETE request for city: ${req.params.cityName}`);

  try {
    const cityName = req.params.cityName;
    console.log('City name before deletion attempt:', cityName);

    const favorite = await Favorite.findOneAndDelete({ cityName: new RegExp(`^${cityName}$`, 'i') });

    if (favorite) {
      console.log('Favorite city deleted:', favorite);
      res.status(200).json({ message: 'City deleted' });
    } else {
      console.log('City not found in favorites');
      res.status(404).json({ message: 'City not found in favorites' });
    }
  } catch (error) {
    console.error('Error deleting city:', error.message);
    res.status(500).json({ message: error.message });
  }
}); 


// Delete account
app.delete('/api/delete-account', verifyToken, async (req, res) => {
  try {
    console.log('Attempting to delete account for userId:', req.userId);
    const deletedUser = await User.findByIdAndDelete(req.userId);

    if (!deletedUser) {
      console.log('User not found for deletion:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    await Favorite.deleteMany({ userId: deletedUser._id });
    console.log('User account and associated favorites deleted for userId:', req.userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});