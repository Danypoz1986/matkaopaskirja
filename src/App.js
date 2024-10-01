import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
    const [cityName, setCityName] = useState('');
    const [cityData, setCityData] = useState(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        try {
            const response = await axios.post('http://localhost:5000/city-info', { cityName });
            setCityData(response.data);
        } catch (err) {
            setError('Error fetching data. Please try again.');
            console.error('Error fetching city data:', err);
        }
    };

    return (
        <div>
            <h1>City Information App</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Enter city name"
                />
                <button type="submit">Get Info</button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {cityData && (
                <div>
                    <h2>Weather in {cityData.name}</h2>
                    <p>{cityData.weather.temperature}°C - {cityData.weather.description}</p>

                    <h2>Places to Visit</h2>
                    <ul>
                        {cityData.placesToVisit.map((place, index) => (
                            <li key={index}>
                                <strong>{place.name}</strong> - Rating: {place.rating ? `${place.rating} / 5` : 'No Rating'}
                                <ul>
                                    {place.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex}>
                                            <strong>{tip.author}</strong>: "{tip.text}"
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>

                    <h2>Restaurant Opinions</h2>
                    <ul>
                        {cityData.restaurantOpinions.map((restaurant, index) => (
                            <li key={index}>
                                <strong>{restaurant.name}</strong> - Rating: {restaurant.rating ? `${restaurant.rating} / 5` : 'No Rating'}
                                <ul>
                                    {restaurant.reviews.map((review, reviewIndex) => (
                                        <li key={reviewIndex}>
                                            <strong>{review.author}</strong> - {review.rating}/5: "{review.text}"
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>

                    <h2>Monuments</h2>
                    <ul>
                        {cityData.monuments.map((monument, index) => (
                            <li key={index}>
                                <strong>{monument.name}</strong> - Rating: {monument.rating ? `${monument.rating} / 5` : 'No Rating'}
                                <ul>
                                    {monument.reviews.map((review, reviewIndex) => (
                                        <li key={reviewIndex}>
                                            <strong>{review.author}</strong> - {review.rating}/5: "{review.text}"
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default App;
