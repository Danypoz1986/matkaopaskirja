const mongoose = require('mongoose');

// Define the City schema
const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  weather: {
    temperature: Number,
    description: String,
  },
  placesToVisit: [
    {
      name: String,
      rating: Number,
      tips: [
        {
          author: String,
          text: String,
        },
      ],
    },
  ],
  restaurantOpinions: [
    {
      name: String,
      rating: Number,
      reviews: [
        {
          author: String,
          rating: Number,
          text: String,
        },
      ],
    },
  ],
  monuments: [
    {
      name: String,
      rating: Number,
      reviews: [
        {
          author: String,
          rating: Number,
          text: String,
        },
      ],
    },
  ],
});

const City = mongoose.model('City', citySchema);

module.exports = City;
