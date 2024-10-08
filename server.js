const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,  // Timeout di selezione del server
    socketTimeoutMS: 45000,           // Timeout del socket
    connectTimeoutMS: 30000   
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

const City = mongoose.model('City', citySchema, 'Mok_data');

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
        console.error('Error fetching data or saving to MongoDB:', error.message);
        res.status(500).json({ message: 'Server error. Check logs for more details.', error: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
