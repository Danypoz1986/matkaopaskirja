const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// Define the City schema
const citySchema = new mongoose.Schema({
  name: String,
  weather: {
    temperature: Number,
    description: String,
  },
  placesToVisit: [{
    name: String,
    rating: Number,
    tips: [{
      author: String,
      text: String,
    }]
  }],
  restaurantOpinions: [{
    name: String,
    rating: Number,
    reviews: [{
      author: String,
      rating: Number,
      text: String,
    }]
  }],
  monuments: [{
    name: String,
    rating: Number,
    reviews: [{
      author: String,
      rating: Number,
      text: String,
    }]
  }]
});

const City = mongoose.model('City', citySchema, 'Kaupungit');

// Define the User schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Route to fetch city info
app.post('/city-info', async (req, res) => {
  const { cityName } = req.body;
  console.log(`Received request for city: ${cityName}`);

  try {
        // Fetch weather data from OpenWeather API
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );
        console.log('Weather data fetched:', weatherResponse.data);

        // Fetch places to visit from Google Places API
        const placesResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=attractions+in+${cityName}&key=${process.env.GOOGLE_API_KEY}`
        );
        console.log('Places data fetched:', placesResponse.data);

        // Fetch details (including tips) for each place to visit
    const placeDetailsPromises = placesResponse.data.results.map(async (place) => {
            const detailsResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${process.env.GOOGLE_API_KEY}`
            );
      const details = detailsResponse.data.result;
      return {
        name: details.name,
                rating: details.rating || null, // Use null if rating is missing
        tips: details.reviews ? details.reviews.slice(0, 3).map(review => ({
          author: review.author_name,
          text: review.text,
                })) : [],  // Limit to 3 tips per place
      };
    });

    const placesToVisit = await Promise.all(placeDetailsPromises);
        console.log('Processed places to visit:', placesToVisit);

        // Fetch restaurants data from Google Places API
        const restaurantsResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${cityName}&key=${process.env.GOOGLE_API_KEY}`
        );
        console.log('Restaurant data fetched:', restaurantsResponse.data);

        // Fetch details (including reviews) for each restaurant
        const restaurantDetailsPromises = restaurantsResponse.data.results.map(async (restaurant) => {
            const detailsResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${restaurant.place_id}&key=${process.env.GOOGLE_API_KEY}`
            );
      const details = detailsResponse.data.result;
      return {
        name: details.name,
                rating: details.rating || null,  // Use null if rating is missing
        reviews: details.reviews ? details.reviews.slice(0, 3).map(review => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
                })) : [],  // Limit to 3 reviews per restaurant
      };
    });

    const restaurantOpinions = await Promise.all(restaurantDetailsPromises);
        console.log('Processed restaurant opinions:', restaurantOpinions);

        // Fetch monuments data from Google Places API
        const monumentsResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/place/textsearch/json?query=monuments+in+${cityName}&key=${process.env.GOOGLE_API_KEY}`
        );
        console.log('Monuments data fetched:', monumentsResponse.data);

        // Fetch details (including reviews) for each monument
    const monumentDetailsPromises = monumentsResponse.data.results.map(async (monument) => {
            const detailsResponse = await axios.get(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${monument.place_id}&key=${process.env.GOOGLE_API_KEY}`
            );
      const details = detailsResponse.data.result;
      return {
        name: details.name,
        rating: details.rating || null,
        reviews: details.reviews ? details.reviews.slice(0, 3).map(review => ({
          author: review.author_name,
          rating: review.rating,
          text: review.text,
                })) : [],  // Limit to 3 reviews per monument
      };
    });

    const monuments = await Promise.all(monumentDetailsPromises);
        console.log('Processed monuments:', monuments);

        // Create a new City document with the fetched data
    const city = new City({
      name: cityName,
      weather: {
        temperature: weatherResponse.data.main.temp,
        description: weatherResponse.data.weather[0].description,
      },
      placesToVisit,
      restaurantOpinions,
      monuments,
    });

        // Save the data to MongoDB
    await city.save();
        console.log('City data saved successfully');
    res.json(city);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User registration route
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// **User login route with hardcoded test user**
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Hardcoded test credentials
      const TEST_USER = 'testuser@test.com';
      const TEST_PASSWORD = 'testpassword';
  
      // Check for hardcoded credentials
      if (email === TEST_USER && password === TEST_PASSWORD) {
        // Generate a test token and return success for the test user
        const token = jwt.sign({ userId: 'testuser' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.json({ token, message: 'Login successful (test user)' });
      }
  
      // Normal login process for registered users
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, message: 'Login successful' });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });