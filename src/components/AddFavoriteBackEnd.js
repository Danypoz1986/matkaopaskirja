const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const router = express.Router();

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden' });
    req.user = user; // Attach user info to request object
    next();
  });
};

// POST Route to add a city to favorites
router.post('/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { cityName } = req.body; // Get cityName from request body

    if (!cityName) {
        return res.status(400).json({ message: 'City name is required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if city is already in favorites
        if (user.favorites.includes(cityName)) {
            return res.status(400).json({ message: 'City is already in favorites' });
        }

        // Add city to user's favorites
        user.favorites.push(cityName);
        await user.save();

        return res.status(200).json({ message: 'City added to favorites', favorites: user.favorites });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
